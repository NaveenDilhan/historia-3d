import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, Lock, UserPlus, ChevronLeft, Calendar, Brain, Compass, AtSign } from "lucide-react";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    age: "",
    experienceLevel: "Beginner",
    historicalInterests: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const availableInterests = [
    "Ancient Civilizations", "Space Exploration", "Medieval History", 
    "Paleontology", "World Wars", "Industrial Revolution"
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      historicalInterests: prev.historicalInterests.includes(interest)
        ? prev.historicalInterests.filter(i => i !== interest)
        : [...prev.historicalInterests, interest]
    }));
  };

  const handleNextStep = (e) => {
      e.preventDefault();
      if (formData.firstName && formData.lastName && formData.username && formData.email && formData.password) {
          setStep(2);
      } else {
          setError("Please fill out all identity fields.");
      }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const payload = {
          ...formData,
          age: formData.age ? parseInt(formData.age, 10) : null
      };

      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userInfo", JSON.stringify(data));
        navigate("/explore");
      } else {
        setError(data.message || "Registration failed");
        setStep(1); 
      }
    } catch (err) {
      setError("Failed to document your existence.");
      setStep(1);
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen ancient-wall-bg relative flex flex-col p-4 sm:p-6 overflow-y-auto overflow-x-hidden">
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
          onClick={() => step === 1 ? navigate("/login") : setStep(1)}
          className="flex items-center gap-2 text-amber-500/60 hover:text-amber-400 transition-colors mb-6 text-sm font-bold uppercase tracking-widest group w-max"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> 
          {step === 1 ? "Back to Login" : "Back to Identity"}
        </motion.button>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-[#1a120b]/90 backdrop-blur-2xl border border-amber-900/40 p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>

          <motion.div variants={itemVariants} className="mb-8 text-center">
            <h2 className="text-4xl font-heading font-bold text-amber-100 drop-shadow-md">
                {step === 1 ? "Create Identity" : "Scholarly Profile"}
            </h2>
            <div className="flex justify-center gap-2 mt-4">
                <div className={`h-1.5 w-12 rounded-full ${step === 1 ? 'bg-amber-500' : 'bg-amber-900/50'}`}></div>
                <div className={`h-1.5 w-12 rounded-full ${step === 2 ? 'bg-amber-500' : 'bg-amber-900/50'}`}></div>
            </div>
          </motion.div>

          {error && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-3 mb-6 bg-red-900/30 border border-red-800 rounded text-red-200 text-xs text-center uppercase tracking-wide">
                {error}
              </motion.div>
          )}

          <form className="space-y-5" onSubmit={step === 1 ? handleNextStep : handleRegister}>
            
            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div 
                        key="step1"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="space-y-5"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">First Name</label>
                                <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors" />
                                <input 
                                    type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Julius" required
                                    className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/80 outline-none transition-all placeholder:text-amber-900/70" 
                                />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Last Name</label>
                                <div className="relative group">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors" />
                                <input 
                                    type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Caesar" required
                                    className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/80 outline-none transition-all placeholder:text-amber-900/70" 
                                />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Username</label>
                                <div className="relative group">
                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors" />
                                <input 
                                    type="text" name="username" value={formData.username} onChange={handleChange} placeholder="emperor44bc" required
                                    className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/80 outline-none transition-all placeholder:text-amber-900/70" 
                                />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Email</label>
                                <div className="relative group">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors" />
                                <input 
                                    type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jc@rome.gov" required
                                    className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/80 outline-none transition-all placeholder:text-amber-900/70" 
                                />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1">Secret Key (Password)</label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors" />
                                <input 
                                type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••••••" required
                                className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/80 outline-none transition-all placeholder:text-amber-900/70" 
                                />
                            </div>
                        </div>

                        <button 
                            type="submit"
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-100 to-amber-200 text-amber-950 font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(253,230,138,0.2)] hover:shadow-[0_0_25px_rgba(253,230,138,0.4)] transition-all flex items-center justify-center gap-2 mt-6"
                        >
                            <span className="relative z-10 tracking-wide">Continue</span>
                        </button>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div 
                        key="step2"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-6"
                    >
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1 flex items-center gap-2"><Calendar size={12}/> Age (Optional)</label>
                                <input 
                                    type="number" name="age" min="1" max="120" value={formData.age} onChange={handleChange} placeholder="e.g. 24"
                                    className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 px-4 text-amber-50 focus:border-amber-500/80 outline-none transition-all placeholder:text-amber-900/70" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1 flex items-center gap-2"><Brain size={12}/> Experience</label>
                                <select 
                                    name="experienceLevel" value={formData.experienceLevel} onChange={handleChange}
                                    className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 px-4 text-amber-50 focus:border-amber-500/80 outline-none transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Beginner">Beginner Explorer</option>
                                    <option value="Enthusiast">History Enthusiast</option>
                                    <option value="Scholar">Advanced Scholar</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 ml-1 flex items-center gap-2"><Compass size={12}/> Areas of Interest</label>
                            <div className="flex flex-wrap gap-2">
                                {availableInterests.map(interest => (
                                    <button
                                        key={interest}
                                        type="button"
                                        onClick={() => handleInterestToggle(interest)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                                            formData.historicalInterests.includes(interest) 
                                            ? 'bg-amber-600/20 border-amber-500 text-amber-300' 
                                            : 'bg-black/30 border-amber-900/30 text-amber-600 hover:border-amber-700'
                                        }`}
                                    >
                                        {interest}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-start gap-3 py-2 pl-1 mt-4">
                            <input type="checkbox" required className="mt-1 accent-amber-600 cursor-pointer" id="terms" />
                            <label htmlFor="terms" className="text-xs text-amber-200/50 leading-relaxed cursor-pointer hover:text-amber-200/80 transition-colors">
                                I agree to the <span className="text-amber-500">Ancient Treaties</span> and the Preservation of Truth within the Historia archives.
                            </label>
                        </div>

                        <button 
                            type="submit"
                            disabled={isLoading}
                            className="w-full group relative overflow-hidden bg-gradient-to-r from-amber-100 to-amber-200 text-amber-950 font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(253,230,138,0.2)] hover:shadow-[0_0_25px_rgba(253,230,138,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                        >
                            <UserPlus size={18} className="relative z-10" />
                            <span className="relative z-10 tracking-wide">{isLoading ? "Forging Account..." : "Forge Account"}</span>
                            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-amber-900/20 to-transparent skew-x-12"></div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
          </form>
        </motion.div>
      </div>
    </div>
  );
}