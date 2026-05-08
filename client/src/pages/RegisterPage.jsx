import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Lock, UserPlus, ChevronLeft } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userInfo", JSON.stringify(data));
        navigate("/explore");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError("Failed to document your existence.");
    } finally {
      setIsLoading(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen ancient-wall-bg relative flex flex-col p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
      {/* Enhanced Ambient Background */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none"
      />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(10,5,2,0.85)_100%)] pointer-events-none"></div>

      <div className="w-full max-w-lg relative z-10 m-auto py-8">
        <motion.button 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-colors mb-6 text-sm font-bold uppercase tracking-widest group w-max"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Login
        </motion.button>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#1a120b]/90 backdrop-blur-2xl border border-amber-900/40 p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden"
        >
          {/* Decorative Top Accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

          <motion.div variants={itemVariants} className="mb-10 text-center">
            <h2 className="text-4xl font-heading font-bold text-amber-100 drop-shadow-md">Create Identity</h2>
            <p className="text-amber-400/60 mt-2 text-sm uppercase tracking-wider">Become a documented scholar of human history.</p>
          </motion.div>

          <form className="space-y-6" onSubmit={handleRegister}>
            
            {error && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 bg-red-900/30 border border-red-800 rounded text-red-200 text-xs text-center uppercase tracking-wide">
                {error}
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors duration-300" />
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Leonidas" 
                    required
                    className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all duration-300 placeholder:text-amber-900/70" 
                  />
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants} className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Email</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors duration-300" />
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="leo@sparta.com" 
                    required
                    className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all duration-300 placeholder:text-amber-900/70" 
                  />
                </div>
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Secret Key (Password)</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors duration-300" />
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••••••" 
                  required
                  className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/80 focus:ring-1 focus:ring-amber-500/50 outline-none transition-all duration-300 placeholder:text-amber-900/70" 
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="flex items-start gap-3 py-2 pl-1">
              <input type="checkbox" required className="mt-1 accent-amber-600 cursor-pointer" id="terms" />
              <label htmlFor="terms" className="text-xs text-amber-200/50 leading-relaxed cursor-pointer hover:text-amber-200/80 transition-colors">
                I agree to the <span className="text-amber-500">Ancient Treaties</span> and the Preservation of Truth within the Historia archives.
              </label>
            </motion.div>

            <motion.div variants={itemVariants}>
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isLoading}
                className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-100 to-amber-200 text-amber-950 font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(253,230,138,0.2)] hover:shadow-[0_0_25px_rgba(253,230,138,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <UserPlus size={18} className="relative z-10" />
                <span className="relative z-10 tracking-wide">{isLoading ? "Forging Account..." : "Forge Account"}</span>
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-900/20 to-transparent skew-x-12"></div>
              </motion.button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}