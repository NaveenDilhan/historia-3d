import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, Code, Database, Palette, Music, Cpu, 
  User, Rocket, Globe, Mountain 
} from 'lucide-react';

export default function CreditsPage() {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen text-amber-50 font-body overflow-x-hidden selection:bg-amber-500/30 relative">
      
      {/* ---------------- GLOBAL STYLES ---------------- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Lato:wght@400;700&display=swap');
        .font-heading { font-family: 'Cinzel', serif; }
        .font-body { font-family: 'Lato', sans-serif; }
        .ancient-wall-bg {
          background-color: #1a120b;
          background-image: 
            radial-gradient(circle at 50% -20%, rgba(217, 119, 6, 0.15), rgba(0, 0, 0, 0.9)),
            url("https://www.transparenttextures.com/patterns/wall-4-light.png");
          background-blend-mode: screen, overlay;
          background-attachment: fixed;
        }
      `}</style>

      {/* Background Layers */}
      <div className="fixed inset-0 ancient-wall-bg z-[-2]"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/60 to-black z-[-1]"></div>

      {/* ---------------- NAVIGATION ---------------- */}
      <nav className="sticky top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto bg-[#1a120b]/80 backdrop-blur-xl border border-amber-900/30 shadow-2xl rounded-2xl px-6 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="group-hover:rotate-6 transition-transform flex items-center justify-center">
               <img src="/assets/scroll.png" alt="Scroll Icon" className="w-9 h-9 object-contain drop-shadow-md rounded-lg" onError={(e) => e.target.style.display='none'}/>
            </div>
            <img 
               src="/assets/dark_brown.png" 
               alt="Historia Banner" 
               className="h-6 md:h-8 object-contain drop-shadow-md"
               style={{ filter: "brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(5deg)" }}
            />
          </div>

          <button onClick={() => navigate(-1)} className="text-amber-500 hover:text-amber-300 flex items-center gap-2 transition-colors font-bold uppercase tracking-widest text-xs">
            <ChevronLeft size={16} /> Return to Archives
          </button>
        </div>
      </nav>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="max-w-5xl mx-auto px-6 pt-16 pb-24 relative z-10">
        
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center gap-2 text-amber-500 mb-3">
              <User size={20} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">The Architect</span>
            </div>
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-amber-100 mb-4 tracking-tight drop-shadow-xl">
              Project Credits
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-6"></div>
            <p className="text-amber-200/60 max-w-2xl mx-auto text-lg italic">
              Honoring the tools, communities, and singular dedication that brought the past back to life.
            </p>
          </motion.div>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12"
        >
          {/* PLATFORM ARCHITECT */}
          <motion.section variants={itemVariants} className="bg-gradient-to-br from-[#2a1d15]/90 to-[#150f0a]/90 backdrop-blur-xl border border-amber-600/40 rounded-3xl p-8 md:p-10 shadow-[0_0_40px_rgba(217,119,6,0.15)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/10 rounded-bl-full pointer-events-none blur-2xl"></div>
            <h3 className="flex items-center gap-3 text-2xl font-heading font-bold text-amber-400 mb-6 border-b border-amber-900/50 pb-4">
              <Code size={24} /> Sole Developer & Creator
            </h3>
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
               <div className="w-24 h-24 rounded-full border-2 border-amber-500/50 flex items-center justify-center bg-black/40 shadow-inner">
                 <User className="w-10 h-10 text-amber-500" />
               </div>
               <div>
                 <h4 className="text-3xl font-heading font-bold text-amber-100 mb-2">Naveen Wickramasinghe</h4>
                 <p className="text-amber-200/70 leading-relaxed max-w-2xl">
                   Lead Architect, 3D Engineer, and Full-Stack Developer. Responsible for designing, coding, and optimizing the entirety of the Historia platform, including the interactive WebGL environments, AI integrations, and narrative systems across all historical eras.
                 </p>
               </div>
            </div>
          </motion.section>

          <div className="w-full flex items-center justify-center gap-4 py-4 opacity-50">
             <div className="h-[1px] w-32 bg-amber-900/50"></div>
             <span className="font-heading text-amber-500 tracking-widest text-sm uppercase">Era Archives</span>
             <div className="h-[1px] w-32 bg-amber-900/50"></div>
          </div>

          {/* LESSON: JURASSIC */}
          <motion.section variants={itemVariants} className="bg-[#150f0a]/80 backdrop-blur-xl border border-amber-900/40 rounded-3xl p-8 shadow-2xl">
            <h3 className="flex items-center gap-3 text-2xl font-heading font-bold text-amber-400 mb-6 border-b border-amber-900/30 pb-4">
              <Mountain size={24} className="text-emerald-500" /> The Jurassic Period
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Palette size={14}/> 3D Models & Textures</h4>
                <ul className="space-y-3">
                  <AssetItem source="Sketchfab Community" usage="Paleontology Reference & Dinosaur Models" />
                  <AssetItem source="PolyHaven" usage="High-Fidelity Environmental Textures (Rocks, Terrain)" />
                  <AssetItem source="PolyPizza" usage="Low-Poly Base Assets (Bushes, Flora)" />
                </ul>
              </div>
              <div>
                <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Music size={14}/> Audio & Soundscapes</h4>
                <ul className="space-y-3">
                  <AssetItem source="Pixabay Audio" usage="Dinosaur Vocalizations & Impact SFX" />
                  <AssetItem source="Freesound.org" usage="Ambient Jungle Nature & Weather Effects" />
                </ul>
              </div>
            </div>
          </motion.section>

          {/* LESSON: EARTH FORMATION */}
          <motion.section variants={itemVariants} className="bg-[#150f0a]/80 backdrop-blur-xl border border-amber-900/40 rounded-3xl p-8 shadow-2xl">
            <h3 className="flex items-center gap-3 text-2xl font-heading font-bold text-amber-400 mb-6 border-b border-amber-900/30 pb-4">
              <Globe size={24} className="text-blue-500" /> Formation of Earth
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Palette size={14}/> Shaders & Visuals</h4>
                <ul className="space-y-3">
                  <AssetItem source="Custom GLSL" usage="Procedural Magma & Ocean Shaders" />
                  <AssetItem source="PolyHaven" usage="Volcanic Rock & Surface Textures" />
                </ul>
              </div>
              <div>
                <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Music size={14}/> Audio & Soundscapes</h4>
                <ul className="space-y-3">
                  <AssetItem source="Freesound.org" usage="Geological, Volcanic, and Oceanic SFX" />
                  <AssetItem source="Lofi.cafe" usage="Ambient Background Space Instrumentation" />
                </ul>
              </div>
            </div>
          </motion.section>

          {/* LESSON: MOON LANDING */}
          <motion.section variants={itemVariants} className="bg-[#150f0a]/80 backdrop-blur-xl border border-amber-900/40 rounded-3xl p-8 shadow-2xl">
            <h3 className="flex items-center gap-3 text-2xl font-heading font-bold text-amber-400 mb-6 border-b border-amber-900/30 pb-4">
              <Rocket size={24} className="text-gray-300" /> Apollo 11 Moon Landing
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Palette size={14}/> 3D Models & Textures</h4>
                <ul className="space-y-3">
                  <AssetItem source="NASA 3D Resources" usage="Apollo Rocket & Lunar Surface References" />
                  <AssetItem source="PolyPizza" usage="Low-Poly Support Assets" />
                </ul>
              </div>
              <div>
                <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Music size={14}/> Audio & Soundscapes</h4>
                <ul className="space-y-3">
                  <AssetItem source="NASA Public Archives" usage="JFK Speech & Mission Control Audio" />
                  <AssetItem source="Freesound.org" usage="Rocket Thrusters & Ambient Space" />
                </ul>
              </div>
            </div>
          </motion.section>

          <div className="w-full flex items-center justify-center gap-4 py-4 opacity-50">
             <div className="h-[1px] w-32 bg-amber-900/50"></div>
             <span className="font-heading text-amber-500 tracking-widest text-sm uppercase">Infrastructure</span>
             <div className="h-[1px] w-32 bg-amber-900/50"></div>
          </div>

          {/* PLATFORM TECHNOLOGIES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.section variants={itemVariants} className="bg-[#150f0a]/80 backdrop-blur-xl border border-amber-900/40 rounded-3xl p-8 shadow-2xl">
              <h3 className="flex items-center gap-3 text-xl font-heading font-bold text-amber-400 mb-6 border-b border-amber-900/30 pb-3">
                <Cpu size={20} /> Technology Stack
              </h3>
              <ul className="space-y-4">
                <TechItem name="React Three Fiber & Three.js" desc="Web-based 3D Rendering Engine" />
                <TechItem name="Rapier Physics" desc="Real-time 3D Physics & Collisions" />
                <TechItem name="MERN Stack" desc="MongoDB, Express, React, Node.js" />
                <TechItem name="Framer Motion & GSAP" desc="Cinematic UI Animations" />
                <TechItem name="Tailwind CSS" desc="Utility-first styling framework" />
              </ul>
            </motion.section>

            <motion.section variants={itemVariants} className="bg-[#150f0a]/80 backdrop-blur-xl border border-amber-900/40 rounded-3xl p-8 shadow-2xl">
              <h3 className="flex items-center gap-3 text-xl font-heading font-bold text-amber-400 mb-6 border-b border-amber-900/30 pb-3">
                <Database size={20} /> AI & Infrastructure
              </h3>
              <ul className="space-y-4">
                <TechItem name="OpenAI & Groq APIs" desc="Dynamic Historical Narration & NLP" />
                <TechItem name="MongoDB Atlas" desc="Cloud Database & User Progress Storage" />
                <TechItem name="KTX2 & Draco Compression" desc="High-Performance 3D Asset Optimization" />
                <TechItem name="Blender" desc="Texture Baking & 3D Modeling" />
              </ul>
            </motion.section>
          </div>

        </motion.div>
      </main>
    </div>
  );
}

function TechItem({ name, desc }) {
  return (
    <li className="flex flex-col">
      <span className="text-amber-100 font-bold">{name}</span>
      <span className="text-amber-200/50 text-xs italic">{desc}</span>
    </li>
  );
}

function AssetItem({ source, usage }) {
  return (
    <li className="flex items-start gap-2">
      <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5"></div>
      <div className="flex flex-col">
        <span className="text-amber-200 font-bold text-sm">{source}</span>
        <span className="text-amber-500/50 text-xs">{usage}</span>
      </div>
    </li>
  );
}