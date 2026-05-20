import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scroll, ChevronLeft, Scale, Feather, Gavel } from 'lucide-react';

export default function TermsPage() {
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
          className="bg-[#1a120b]/80 backdrop-blur-md border border-amber-900/50 rounded-3xl p-8 md:p-16 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
        >
          {/* Decorative Corner Elements */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-800/50 rounded-tl-3xl m-4"></div>
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-800/50 rounded-tr-3xl m-4"></div>

          {/* Header */}
          <div className="text-center mb-16 border-b border-amber-900/30 pb-12 relative z-10">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-800 to-amber-950 rounded-full flex items-center justify-center border border-amber-700/50 shadow-[0_0_30px_rgba(217,119,6,0.2)] mb-6">
              <Scroll className="w-10 h-10 text-amber-400" />
            </div>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600 mb-4 tracking-wider">
              Terms of Service
            </h1>
            <p className="text-amber-200/50 font-mono text-sm tracking-[0.2em] uppercase">User Agreement</p>
          </div>

          {/* Prose Content */}
          <div className="space-y-12 text-amber-200/70 leading-relaxed text-lg relative z-10">
            
            <section className="group">
              <h2 className="flex items-center gap-3 font-heading text-2xl text-amber-400 mb-4 group-hover:text-amber-300 transition-colors">
                <Scale className="w-6 h-6" /> 1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the Historia platform, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our website or services.
              </p>
            </section>

            <section className="group">
              <h2 className="flex items-center gap-3 font-heading text-2xl text-amber-400 mb-4 group-hover:text-amber-300 transition-colors">
                <Feather className="w-6 h-6" /> 2. User Conduct
              </h2>
              <p className="mb-4">As a user of our platform, you agree to the following rules of conduct:</p>
              <ul className="list-none space-y-3 pl-4">
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rotate-45 bg-amber-600 mt-2"></span>
                  <span><strong>Respectful Interaction:</strong> Treat other users with respect in community forums. Harassment, hate speech, or abuse will not be tolerated.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="w-2 h-2 rotate-45 bg-amber-600 mt-2"></span>
                  <span><strong>No Automated Scraping:</strong> Using automated bots, scripts, or software to scrape our 3D models, assets, or user data is strictly prohibited.</span>
                </li>
              </ul>
            </section>

            <section className="group">
              <h2 className="flex items-center gap-3 font-heading text-2xl text-amber-400 mb-4 group-hover:text-amber-300 transition-colors">
                <Gavel className="w-6 h-6" /> 3. Account Termination
              </h2>
              <p>
                We reserve the right to suspend or terminate your account at any time, without prior notice, if you violate these Terms of Service. Upon termination, your right to use the platform will immediately cease.
              </p>
            </section>
            
          </div>
        </motion.div>
      </main>
    </div>
  );
}