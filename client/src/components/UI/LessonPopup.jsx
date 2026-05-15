import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { X, Play, Award, Clock, BookOpen } from 'lucide-react';

export default function LessonPopup({ lesson, onClose, onPlay }) {
  const navigate = useNavigate();

  if (!lesson) return null;

  const medalAssetMap = {
      gold: 'medal1',
      silver: 'medal2',
      bronze: 'medal3'
  };

  const getMedalFilename = (medalName) => {
      if (!medalName) return null;
      return medalAssetMap[medalName.toLowerCase()] || medalName;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
      {/* 1. Backdrop Overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* 2. Popup Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-[#1a120b] border border-amber-900/50 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-amber-600 to-transparent" />

        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-amber-900/20 text-amber-500 hover:bg-amber-500 hover:text-amber-950 transition-all z-20"
        >
          <X size={20} />
        </button>

        <div className="p-8 md:p-10 relative z-10">
          <div className="mb-6">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <BookOpen size={16} />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Historical Archive</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-bold text-amber-100 drop-shadow-md">
              {lesson.title}
            </h2>
          </div>

          <p className="text-amber-200/60 leading-relaxed mb-8 font-body italic border-l-2 border-amber-900/50 pl-4">
            "{lesson.description}"
          </p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            
            {/* LEFT BOX: Completion / Medal */}
            <div className="bg-black/30 p-4 rounded-2xl border border-amber-900/30 flex flex-col justify-center">
              <div className="flex items-center gap-2 text-amber-500/70 mb-3">
                <Award size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Completion</span>
              </div>
              
              {lesson.medal ? (
                <div className="flex items-center gap-3">
                  <img 
                    src={`/assets/${getMedalFilename(lesson.medal)}.png`} 
                    alt={`${lesson.medal} medal`} 
                    className="w-12 h-12 object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                  />
                  <div>
                    <span className="text-xl font-heading font-bold text-amber-100 capitalize block leading-none">
                      {lesson.medal}
                    </span>
                    <span className="text-[10px] text-amber-200/40 uppercase tracking-widest">
                      Medal Earned
                    </span>
                  </div>
                </div>
              ) : (
                <div className="py-2">
                  <p className="text-[10px] text-amber-200/40 uppercase tracking-widest leading-relaxed">
                    No medal acquired yet. Play to earn.
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT BOX: Start Scene */}
            <button 
              onClick={onPlay}
              className="group relative bg-black/30 p-4 rounded-2xl border border-amber-900/30 hover:border-amber-500/50 hover:bg-amber-900/20 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-inner"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-amber-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <Play size={32} className="text-amber-500 fill-amber-500 mb-2 group-hover:scale-110 transition-transform drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-100 group-hover:text-amber-400 transition-colors">
                Start Scene
              </span>
            </button>

          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl border border-amber-900/50 text-amber-200 font-bold text-sm uppercase tracking-widest hover:bg-amber-900/20 transition-all"
            >
              Back to Map
            </button>
            <button
              onClick={() => navigate('/credits')}
              className="flex-[1.5] group relative overflow-hidden px-6 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 text-white font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              <BookOpen size={18} />
              <span>Credits</span>
            </button>
          </div>
        </div>

        <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
          <Clock size={120} className="text-amber-100 -mb-8 -mr-8" />
        </div>
      </motion.div>
    </div>
  );
}