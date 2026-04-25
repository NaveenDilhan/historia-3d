import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Github } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }); //

      const data = await res.json();

      if (res.ok) {
        // Store basic user info (but NOT the token, that's in the HTTP-only cookie)
        localStorage.setItem("userInfo", JSON.stringify(data));
        navigate("/explore"); // Redirect to main app
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to the archives.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen ancient-wall-bg flex items-center justify-center p-6 relative overflow-hidden">
      <div className="fixed inset-0 bg-radial-gradient(circle at center, transparent 0%, rgba(10, 5, 2, 0.8) 100%) pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8 cursor-pointer" onClick={() => navigate("/")}>
          <div className="flex items-center justify-center mb-4">
            {/* Replaced Icon with custom scroll.png image without the brown wrapper block */}
            <img src="assets/scroll.png" alt="Scroll Icon" className="w-14 h-14 object-contain drop-shadow-xl rounded-xl" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-amber-100 tracking-widest">HISTORIA</h1>
          <p className="text-amber-200/50 text-sm mt-2 font-body uppercase tracking-tighter">Enter the Halls of Time</p>
        </div>

        <div className="bg-[#1a120b]/80 backdrop-blur-xl border border-amber-900/40 p-8 rounded-2xl shadow-2xl">
          <form className="space-y-5" onSubmit={handleLogin}>
            
            {error && (
              <div className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-xs text-center uppercase tracking-wide">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="scholar@alexandria.edu"
                  required
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 placeholder:text-amber-900 focus:outline-none focus:border-amber-500/50 transition-all"
                />
              </div>
            </div>

            <button 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 font-bold py-3 rounded-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-600/30 disabled:opacity-50"
            >
              {isLoading ? 'Accessing Archives...' : (
                <>
                  <LogIn size={18} />
                  <span>Begin Exploration</span>
                </>
              )}
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