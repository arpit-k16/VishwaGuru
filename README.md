# 🌍 VishwaGuru

VishwaGuru is an AI-powered platform designed to help users analyze issues and generate actionable solutions using modern web technologies and AI models.

---

## ✨ Features

- 🤖 AI-generated action plans using Google Gemini
- ⚡ FastAPI-powered backend
- 🎨 Modern React + Vite frontend
- 📱 Telegram bot integration
- 🗄️ SQLite (dev) & PostgreSQL (prod) support
- ☁️ Flexible deployment options

---

## 🛠️ Project Setup (Local)

### 📥 Clone the Repository
```bash
git clone https://github.com/Ewocs/VishwaGuru.git
cd VishwaGuru
```

---

## ⚙️ Backend Setup

### Create Virtual Environment
```bash
# Linux/macOS
python3 -m venv venv
source venv/bin/activate

# Windows
python -m venv venv
venv\Scripts\activate
```

### Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 🔐 Environment Configuration
```bash
cp .env.example .env
```

```env
TELEGRAM_BOT_TOKEN=your_bot_token
GEMINI_API_KEY=your_api_key
DATABASE_URL=sqlite:///./data/issues.db
```

---

## 🎨 Frontend Setup
```bash
cd frontend
npm install
```

---

## 🏃‍♂️ Running Locally

| Service | Command | URL |
|------|--------|-----|
| Backend | PYTHONPATH=backend python -m uvicorn main:app --reload | http://localhost:8000 |
| Frontend | cd frontend && npm run dev | http://localhost:5173 |

### Windows Note
```bash
set PYTHONPATH=backend & python -m uvicorn main:app --reload
```

---

## ☁️ Deployment Options

- Firebase  
- Netlify + Render  
- Railway  

---

## 🛠️ Tech Stack

- React, Vite, Tailwind CSS  
- Python, FastAPI  
- SQLite, PostgreSQL  
- Google Gemini API  

---

## 📚 Documentation

- ARCHITECTURE.md  
- DEPLOYMENT_GUIDE.md  
- frontend/README.md  
- backend/README.md  

---

## 📄 License

GNU Affero General Public License v3.0 (AGPL-3.0)