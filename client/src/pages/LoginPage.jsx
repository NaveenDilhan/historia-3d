import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Lock, LogIn, Github, ChevronLeft } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
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
        // Send the identifier instead of just email
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userInfo", JSON.stringify(data));
        navigate("/explore");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Failed to connect to the archives.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen ancient-wall-bg relative flex flex-col p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,5,2,0.9)_100%)] pointer-events-none"></div>
      <motion.div 
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-700/10 rounded-full blur-[100px] pointer-events-none"
      />

      <div className="w-full max-w-md relative z-10 m-auto py-8">
        <motion.button 
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-colors mb-6 text-sm font-bold uppercase tracking-widest group w-max"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Home
        </motion.button>

        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="text-center mb-8 cursor-pointer flex flex-col items-center" onClick={() => navigate("/")}>
            <motion.div animate={{ y: [-8, 8, -8] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="flex flex-col items-center">
              <div className="flex items-center justify-center mb-4">
                <img src="assets/scroll.png" alt="Scroll Icon" className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(217,119,6,0.5)] rounded-xl" />
              </div>
              <img
                src="/assets/dark_brown.png" alt="Historia Banner"
                className="w-64 md:w-72 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                style={{ filter: "brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(5deg) drop-shadow(0 0 10px rgba(251, 191, 36, 0.6))" }}
              />
            </motion.div>
            <p className="text-amber-400/60 text-sm mt-4 font-body uppercase tracking-tighter letter-spacing-2">Witness the Rise of Civilization</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#1a120b]/80 backdrop-blur-xl border border-amber-900/40 p-8 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/20 to-transparent"></div>

            <form className="space-y-6" onSubmit={handleLogin}>
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-xs text-center uppercase tracking-wide">
                  {error}
                </motion.div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Username or Email</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors duration-300" />
                  <input 
                    type="text" 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="emperor44bc or jc@rome.gov"
                    required
                    className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 placeholder:text-amber-900/70 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Password</label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors duration-300" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 placeholder:text-amber-900/70 focus:outline-none focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 transition-all duration-300"
                  />
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-800 to-amber-950 text-amber-50 font-bold py-3.5 rounded-lg shadow-lg hover:from-amber-700 hover:to-amber-900 transition-all flex items-center justify-center gap-2 border border-amber-600/40 disabled:opacity-50 relative overflow-hidden group"
              >
                <div className="absolute inset-0 w-full h-full bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                {isLoading ? 'Accessing Archives...' : (
                  <>
                    <LogIn size={18} className="relative z-10" />
                    <span className="relative z-10 tracking-wide">Begin Exploration</span>
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-8 flex items-center gap-4 opacity-70">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-amber-900/60"></div>
              <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Or continue with</span>
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-amber-900/60"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
               <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-black/30 border border-amber-900/40 hover:bg-black/50 hover:border-amber-700/50 transition-all text-xs text-amber-200/80 group">
                 <Github size={16} className="group-hover:text-white transition-colors" /> GitHub
               </button>
               <button className="flex items-center justify-center gap-2 py-2.5 rounded-lg bg-black/30 border border-amber-900/40 hover:bg-black/50 hover:border-amber-700/50 transition-all text-xs text-amber-200/80 group">
                 <div className="w-4 h-4 bg-amber-500 rounded-sm group-hover:bg-amber-400 transition-colors"></div> Google
               </button>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="text-center mt-8 text-amber-200/40 text-sm">
            New to the past? {" "}
            <button onClick={() => navigate("/register")} className="text-amber-500 font-bold hover:text-amber-300 transition-colors underline underline-offset-4 decoration-amber-500/30 hover:decoration-amber-300">
              Join the Tribe
            </button>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}