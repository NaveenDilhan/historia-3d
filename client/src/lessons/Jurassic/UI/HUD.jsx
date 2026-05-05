import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HUD({ current, total, visible }) {
  // Define a CSS style for the fonts. For a true "game" look, you would link
  // a font (e.g., in your HTML head or global CSS) and use its name here.
  // Standard alternatives are used below for demonstration.
  const gameyFontStack = 'Consolas, "Courier New", monospace'; // or 'Press Start 2P', cursive etc.

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          // --- STYLING UPDATES ---
          // 1. Removed: bg-[#1a120b]/80 border border-amber-900/50 rounded-2xl backdrop-blur-md shadow-lg
          // 2. Added: text-shadow for readability and 'game' effect
          className="absolute top-6 left-6 z-[150] p-4 pointer-events-auto"
          style={{ 
            textShadow: '2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
            fontFamily: gameyFontStack 
          }}
        >
          {/* --- TEXT & COLOR UPDATES --- */}
          <p className="text-white font-bold uppercase tracking-widest text-xs mb-1">
            Objectives
          </p>
          <p className="text-white text-2xl font-bold">
            {current} / {total}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}