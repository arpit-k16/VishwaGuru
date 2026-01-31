import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Building2, MessageCircle, Users, Shield, Star, FileText,
    Search, Lock, ShoppingCart, User, ArrowRight
} from 'lucide-react';

const Landing = () => {
    const navigate = useNavigate();

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 100,
                damping: 12
            }
        }
    };

    const slideInLeft = {
        hidden: { x: -50, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 80,
                damping: 20
            }
        }
    };

    const slideInRight = {
        hidden: { x: 50, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: 'spring',
                stiffness: 80,
                damping: 20
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC]">
            {/* Header */}
            <motion.header
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100"
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-20">
                        {/* Logo */}
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                                <span className="text-white font-bold text-lg">V</span>
                            </div>
                            <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                                FixMyIndia / <span className="text-blue-600">VishwaGuru</span>
                            </h1>
                        </div>

                        {/* Right side icons */}
                        <div className="hidden md:flex items-center gap-6">
                            <button className="text-gray-500 hover:text-gray-900 transition-colors">
                                <Lock className="w-5 h-5" />
                            </button>
                            <button className="text-gray-500 hover:text-gray-900 transition-colors">
                                <ShoppingCart className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                <span className="text-sm font-medium text-gray-700">Gover Hiera</span>
                                <div className="w-9 h-9 bg-gray-200 rounded-full overflow-hidden border-2 border-white shadow-sm">
                                    <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Gover" alt="Profile" className="w-full h-full" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.header>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-24 items-center">
                    {/* Left Content (5 cols) */}
                    <motion.div
                        variants={slideInLeft}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-5 space-y-8"
                    >
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-[1.1] tracking-tight">
                                Empowering Citizens <br />
                                <span className="text-gray-400 font-bold">for Better Governance</span>
                            </h1>
                            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                                Report civic issues and get AI-generated solutions. Connect with officials via Telegram to actively participate in governance.
                            </p>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, translateY: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => navigate('/home')}
                            className="bg-[#2D60FF] hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-[0_10px_20px_-5px_rgba(37,99,235,0.3)] transition-all duration-300 flex items-center gap-2 group"
                        >
                            Call Action Issue
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </motion.div>

                    {/* Right Content (7 cols) */}
                    <motion.div
                        variants={slideInRight}
                        initial="hidden"
                        animate="visible"
                        className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6 relative"
                    >
                        {/* Decorative background blur */}
                        <div className="absolute -inset-10 bg-blue-50/50 rounded-full blur-3xl -z-10" />

                        <div className="space-y-6">
                            {/* DepMyIndia Card */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                onClick={() => navigate('/home')}
                                className="bg-gradient-to-r from-[#2D60FF] to-[#1E40AF] rounded-3xl p-6 text-white shadow-xl cursor-pointer relative overflow-hidden group"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <Search className="w-8 h-8" />
                                </div>
                                <div className="flex items-start gap-4 mb-8">
                                    <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                        <Building2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">DepMyIndia</h3>
                                        <p className="text-blue-100 text-sm opacity-90">Report Citizens with <br /> generated civic governance</p>
                                    </div>
                                </div>
                                <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden">
                                    <div className="h-full w-2/3 bg-white/40 rounded-full"></div>
                                </div>
                            </motion.div>

                            {/* Government Services Card */}
                            <motion.div
                                whileHover={{ y: -5 }}
                                onClick={() => navigate('/home')}
                                className="bg-white rounded-3xl p-6 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] border border-gray-100 cursor-pointer group"
                            >
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-gray-800">Government Services</h3>
                                    <div className="text-gray-400">•••</div>
                                </div>
                                <div className="bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl p-5 group-hover:border-orange-200 transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0">
                                            <MessageCircle className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-1">Question the Government</h4>
                                            <p className="text-sm text-gray-500 leading-snug">Submit queries, demand transparency, and hold officials accountable</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>

                        {/* Community Image Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="bg-gray-900 rounded-3xl overflow-hidden shadow-xl h-full min-h-[300px] relative group"
                        >
                            <img
                                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                                alt="Community"
                                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-60 transition-opacity duration-500"
                            />
                            <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                <p className="text-white font-medium mb-1">Community Action</p>
                                <p className="text-gray-300 text-sm">Join the movement</p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Bottom Features Section */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20"
                >
                    {/* Feature 1 */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.02)] text-center group cursor-pointer"
                        onClick={() => navigate('/home')}
                    >
                        <div className="w-16 h-16 mx-auto mb-6 relative">
                            <div className="absolute inset-0 bg-gray-100 rounded-2xl transform rotate-3 group-hover:rotate-12 transition-transform"></div>
                            <div className="absolute inset-0 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center relative z-10">
                                <Building2 className="w-8 h-8 text-gray-700" />
                            </div>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Public Trust</h3>
                        <p className="text-gray-500 text-sm">& Ethics</p>
                    </motion.div>

                    {/* Feature 2 (Green) */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="bg-[#4ADE80] p-8 rounded-3xl shadow-[0_10px_30px_-10px_rgba(74,222,128,0.4)] text-center group cursor-pointer relative overflow-hidden"
                        onClick={() => navigate('/home')}
                    >
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8"></div>
                        <div className="w-16 h-16 mx-auto mb-6 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-inner">
                            <MessageCircle className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-bold text-white text-lg">Civic Issues</h3>
                        <p className="text-white/80 text-sm mt-1">Report problems</p>
                    </motion.div>

                    {/* Feature 3 */}
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -5 }}
                        className="bg-white p-8 rounded-3xl border border-gray-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.02)] text-center cursor-pointer"
                        onClick={() => navigate('/home')}
                    >
                        <div className="w-16 h-16 mx-auto mb-6 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center">
                            <Star className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 mb-1">Voice Your Vote</h3>
                        <p className="text-gray-500 text-xs">Share ideas for better policies</p>
                    </motion.div>

                    {/* AI Header (Span 4th col) */}
                    <motion.div
                        variants={itemVariants}
                        className="space-y-4 flex flex-col justify-center pl-4"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                            AI for Democracy <br /> & Civic Actions
                        </h2>
                        <p className="text-gray-500 text-sm">
                            Leveraging technology for transparent governance and faster resolutions.
                        </p>
                    </motion.div>
                </motion.div>

                {/* AI Features Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-[#2D60FF] p-5 rounded-2xl flex flex-col items-center justify-center text-white aspect-square cursor-pointer shadow-lg shadow-blue-500/20"
                        onClick={() => navigate('/home')}
                    >
                        <Star className="w-8 h-8 mb-3" />
                        <span className="font-bold text-sm">Smart Solns</span>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col items-center justify-center text-gray-600 aspect-square cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate('/home')}
                    >
                        <Users className="w-8 h-8 mb-3" />
                        <span className="font-bold text-sm">Community</span>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-white border border-gray-100 p-5 rounded-2xl flex flex-col items-center justify-center text-gray-800 aspect-square cursor-pointer hover:shadow-lg transition-shadow"
                        onClick={() => navigate('/home')}
                    >
                        <Shield className="w-8 h-8 mb-3" />
                        <span className="font-bold text-sm">Transparecy</span>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="bg-[#F97316] p-5 rounded-2xl flex flex-col items-center justify-center text-white aspect-square cursor-pointer shadow-lg shadow-orange-500/20"
                        onClick={() => navigate('/home')}
                    >
                        <FileText className="w-8 h-8 mb-3" />
                        <span className="font-bold text-sm">Reports</span>
                    </motion.div>
                </div>
            </div>

            {/* Simple Footer */}
            <div className="text-center py-8 text-gray-400 text-sm border-t border-gray-100 mt-12">
                © 2024 VishwaGuru. All rights reserved.
            </div>
        </div>
    );
};

export default Landing;
