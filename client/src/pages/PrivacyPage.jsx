import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ChevronLeft, EyeOff, Database, Lock } from 'lucide-react';

export default function PrivacyPage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#150f0a] text-amber-50 font-body relative overflow-x-hidden selection:bg-amber-500/30 pb-24">
      {/* Backgrounds */}
      <div className="fixed inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none z-0"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-[#2a1b12]/50 via-[#150f0a] to-[#0a0705] pointer-events-none z-0"></div>

      {/* Navigation */}
      <nav className="relative z-20 max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-amber-500 hover:text-amber-300 transition-colors group font-heading tracking-widest text-sm"
        >
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Return to Home
        </button>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-[#1a120b]/80 backdrop-blur-md border border-amber-900/50 rounded-3xl p-8 md:p-16 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
        >
          {/* Header */}
          <div className="text-center mb-16 border-b border-amber-900/30 pb-12">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-800 to-amber-950 rounded-2xl flex items-center justify-center border border-amber-700/50 shadow-lg mb-6 rotate-3">
              <Shield className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600 mb-4 tracking-wider">
              Privacy Policy
            </h1>
            <p className="text-amber-200/50 font-mono text-sm tracking-[0.2em] uppercase">Last Updated: 2026</p>
          </div>

          {/* Prose Content */}
          <div className="space-y-12 text-amber-200/70 leading-relaxed text-lg">
            
            <section className="group">
              <h2 className="flex items-center gap-3 font-heading text-2xl text-amber-400 mb-4 group-hover:text-amber-300 transition-colors">
                <EyeOff className="w-6 h-6" /> 1. Introduction
              </h2>
              <p>
                At Historia, we are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy explains how we collect, use, and protect your data when you use our website and educational platform.
              </p>
            </section>

            <section className="group">
              <h2 className="flex items-center gap-3 font-heading text-2xl text-amber-400 mb-4 group-hover:text-amber-300 transition-colors">
                <Database className="w-6 h-6" /> 2. Information We Collect
              </h2>
              <p className="mb-4">To provide you with the best possible experience, we collect the following types of information:</p>
              <ul className="list-none space-y-3 pl-4">
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2"></span>
                  <span><strong>Account Information:</strong> When you register, we collect your username, display name, and email address to create and manage your profile.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-2"></span>
                  <span><strong>Usage Data:</strong> We collect anonymous analytics regarding which pages and 3D scenes you visit. This helps us understand what content is most engaging and how to improve our platform.</span>
                </li>
              </ul>
            </section>

            <section className="group">
              <h2 className="flex items-center gap-3 font-heading text-2xl text-amber-400 mb-4 group-hover:text-amber-300 transition-colors">
                <Lock className="w-6 h-6" /> 3. Data Security and Sharing
              </h2>
              <p>
                Your personal data is stored securely using industry-standard encryption. We do not sell, rent, or share your personal information with third-party advertisers or external companies. Your data is strictly used to maintain your account and improve your experience on Historia.
              </p>
            </section>
            
          </div>
        </motion.div>
      </main>
    </div>
  );
}