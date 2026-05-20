import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fingerprint, ChevronLeft, Cookie, Compass, ShieldAlert } from 'lucide-react';

export default function CookiePage() {
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
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-800 to-amber-950 rounded-2xl flex items-center justify-center border border-amber-700/50 shadow-[0_0_20px_rgba(217,119,6,0.3)] mb-6 transform -rotate-3">
              <Cookie className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600 mb-4 tracking-wider">
              Cookie Policy
            </h1>
            <p className="text-amber-200/50 font-mono text-sm tracking-[0.2em] uppercase">How We Use Tracking Technologies</p>
          </div>

          {/* Prose Content */}
          <div className="space-y-12 text-amber-200/70 leading-relaxed text-lg">
            
            <section className="group">
              <h2 className="flex items-center gap-3 font-heading text-2xl text-amber-400 mb-4 group-hover:text-amber-300 transition-colors">
                <Fingerprint className="w-6 h-6" /> 1. What Are Cookies?
              </h2>
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work more efficiently, as well as to provide information to the owners of the site about user preferences and behaviors.
              </p>
            </section>

            <section className="group">
              <h2 className="flex items-center gap-3 font-heading text-2xl text-amber-400 mb-4 group-hover:text-amber-300 transition-colors">
                <Compass className="w-6 h-6" /> 2. Types of Cookies We Use
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="bg-[#2a1d15]/50 border border-amber-900/30 p-6 rounded-xl">
                  <h3 className="font-heading font-bold text-amber-300 mb-2">Essential Cookies</h3>
                  <p className="text-sm">These cookies are strictly necessary for the platform to function properly. They allow you to log in, navigate the site securely, and ensure our 3D WebGL scenes load correctly.</p>
                </div>
                <div className="bg-[#2a1d15]/50 border border-amber-900/30 p-6 rounded-xl">
                  <h3 className="font-heading font-bold text-amber-300 mb-2">Analytics Cookies</h3>
                  <p className="text-sm">These help us understand how visitors interact with our website by collecting and reporting information anonymously. This data is used to improve the performance and design of Historia.</p>
                </div>
              </div>
            </section>

            <section className="group">
              <h2 className="flex items-center gap-3 font-heading text-2xl text-amber-400 mb-4 group-hover:text-amber-300 transition-colors">
                <ShieldAlert className="w-6 h-6" /> 3. Managing Your Cookies
              </h2>
              <p>
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie rights by setting or amending your web browser controls to accept or refuse cookies. Please note that if you choose to reject cookies, you may still use our website, though your access to some functionality and areas may be restricted or require you to log in repeatedly.
              </p>
            </section>
            
          </div>
        </motion.div>
      </main>
    </div>
  );
}