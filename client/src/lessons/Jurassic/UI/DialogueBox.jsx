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

  // CUTOFF PREVENTION & AUDIO ENGINE
  useEffect(() => {
    if (loading) {
      setVisible(false);
      window.__isSpeaking = false;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
      return;
    }

    if (!narration) {
        window.dispatchEvent(new CustomEvent('narration-ended'));
        return;
    }

    if (narration) {
      setVisible(true);
      window.__isSpeaking = true;
      
      const wordCount = narration.split(' ').length;
      const fallbackTime = Math.max(8000, (wordCount * 800) + 5000);

      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        const sentences = narration.match(/[^.!?]+[.!?]*/g) || [narration];

        const validSentences = sentences.map(s => s.replace(/["“”]/g, '').trim()).filter(Boolean);
        
        if (validSentences.length === 0) return;

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

          if (index === validSentences.length - 1) {
            utterance.onend = () => {
              setVisible(false);
              window.__isSpeaking = false;
              if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
              window.dispatchEvent(new CustomEvent('narration-ended'));
            };
            utterance.onerror = () => {
              setVisible(false);
              window.__isSpeaking = false;
              if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
              window.dispatchEvent(new CustomEvent('narration-ended'));
            };
          }

          window.__speechUtterances.push(utterance);
          window.speechSynthesis.speak(utterance);
        });

        masterTimerRef.current = setTimeout(() => {
          setVisible(false);
          window.__isSpeaking = false;
          window.speechSynthesis.cancel();
          window.dispatchEvent(new CustomEvent('narration-ended'));
        }, fallbackTime);

      } else {
        const readTime = Math.max(4000, wordCount * 300);
        masterTimerRef.current = setTimeout(() => {
          setVisible(false);
          window.__isSpeaking = false;
          window.dispatchEvent(new CustomEvent('narration-ended'));
        }, readTime);
      }
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