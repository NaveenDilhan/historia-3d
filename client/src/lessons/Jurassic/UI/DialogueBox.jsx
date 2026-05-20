import React, { useEffect, useState, useRef } from 'react';
import useAI from '../hooks/useAI';
import { motion, AnimatePresence } from 'framer-motion';

export default function DialogueBox({ currentBiome }) {
  const { narration, loading, getNarration } = useAI();
  const [visible, setVisible] = useState(false);
  const [ambientActive, setAmbientActive] = useState(true);
  
  const masterTimerRef = useRef(null);
  const ambientTimerRef = useRef(null);

  useEffect(() => {
    const handleGeothermalClosed = () => {
      setAmbientActive(false); 
      if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current);
    };
    window.addEventListener('geothermal-modal-closed', handleGeothermalClosed);
    return () => window.removeEventListener('geothermal-modal-closed', handleGeothermalClosed);
  }, []);

  // Sync subtitle closure perfectly with audio completion
  useEffect(() => {
    const handleAudioEnded = () => {
      setVisible(false);
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
      window.dispatchEvent(new CustomEvent('narration-ended'));
    };
    
    window.addEventListener('audio-playback-ended', handleAudioEnded);
    return () => {
      window.removeEventListener('audio-playback-ended', handleAudioEnded);
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
      if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!ambientActive || visible || loading) {
      if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current);
      return;
    }

    const delay = 10000; 
    ambientTimerRef.current = setTimeout(() => {
      if (!window.__isAILoading && !window.__isSpeaking) {
        getNarration(
          `The user is exploring the ${currentBiome} biome.`, 
          `Share a fascinating, conversational fact about what the ${currentBiome} would have looked like in the Late Cretaceous period. Keep it fresh, human-like, and highly immersive.`,
          false 
        );
      }
    }, delay);

    return () => clearTimeout(ambientTimerRef.current);
  }, [visible, loading, getNarration, currentBiome, ambientActive]);

  useEffect(() => {
    if (loading) {
      setVisible(false);
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
      return;
    }

    if (!narration) {
        window.dispatchEvent(new CustomEvent('narration-ended'));
        return;
    }

    if (narration) {
      setVisible(true);
      
      // Much shorter fallback timer just in case audio fails to load
      const wordCount = narration.split(' ').length;
      const displayTime = Math.max(3000, (wordCount * 330) + 1500);

      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);

      masterTimerRef.current = setTimeout(() => {
        setVisible(false);
        window.dispatchEvent(new CustomEvent('narration-ended'));
      }, displayTime);
    }
  }, [narration, loading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="subtitle-box"
        >
          <div className="subtitle-text">
            {narration.replace(/["“”]/g, '')}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}