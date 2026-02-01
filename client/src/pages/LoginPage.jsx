import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Scroll, Mail, Lock, LogIn, ChevronRight, Github } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });

  return (
    <div className="min-h-screen ancient-wall-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Vignette */}
      <div className="fixed inset-0 bg-radial-gradient(circle at center, transparent 0%, rgba(10, 5, 2, 0.8) 100%) pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Brand Header */}
        <div className="text-center mb-8 cursor-pointer" onClick={() => navigate("/")}>
          <div className="inline-block bg-amber-900/50 p-3 rounded-xl border border-amber-700/50 mb-4">
            <Scroll className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-amber-100 tracking-widest">HISTORIA</h1>
          <p className="text-amber-200/50 text-sm mt-2 font-body uppercase tracking-tighter">Enter the Halls of Time</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#1a120b]/80 backdrop-blur-xl border border-amber-900/40 p-8 rounded-2xl shadow-2xl">
          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors" />
                <input 
                  type="email" 
                  placeholder="scholar@alexandria.edu"
                  className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 placeholder:text-amber-900 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 placeholder:text-amber-900 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>

            <button className="w-full bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 font-bold py-3 rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-600/30">
              <LogIn size={18} />
              <span>Begin Exploration</span>
            </button>
          </form>

          <div className="mt-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-amber-900/30"></div>
            <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold">Or continue with</span>
            <div className="h-[1px] flex-1 bg-amber-900/30"></div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
             <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-black/20 border border-amber-900/30 hover:bg-black/40 transition-colors text-xs text-amber-200">
               <Github size={16} /> GitHub
             </button>
             <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-black/20 border border-amber-900/30 hover:bg-black/40 transition-colors text-xs text-amber-200">
               <div className="w-4 h-4 bg-amber-400 rounded-sm"></div> Google
             </button>
          </div>
        </div>

        <p className="text-center mt-8 text-amber-200/40 text-sm">
          New to the past? {" "}
          <button onClick={() => navigate("/register")} className="text-amber-500 font-bold hover:text-amber-400 transition-colors underline underline-offset-4">
            Join the Tribe
          </button>
        </p>
      </motion.div>
    </div>
  );
}