import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Compass, Users, User, Scroll, Globe, BookOpen, ChevronRight, Star, Map, LogIn } from "lucide-react";

// ✅ Import animations
import humanWalk from "../assets/animations/Ancient_Man.json";
import dinoRoar from "../assets/animations/T-Rex.json";
import rocketBg from "../assets/animations/Rocket_Webpage.json";

export default function HomePage() {
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  
  // --- MOCK AUTH STATE ---
  // In a real app, replace these with your Auth Context values
  const [isLoggedIn, setIsLoggedIn] = useState(false); 
  const [user, setUser] = useState({
    name: "Scholar",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" // Mock avatar
  });

  // Parallax effect for floating dust particles
  const y1 = useTransform(scrollY, [0, 1000], [0, 300]);
  const y2 = useTransform(scrollY, [0, 1000], [0, -200]);

  return (
    <div className="min-h-screen text-amber-50 font-body overflow-x-hidden selection:bg-amber-500/30">
      
      {/* ---------------- GLOBAL STYLES ---------------- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Lato:wght@400;700&display=swap');
        
        .font-heading { font-family: 'Cinzel', serif; }
        .font-body { font-family: 'Lato', sans-serif; }

        .ancient-wall-bg {
          background-color: #2a1b12;
          background-image: 
            radial-gradient(circle at 50% 30%, rgba(217, 119, 6, 0.15), rgba(0, 0, 0, 0.8)),
            url("https://www.transparenttextures.com/patterns/wall-4-light.png");
          background-blend-mode: screen, overlay;
          background-attachment: fixed;
        }

        .vignette-overlay {
          background: radial-gradient(circle at center, transparent 0%, rgba(10, 5, 2, 0.8) 100%);
          pointer-events: none;
        }

        .text-gold-gradient {
          background: linear-gradient(to bottom, #fcd34d, #d97706);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* ---------------- BACKGROUND LAYERS ---------------- */}
      <div className="fixed inset-0 ancient-wall-bg z-[-2]"></div>
      <div className="fixed inset-0 vignette-overlay z-[-1]"></div>

      {/* Parallax Particles */}
      <motion.div style={{ y: y1 }} className="fixed top-[10%] left-[5%] w-2 bg-amber-200/20 h-2 rounded-full blur-[1px] z-0" />
      <motion.div style={{ y: y2 }} className="fixed top-[40%] right-[10%] w-3 bg-amber-500/10 h-3 rounded-full blur-[2px] z-0" />

      {/* ---------------- NAVIGATION ---------------- */}
      <nav className="fixed top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto bg-[#1a120b]/70 backdrop-blur-md border border-amber-900/30 shadow-lg rounded-2xl px-6 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="bg-amber-900/50 p-2 rounded-lg border border-amber-700/50 group-hover:rotate-6 transition-transform">
              <Scroll className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-xl font-heading font-bold text-amber-100 tracking-widest drop-shadow-md">HISTORIA</h1>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink onClick={() => navigate("/explore")} icon={<Compass size={16} />} label="Explore" />
            <NavLink onClick={() => navigate("/community")} icon={<Users size={16} />} label="Community" />
            
            {/* Dynamic Auth Button */}
            {isLoggedIn ? (
              <button 
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 p-1 pr-4 bg-amber-950/40 border border-amber-500/30 rounded-full hover:bg-amber-900/50 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-full border-2 border-amber-500 overflow-hidden group-hover:border-amber-400 transition-colors">
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-amber-100">Profile</span>
              </button>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 px-6 py-2 rounded-lg font-medium text-sm hover:brightness-110 shadow-lg border border-amber-600/30 transition-all active:scale-95"
              >
                <LogIn size={16} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ---------------- HERO SECTION ---------------- */}
      <main className="pt-32 pb-20 px-4 relative z-10 max-w-7xl mx-auto">
        <div className="relative w-full min-h-[600px] flex flex-col items-center justify-center text-center px-4">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-600/10 rounded-full blur-[100px] pointer-events-none"></div>

          <div className="absolute inset-0 opacity-20 mix-blend-screen pointer-events-none -z-10">
             <Lottie animationData={rocketBg} loop autoplay className="w-full h-full object-cover scale-110" />
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative z-20 max-w-5xl mx-auto flex flex-col items-center"
          >
            <div className="relative mb-6 group">
              <img
                src="/assets/dark_brown.png" 
                alt="Historia Logo"
                className="w-72 md:w-[450px] relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                style={{ filter: "brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(5deg) drop-shadow(0 0 10px rgba(251, 191, 36, 0.6))" }}
              />

              <motion.div className="absolute -left-23 bottom-4 w-28 h-28 hidden md:block"
                initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.5 }}>
                <Lottie animationData={humanWalk} loop autoplay />
              </motion.div>
              
              <motion.div className="absolute -right-12 -top-17 w-40 h-40 hidden md:block"
                initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
                <Lottie animationData={dinoRoar} loop autoplay />
              </motion.div>
            </div>

            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="font-heading text-amber-100/90 text-xl md:text-3xl font-semibold tracking-[0.2em] mb-12 max-w-4xl leading-relaxed drop-shadow-md border-y border-amber-500/30 py-4"
            >
              WITNESS THE RISE OF CIVILIZATIONS
            </motion.h2>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/explore")}
              className="group relative overflow-hidden inline-flex items-center justify-center gap-3 px-12 py-5 bg-gradient-to-b from-amber-600 to-amber-800 text-white font-bold text-lg rounded-full shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_50px_rgba(245,158,11,0.5)] transition-all border border-amber-400/50"
            >
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"></div>
              <span className="font-heading tracking-wider relative z-20">Start Adventure</span>
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-20" />
            </motion.button>
          </motion.div>
        </div>

        {/* ---------------- STATS SECTION ---------------- */}
        <div className="relative z-30 max-w-6xl mx-auto px-4 mt-8">
          <div className="bg-[#0f0a06]/60 backdrop-blur-md rounded-2xl border border-amber-900/40 p-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center shadow-2xl">
            <StatItem number="10k+" label="Active Learners" />
            <StatItem number="500+" label="Historical Eras" />
            <StatItem number="120" label="3D Artifacts" />
            <StatItem number="4.9" label="User Rating" icon={<Star className="w-4 h-4 text-amber-400 inline -mt-1 fill-amber-400" />} />
          </div>
        </div>

        {/* ---------------- FEATURES SECTION ---------------- */}
        <div className="mt-32 mb-16 flex flex-col items-center justify-center text-center">
           <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mb-6"></div>
           <h3 className="font-heading text-4xl font-bold text-amber-100 drop-shadow-lg">
             Your Journey Through Time
           </h3>
           <p className="mt-4 text-amber-200/60 max-w-xl text-lg">Uncover the secrets of the past using the technology of the future.</p>
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32"
        >
          <FeatureCard 
            icon={<Globe className="w-8 h-8 text-emerald-400" />}
            title="Interactive Maps"
            desc="Navigate the ancient world with high-fidelity maps that evolve as you scroll through centuries."
          />
          <FeatureCard 
            icon={<BookOpen className="w-8 h-8 text-amber-400" />}
            title="Curated Stories"
            desc="Immerse yourself in narratives crafted by historians, blending accuracy with engagement."
          />
          <FeatureCard 
            icon={<Users className="w-8 h-8 text-blue-400" />}
            title="Global Tribe"
            desc="Debate theories, share discoveries, and climb the ranks of the Historia scholarly society."
          />
        </motion.div>

        {/* ---------------- CTA SECTION ---------------- */}
        <section className="relative overflow-hidden rounded-3xl border border-amber-900/50 shadow-2xl">
           <div className="absolute inset-0 bg-[#150f0a] z-0"></div>
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] mix-blend-overlay z-0"></div>
           
           <div className="relative z-10 p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-1 space-y-6 text-center md:text-left">
                 <div className="inline-block px-4 py-1 border border-amber-700 rounded-full text-xs tracking-[0.2em] uppercase text-amber-500 bg-amber-900/20">
                    Our Mission
                 </div>
                 <h3 className="text-3xl md:text-4xl font-heading font-bold text-amber-50 leading-tight">
                    History isn't just text. <br />
                    <span className="text-gold-gradient">It's an experience.</span>
                 </h3>
                 <p className="text-lg leading-relaxed text-amber-200/60 max-w-lg mx-auto md:mx-0">
                    Gone are the days of dusty textbooks. Historia uses WebGL and AI to reconstruct the past, allowing you to walk the streets of Rome.
                 </p>
                 <button className="text-amber-400 hover:text-amber-200 font-bold flex items-center justify-center md:justify-start gap-2 group transition-colors mt-4">
                    Read the Manifesto <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                 </button>
              </div>
              
              <div className="w-full md:w-1/2 h-64 bg-black/40 rounded-2xl flex items-center justify-center border border-amber-800/30 shadow-inner">
                 <div className="text-center">
                    <Map className="w-12 h-12 text-amber-800 mx-auto mb-2 opacity-50" />
                    <span className="text-amber-800/50 font-mono text-xs tracking-widest">[ ARTIFACT PREVIEW ]</span>
                 </div>
              </div>
           </div>
        </section>
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-[#120c08] text-amber-200/40 py-16 border-t border-amber-900/30 relative z-10">
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-4">
             <div className="flex items-center gap-3 text-amber-100">
               <div className="bg-amber-900/30 p-1.5 rounded border border-amber-800/50">
                 <Scroll className="w-5 h-5" />
               </div>
               <span className="font-heading font-bold text-lg tracking-wide">HISTORIA</span>
             </div>
             <p className="text-sm max-w-xs leading-relaxed">
               Preserving the past for the future. An open-source initiative to digitize human history.
             </p>
          </div>
          <div>
             <h4 className="text-amber-500 font-bold mb-6 uppercase text-xs tracking-widest">Platform</h4>
             <ul className="space-y-3 text-sm">
                <li className="hover:text-amber-200 cursor-pointer transition-colors">Explore</li>
                <li className="hover:text-amber-200 cursor-pointer transition-colors">Community</li>
                <li className="hover:text-amber-200 cursor-pointer transition-colors">Teachers</li>
             </ul>
          </div>
          <div>
             <h4 className="text-amber-500 font-bold mb-6 uppercase text-xs tracking-widest">Legal</h4>
             <ul className="space-y-3 text-sm">
                <li className="hover:text-amber-200 cursor-pointer transition-colors">Privacy Policy</li>
                <li className="hover:text-amber-200 cursor-pointer transition-colors">Terms of Service</li>
             </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ---------------- SUB-COMPONENTS ----------------

function NavLink({ icon, label, onClick }) {
  return (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 text-amber-200/70 hover:text-amber-100 font-medium transition-colors group relative"
    >
      <span className="group-hover:-translate-y-0.5 transition-transform duration-300">{icon}</span>
      <span>{label}</span>
      <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-amber-400 group-hover:w-full transition-all duration-300"></span>
    </button>
  );
}

function StatItem({ number, label, icon }) {
  return (
    <div className="flex flex-col items-center group cursor-default">
      <span className="text-3xl md:text-4xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-b from-amber-100 to-amber-600 block mb-2">
        {number} {icon}
      </span>
      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-200/50 group-hover:text-amber-200 transition-colors">
        {label}
      </span>
    </div>
  )
}

function FeatureCard({ icon, title, desc }) {
  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 40 } }
  };

  return (
    <motion.div 
      variants={cardVariants}
      whileHover={{ y: -8 }}
      className="p-8 rounded-xl bg-[#1a130e]/40 border border-amber-900/30 hover:border-amber-600/50 shadow-lg hover:shadow-2xl transition-all duration-300 group backdrop-blur-sm"
    >
      <div className="mb-6 bg-[#2a1d15] w-14 h-14 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-inner border border-amber-900/50">
        {icon}
      </div>
      <h3 className="text-xl font-heading font-bold text-amber-100 mb-3">{title}</h3>
      <p className="text-amber-200/60 leading-relaxed text-sm group-hover:text-amber-200/80 transition-colors">
        {desc}
      </p>
    </motion.div>
  );
}