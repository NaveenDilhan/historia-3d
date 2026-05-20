import React, { useEffect, useState, useRef } from 'react';
import useEarthAI from '../hooks/useEarthAI';
import { motion, AnimatePresence } from 'framer-motion';

export default function EarthDialogueBox({ currentEra }) {
  const { narration, loading } = useEarthAI();
  const [visible, setVisible] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  const masterTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (loading) {
      setVisible(false);
      setCurrentSubtitle('');
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
      return;
    }

    if (!narration) {
        return;
    }

    if (narration) {
      setVisible(true);
      
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);

      // KEEP YOUR UPDATE: Split the narration into clean sentences
      const rawSentences = narration.match(/.*?[.!?](?:\s|$)|.+/g) || [narration];
      const cleanSentences = rawSentences.map(s => s.replace(/["“”*]/g, '').trim()).filter(Boolean);
      
      if (cleanSentences.length === 0) return;

      // REPLACED WEB SYNTHESIS WITH SMART TIMERS
      const playSentence = (index) => {
          if (index >= cleanSentences.length) {
              setVisible(false);
              setCurrentSubtitle('');
              window.dispatchEvent(new CustomEvent('narration-ended'));
              return;
          }

          // Show the current sentence
          const text = cleanSentences[index];
          setCurrentSubtitle(text);

          // Calculate time on screen (roughly 350ms per word + a small pause, matches ElevenLabs speed)
          const wordCount = text.split(' ').length;
          const sentenceTime = Math.max(2500, (wordCount * 350) + 400);

          // Move to the next sentence when this one finishes
          masterTimerRef.current = setTimeout(() => {
              playSentence(index + 1);
          }, sentenceTime);
      };

      // Start the sentence loop
      playSentence(0);
    }
  }, [narration, loading]);

  return (
    <div className="relative w-full max-w-4xl min-h-[90px] flex justify-center items-end pb-4">
      <AnimatePresence mode="wait">
        {visible && currentSubtitle && (
          <motion.div
            key={currentSubtitle}
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute w-full text-center pointer-events-none"
          >
            <span 
               className="text-white text-xl md:text-2xl font-medium tracking-wide leading-relaxed" 
               style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 4px 16px rgba(0,0,0,0.7), 0 0 24px rgba(0,0,0,0.4)' }}
            >
              {currentSubtitle}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}