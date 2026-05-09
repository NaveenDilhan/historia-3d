import React, { useEffect, useState, useRef } from 'react';
import useEarthAI from '../hooks/useEarthAI';
import { motion, AnimatePresence } from 'framer-motion';

export default function EarthDialogueBox({ currentEra }) {
  const { narration, loading } = useEarthAI();
  const [visible, setVisible] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  const masterTimerRef = useRef(null);

  // Pre-fetch voices on mount to wake up the browser's TTS engine early
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
    };
    loadVoices();
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    return () => {
      window.__isSpeaking = false;
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (loading) {
      setVisible(false);
      setCurrentSubtitle('');
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

        const setupAndSpeak = () => {
          const voices = window.speechSynthesis.getVoices();
          
          let ukFemaleVoice = voices.find(v => 
               (v.lang === 'en-GB' || v.lang === 'en_GB') && 
               (v.name.includes('Female') || v.name.includes('Hazel') || v.name.includes('Serena') || v.name.includes('Martha') || v.name.includes('Google UK English Female'))
          );

          if (!ukFemaleVoice) ukFemaleVoice = voices.find(v => v.lang === 'en-GB' || v.name.includes('UK'));

          validSentences.forEach((text, index) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1.1; 
            if (ukFemaleVoice) utterance.voice = ukFemaleVoice;

            utterance.onstart = () => setCurrentSubtitle(text);

            if (index === validSentences.length - 1) {
              utterance.onend = () => {
                setVisible(false);
                setCurrentSubtitle('');
                window.__isSpeaking = false;
                if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
                window.dispatchEvent(new CustomEvent('narration-ended'));
              };
              utterance.onerror = () => {
                setVisible(false);
                setCurrentSubtitle('');
                window.__isSpeaking = false;
                if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
                window.dispatchEvent(new CustomEvent('narration-ended'));
              };
            }

            window.__speechUtterances.push(utterance);
            window.speechSynthesis.speak(utterance);
          });
        };

        // Robust Voice Loading Retry Loop
        let retryCount = 0;
        const trySpeak = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0 || retryCount > 10) {
                // If it fails 10 times, the browser will just use its default native voice
                setupAndSpeak();
            } else {
                retryCount++;
                setTimeout(trySpeak, 100);
            }
        };
        trySpeak();

        masterTimerRef.current = setTimeout(() => {
          setVisible(false);
          setCurrentSubtitle('');
          window.__isSpeaking = false;
          window.speechSynthesis.cancel();
          window.dispatchEvent(new CustomEvent('narration-ended'));
        }, fallbackTime);

      } else {
        setCurrentSubtitle(narration.replace(/["“”]/g, ''));
        const readTime = Math.max(4000, wordCount * 300);
        masterTimerRef.current = setTimeout(() => {
          setVisible(false);
          setCurrentSubtitle('');
          window.__isSpeaking = false;
          window.dispatchEvent(new CustomEvent('narration-ended'));
        }, readTime);
      }
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