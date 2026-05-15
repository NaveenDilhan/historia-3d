import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HUD({ current, total, visible }) {

  const gameyFontStack = 'Consolas, "Courier New", monospace'; 

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.5, ease: "easeOut" }}

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