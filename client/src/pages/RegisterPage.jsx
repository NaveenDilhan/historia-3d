import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Scroll, User, Mail, Lock, UserPlus, ChevronLeft } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen ancient-wall-bg flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <button 
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-colors mb-6 text-sm font-bold uppercase tracking-widest"
        >
          <ChevronLeft size={16} /> Back to Login
        </button>

        <div className="bg-[#1a120b]/90 backdrop-blur-2xl border border-amber-900/40 p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <div className="mb-10">
            <h2 className="text-3xl font-heading font-bold text-amber-100">Create Identity</h2>
            <p className="text-amber-200/50 mt-1">Become a documented scholar of human history.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
                  <input type="text" placeholder="Leonidas" className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
                  <input type="email" placeholder="leo@sparta.com" className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Secret Key (Password)</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
                <input type="password" placeholder="••••••••••••" className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all" />
              </div>
            </div>

            <div className="flex items-start gap-3 py-2">
              <input type="checkbox" className="mt-1 accent-amber-600" id="terms" />
              <label htmlFor="terms" className="text-xs text-amber-200/40 leading-relaxed">
                I agree to the <span className="text-amber-500">Ancient Treaties</span> and the Preservation of Truth within the Historia archives.
              </label>
            </div>

            <button className="w-full group relative overflow-hidden bg-amber-100 text-amber-950 font-bold py-4 rounded-xl shadow-xl hover:bg-white transition-all flex items-center justify-center gap-2">
              <UserPlus size={18} />
              <span>Forge Account</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-900/10 to-transparent skew-x-12"></div>
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}