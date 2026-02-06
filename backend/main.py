from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Depends, BackgroundTasks, Request, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from contextlib import asynccontextmanager
from functools import lru_cache
from typing import List, Optional, Any
from PIL import Image
import mimetypes

import json
import os
import sys
from pathlib import Path

# Add project root to sys.path to ensure 'backend.*' imports work
# This handles cases where PYTHONPATH is set to 'backend' (e.g. on Render)
current_file = Path(__file__).resolve()
backend_dir = current_file.parent
repo_root = backend_dir.parent

if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.concurrency import run_in_threadpool
from contextlib import asynccontextmanager
import httpx
import logging
import time
from pywebpush import webpush, WebPushException
try:
    import magic
except ImportError:
    magic = None
import httpx
from async_lru import alru_cache

from backend.cache import recent_issues_cache, user_upload_cache
from backend.database import engine, Base, SessionLocal, get_db
from backend.models import Issue, PushSubscription, Grievance, EscalationAudit, Jurisdiction
from backend.schemas import (
    IssueResponse, IssueSummaryResponse, IssueCreateRequest, IssueCreateResponse, ChatRequest, ChatResponse,
    VoteRequest, VoteResponse, DetectionResponse, UrgencyAnalysisRequest,
    UrgencyAnalysisResponse, HealthResponse, MLStatusResponse, ResponsibilityMapResponse,
    ErrorResponse, SuccessResponse, StatsResponse, IssueCategory, IssueStatus,
    IssueStatusUpdateRequest, IssueStatusUpdateResponse,
    PushSubscriptionRequest, PushSubscriptionResponse,
    NearbyIssueResponse, DeduplicationCheckResponse, IssueCreateWithDeduplicationResponse,
    LeaderboardResponse, LeaderboardEntry,
    EscalationAuditResponse, GrievanceSummaryResponse, EscalationStatsResponse
)
from backend.exceptions import EXCEPTION_HANDLERS
from backend.database import Base, engine, get_db, SessionLocal
from backend.models import Issue
from backend.ai_factory import create_all_ai_services
from backend.ai_interfaces import initialize_ai_services
from backend.bot import start_bot_thread, stop_bot_thread
from backend.init_db import migrate_db
from backend.maharashtra_locator import load_maharashtra_pincode_data, load_maharashtra_mla_data
from backend.exceptions import EXCEPTION_HANDLERS
from backend.routers import issues, detection, grievances, utility
from backend.grievance_service import GrievanceService
import backend.dependencies

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if magic is None:
    logger.warning(
        "python-magic is not available; falling back to content_type and "
        "mimetypes-based detection for uploads."
    )

# Shared HTTP Client for cached functions
SHARED_HTTP_CLIENT: Optional[httpx.AsyncClient] = None

# File upload validation constants
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB (increased for better user experience)
ALLOWED_MIME_TYPES = {
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff'
}

# User upload limits
UPLOAD_LIMIT_PER_USER = 5  # max uploads per user per hour
UPLOAD_LIMIT_PER_IP = 10  # max uploads per IP per hour

# Image processing cache to avoid duplicate API calls
# Replaced custom cache with async_lru for better performance and memory management

def check_upload_limits(identifier: str, limit: int) -> None:
    """
    Check if the user/IP has exceeded upload limits using thread-safe cache.
    """
    current_uploads = user_upload_cache.get(identifier) or []
    now = datetime.now()
    one_hour_ago = now - timedelta(hours=1)
    
    # Filter out old timestamps (older than 1 hour)
    recent_uploads = [ts for ts in current_uploads if ts > one_hour_ago]
    
    if len(recent_uploads) >= limit:
        raise HTTPException(
            status_code=429,
            detail=f"Upload limit exceeded. Maximum {limit} uploads per hour allowed."
        )
    
    # Add current timestamp and update cache atomically
    recent_uploads.append(now)
    user_upload_cache.set(recent_uploads, identifier)

def _validate_uploaded_file_sync(file: UploadFile) -> None:
    """
    Synchronous validation logic to be run in a threadpool.
    
    Security measures:
    - File size limits
    - MIME type validation using content detection
    - Image content validation using PIL
    - TODO: Add virus/malware scanning (consider integrating ClamAV or similar)
    """
    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413, 
            detail=f"File too large. Maximum size allowed is {MAX_FILE_SIZE // (1024*1024)}MB"
        )
    
    # Check MIME type from content using python-magic when available
    detected_mime: Optional[str] = None
    try:
        if magic is not None:
            # Read first 1024 bytes for MIME detection
            file_content = file.file.read(1024)
            file.file.seek(0)  # Reset file pointer
            detected_mime = magic.from_buffer(file_content, mime=True)
    except Exception as mime_error:
        logger.warning(
            f"MIME detection via python-magic failed for {file.filename}: {mime_error}. "
            "Falling back to content_type/mimetypes.",
            exc_info=True,
        )
        file.file.seek(0)

    if not detected_mime:
        # Fallback: trust FastAPI's content_type header or guess from filename
        detected_mime = file.content_type or mimetypes.guess_type(file.filename or "")[0]

    if not detected_mime:
        raise HTTPException(
            status_code=400,
            detail="Unable to detect file type. Only image files are allowed."
        )

    if detected_mime not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Only image files are allowed. Detected: {detected_mime}"
        )

    # Additional content validation: Try to open with PIL to ensure it's a valid image
    try:
        img = Image.open(file.file)
        img.verify()  # Verify the image is not corrupted
        file.file.seek(0)  # Reset after PIL operations

        # Resize large images for better performance
        img = Image.open(file.file)
        if img.width > 1024 or img.height > 1024:
            # Calculate new size maintaining aspect ratio
            ratio = min(1024 / img.width, 1024 / img.height)
            new_width = int(img.width * ratio)
            new_height = int(img.height * ratio)

            img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)

            # Save resized image back to file
            output = io.BytesIO()
            img.save(output, format=img.format or 'JPEG', quality=85)

            # Record the correct size before rewinding buffer
            resized_size = output.tell()
            output.seek(0)

            # Replace file content
            file.file = output
            file.size = resized_size

    except Exception as pil_error:
        logger.error(f"PIL validation failed for {file.filename}: {pil_error}")
        raise HTTPException(
            status_code=400,
            detail="Invalid image file. The file appears to be corrupted or not a valid image."
        )

async def validate_uploaded_file(file: UploadFile) -> None:
    """
    Validate uploaded file for security and safety (async wrapper).

    Args:
        file: The uploaded file to validate

    Raises:
        HTTPException: If validation fails
    """
    await run_in_threadpool(_validate_uploaded_file_sync, file)

async def process_and_detect(image: UploadFile, detection_func) -> DetectionResponse:
    """
    Helper to process uploaded image and run detection.
    Handles validation, loading, and error handling.
    """
    # Validate uploaded file
    await validate_uploaded_file(image)

    # Convert to PIL Image directly from file object to save memory
    try:
        pil_image = await run_in_threadpool(Image.open, image.file)
        # Validate image for processing
        await run_in_threadpool(validate_image_for_processing, pil_image)
    except HTTPException:
        raise  # Re-raise HTTP exceptions from validation
    except Exception as e:
        logger.error(f"Invalid image file during processing: {e}", exc_info=True)
        raise HTTPException(status_code=400, detail="Invalid image file")

    # Run detection
    try:
        detections = await detection_func(pil_image)
        return DetectionResponse(detections=detections)
    except Exception as e:
        logger.error(f"Detection error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Detection service temporarily unavailable")

# Create tables if they don't exist
Base.metadata.create_all(bind=engine)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize Shared HTTP Client for external APIs (Connection Pooling)
    app.state.http_client = httpx.AsyncClient()
    # Set global shared client in dependencies for cached functions
    backend.dependencies.SHARED_HTTP_CLIENT = app.state.http_client
    logger.info("Shared HTTP Client initialized.")

    # Startup: Database setup (Blocking but necessary for app consistency)
    try:
        await run_in_threadpool(Base.metadata.create_all, bind=engine)
        await run_in_threadpool(migrate_db)
        logger.info("Database initialized successfully.")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}", exc_info=True)
        # We continue to allow health checks even if DB has issues (for debugging)

    # Startup: Initialize Grievance Service (needed for escalation engine)
    try:
        grievance_service = GrievanceService()
        app.state.grievance_service = grievance_service
        logger.info("Grievance service initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing grievance service: {e}", exc_info=True)

    # Launch background tasks that are non-blocking for startup/health-check
    asyncio.create_task(background_initialization(app))
    
    yield
    
    # Shutdown: Close Shared HTTP Client
    if app.state.http_client:
        await app.state.http_client.aclose()
    logger.info("Shared HTTP Client closed.")

    # Shutdown: Stop Telegram Bot thread
    try:
        await run_in_threadpool(stop_bot_thread)
        logger.info("Telegram bot thread stopped.")
    except Exception as e:
        logger.error(f"Error stopping bot thread: {e}")

app = FastAPI(
    title="VishwaGuru Backend",
    description="AI-powered civic issue reporting and resolution platform",
    version="1.0.0",
    lifespan=lifespan
)

# Add centralized exception handlers
for exception_type, handler in EXCEPTION_HANDLERS.items():
    app.add_exception_handler(exception_type, handler)

# CORS Configuration - Security Enhanced
frontend_url = os.environ.get("FRONTEND_URL")
is_production = os.environ.get("ENVIRONMENT", "").lower() == "production"

if not frontend_url:
    if is_production:
        raise ValueError(
            "FRONTEND_URL environment variable is required for security in production. "
            "Set it to your frontend URL (e.g., https://your-app.netlify.app)."
        )
    else:
        logger.warning("FRONTEND_URL not set. Defaulting to http://localhost:5173 for development.")
        frontend_url = "http://localhost:5173"

if not (frontend_url.startswith("http://") or frontend_url.startswith("https://")):
    raise ValueError(
        f"FRONTEND_URL must be a valid HTTP/HTTPS URL. Got: {frontend_url}"
    )

allowed_origins = [frontend_url]

if not is_production:
    dev_origins = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://localhost:8080",
    ]
    allowed_origins.extend(dev_origins)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=500)

# Include Modular Routers
app.include_router(issues.router, tags=["Issues"])
app.include_router(detection.router, tags=["Detection"])
app.include_router(grievances.router, tags=["Grievances"])
app.include_router(utility.router, tags=["Utility"])

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/")
def root():
    return {
        "status": "ok",
        "service": "VishwaGuru API",
        "version": "1.0.0"
    }
