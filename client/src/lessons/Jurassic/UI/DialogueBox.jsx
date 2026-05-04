import React, { useEffect, useState, useRef } from 'react';
import useAI from '../../../hooks/useAI';
import { motion, AnimatePresence } from 'framer-motion';

export default function DialogueBox({ currentBiome }) {
  const { narration, loading, getNarration } = useAI();
  const [visible, setVisible] = useState(false);
  const masterTimerRef = useRef(null);
  const ambientTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      window.__isSpeaking = false;
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
      if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current);
    };
  }, []);

  // THE 10-SECOND AMBIENT LOOP
  useEffect(() => {
    if (visible || loading) {
      if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current);
      return;
    }

    const delay = 10000; // Exactly 10 seconds
    
    ambientTimerRef.current = setTimeout(() => {
      if (!window.__isAILoading && !window.__isSpeaking) {
        getNarration(
          `The player is exploring the ${currentBiome} biome.`, 
          `Share a fascinating, conversational fact about what the ${currentBiome} would have looked like in the Late Cretaceous period. Keep it fresh, human-like, and highly immersive.`,
          false // Normal ambient facts do not force-interrupt
        );
      }
    }, delay);

    return () => clearTimeout(ambientTimerRef.current);
  }, [visible, loading, getNarration, currentBiome]);

  // CUTOFF PREVENTION & AUDIO ENGINE
  useEffect(() => {
    if (loading) {
      setVisible(false);
      window.__isSpeaking = false;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
      return;
    }

    if (narration) {
      setVisible(true);
      window.__isSpeaking = true;
      
      const wordCount = narration.split(' ').length;
      const fallbackTime = Math.max(8000, (wordCount * 600) + 5000);

      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); 
        
        const sentences = narration.match(/[^.!?]+[.!?]*/g) || [narration];
        const validSentences = sentences.map(s => s.trim()).filter(Boolean);
        
        if (validSentences.length === 0) return;

        // Global array prevents Chrome Garbage Collection bug from muting audio
        window.__speechUtterances = []; 

        const voices = window.speechSynthesis.getVoices();
        const scholarVoice = voices.find(v => 
           v.name.includes('UK') || 
           v.name.includes('Great Britain') || 
           v.name.includes('Google UK') ||
           v.name.includes('English (United Kingdom)')
        );

        validSentences.forEach((text, index) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          utterance.pitch = 0.8;
          if (scholarVoice) utterance.voice = scholarVoice;

          // Strictly use native onend so it waits until the audio completely finishes
          if (index === validSentences.length - 1) {
            utterance.onend = () => {
              setVisible(false);
              window.__isSpeaking = false;
              if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
            };
            utterance.onerror = () => {
              setVisible(false);
              window.__isSpeaking = false;
              if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
            };
          }

          window.__speechUtterances.push(utterance);
          window.speechSynthesis.speak(utterance);
        });

        // Failsafe timer just in case browser API bugs out
        masterTimerRef.current = setTimeout(() => {
          setVisible(false);
          window.__isSpeaking = false;
          window.speechSynthesis.cancel();
        }, fallbackTime);

      } else {
        const readTime = Math.max(4000, wordCount * 300);
        masterTimerRef.current = setTimeout(() => {
          setVisible(false);
          window.__isSpeaking = false;
        }, readTime);
      }
    }
  }, [narration, loading]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="subtitle-box"
        >
          <div className="subtitle-text">
            {narration}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}