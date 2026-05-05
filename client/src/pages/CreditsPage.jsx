import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronLeft, Code, Database, Palette, Music, Cpu, Users } from 'lucide-react';

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
               <img src="/assets/scroll.png" alt="Scroll Icon" className="w-9 h-9 object-contain rounded-lg" onError={(e) => e.target.style.display='none'}/>
            </div>
            <h1 className="text-xl font-heading font-bold text-amber-100 tracking-widest">HISTORIA</h1>
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
              <Users size={20} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">The Architects</span>
            </div>
            <h2 className="font-heading text-4xl md:text-6xl font-bold text-amber-100 mb-4 tracking-tight drop-shadow-xl">
              Project Credits
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-6"></div>
            <p className="text-amber-200/60 max-w-2xl mx-auto text-lg italic">
              Honoring the scholars, engineers, and artisans who brought the past back to life.
            </p>
          </motion.div>
        </header>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* DEVELOPMENT TEAM */}
          <motion.section variants={itemVariants} className="bg-[#150f0a]/80 backdrop-blur-xl border border-amber-900/40 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-600/5 rounded-bl-full pointer-events-none"></div>
            <h3 className="flex items-center gap-3 text-2xl font-heading font-bold text-amber-400 mb-8 border-b border-amber-900/30 pb-4">
              <Code size={24} /> Core Development Team
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CreditItem title="Lead Architect & 3D Engineer" name="Naveen Dilhan Wickramasinghe" />
              <CreditItem title="Co-Host & Collaborator" name="Ranepura Rasanjana" />
              <CreditItem title="Agile Lead" name="Wellewatte Vitharana" />
              <CreditItem title="Task Manager" name="Karunarathna Karunarathna" />
              <CreditItem title="Systems Engineer" name="Shenon Lekamge" />
              <CreditItem title="Database Architect" name="Alabada Silva" />
            </div>
          </motion.section>

          {/* TECHNOLOGIES */}
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

          {/* ASSETS & MEDIA */}
          <motion.section variants={itemVariants} className="bg-[#150f0a]/80 backdrop-blur-xl border border-amber-900/40 rounded-3xl p-8 md:p-10 shadow-2xl">
            <h3 className="flex items-center gap-3 text-2xl font-heading font-bold text-amber-400 mb-8 border-b border-amber-900/30 pb-4">
              <Palette size={24} /> Artistic Assets & Media
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Palette size={14}/> 3D Models & Textures</h4>
                <ul className="space-y-3">
                  <AssetItem source="PolyHaven" usage="High-Fidelity Environmental Textures" />
                  <AssetItem source="PolyPizza" usage="Low-Poly Base Assets" />
                  <AssetItem source="Sketchfab Community" usage="Paleontology Reference Models" />
                </ul>
              </div>
              <div>
                <h4 className="text-amber-500 font-bold uppercase tracking-widest text-xs mb-4 flex items-center gap-2"><Music size={14}/> Audio & Soundscapes</h4>
                <ul className="space-y-3">
                  <AssetItem source="Freesound.org" usage="Ambient Nature & Weather Effects" />
                  <AssetItem source="Pixabay Audio" usage="Dinosaur Vocalizations & Impact SFX" />
                  <AssetItem source="Lofi.cafe" usage="UI & Background Instrumentation" />
                </ul>
              </div>
            </div>
          </motion.section>

        </motion.div>
      </main>
    </div>
  );
}

function CreditItem({ title, name }) {
  return (
    <div className="flex flex-col p-4 rounded-xl bg-black/20 border border-amber-900/20 hover:border-amber-500/30 transition-colors">
      <span className="text-[10px] uppercase tracking-widest text-amber-600 font-bold mb-1">{title}</span>
      <span className="text-lg font-heading font-bold text-amber-100">{name}</span>
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