import React from 'react';
import { motion } from 'framer-motion';
import { X, Play, Award, BarChart3, Clock, BookOpen } from 'lucide-react';

export default function LessonPopup({ lesson, onClose, onPlay }) {
  if (!lesson) return null;

  // Map the string values to their respective filenames
  const medalAssetMap = {
      gold: 'medal1',
      silver: 'medal2',
      bronze: 'medal3'
  };

  // Safely resolve the filename, defaulting to the raw prop if no match is found
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

        {lesson.medal && (
          <div className="absolute top-6 right-16 z-20 flex items-center justify-center bg-[#1a120b]/80 p-2 rounded-full border border-amber-500/30 backdrop-blur-md shadow-lg">
             <img 
                src={`/assets/${getMedalFilename(lesson.medal)}.png`} 
                alt={`${lesson.medal} medal`} 
                className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
             />
          </div>
        )}

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
            <div className="bg-black/30 p-4 rounded-2xl border border-amber-900/30">
              <div className="flex items-center gap-2 text-amber-500/70 mb-2">
                <BarChart3 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Mastery</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-heading font-bold text-amber-100">{lesson.progress}%</span>
              </div>
              <div className="w-full bg-amber-900/30 h-1 rounded-full mt-2 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${lesson.progress}%` }}
                  className="h-full bg-amber-500" 
                />
              </div>
            </div>
            <div className="bg-black/30 p-4 rounded-2xl border border-amber-900/30">
              <div className="flex items-center gap-2 text-amber-500/70 mb-2">
                <Award size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider">Relics</span>
              </div>
              <span className="text-2xl font-heading font-bold text-amber-100">{lesson.achievements}</span>
              <p className="text-[10px] text-amber-200/30 mt-1 uppercase">Earned Artifacts</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-4 rounded-xl border border-amber-900/50 text-amber-200 font-bold text-sm uppercase tracking-widest hover:bg-amber-900/20 transition-all"
            >
              Back to Map
            </button>
            <button
              onClick={onPlay}
              className="flex-[1.5] group relative overflow-hidden px-6 py-4 rounded-xl bg-gradient-to-r from-amber-600 to-amber-800 text-white font-bold text-sm uppercase tracking-widest shadow-lg hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
              <Play size={18} className="fill-current" />
              <span>Enter Simulation</span>
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