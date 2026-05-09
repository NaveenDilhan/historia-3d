import React, { useEffect, useState, useRef } from 'react';
import useEarthAI from '../hooks/useEarthAI';
import { motion, AnimatePresence } from 'framer-motion';

export default function EarthDialogueBox({ currentEra }) {
  const { narration, loading } = useEarthAI();
  const [visible, setVisible] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  const masterTimerRef = useRef(null);

  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) window.speechSynthesis.getVoices();
    };
    loadVoices();
    if ('speechSynthesis' in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
    
    window.__speechUtterances = window.__speechUtterances || [];
    
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
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        // Extract raw sentences
        const rawSentences = narration.match(/[^.!?]+[.!?]*/g) || [narration];
        const cleanSentences = rawSentences.map(s => s.replace(/["“”]/g, '').trim()).filter(Boolean);
        
        if (cleanSentences.length === 0) return;

        const setupAndSpeak = () => {
          const voices = window.speechSynthesis.getVoices();
          
          let ukFemaleVoice = voices.find(v => 
               (v.lang === 'en-GB' || v.lang === 'en_GB') && 
               (v.name.includes('Female') || v.name.includes('Hazel') || v.name.includes('Serena') || v.name.includes('Martha'))
          );
          if (!ukFemaleVoice) ukFemaleVoice = voices.find(v => v.lang === 'en-GB' || v.name.includes('UK'));

          // Iterate over the sentences one by one
          cleanSentences.forEach((text, index) => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = 0.95;
            utterance.pitch = 1.1; 
            if (ukFemaleVoice) utterance.voice = ukFemaleVoice;

            utterance.onstart = () => {
                setCurrentSubtitle(text);
            };

            // Keep utterance in memory until it completely finishes playing
            window.__speechUtterances.push(utterance);

            const cleanup = () => {
                const utteranceIndex = window.__speechUtterances.indexOf(utterance);
                if (utteranceIndex > -1) window.__speechUtterances.splice(utteranceIndex, 1);
            };

            // If it's the very last sentence
            if (index === cleanSentences.length - 1) {
              utterance.onend = () => {
                cleanup();
                setVisible(false);
                setCurrentSubtitle('');
                window.__isSpeaking = false;
                window.dispatchEvent(new CustomEvent('narration-ended'));
              };
              utterance.onerror = () => {
                cleanup();
                setVisible(false);
                setCurrentSubtitle('');
                window.__isSpeaking = false;
                window.dispatchEvent(new CustomEvent('narration-ended'));
              };
            } else {
              utterance.onend = cleanup;
              utterance.onerror = cleanup;
            }

            window.speechSynthesis.speak(utterance);
          });
        };

        let retryCount = 0;
        const trySpeak = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0 || retryCount > 5) {
                // Micro-delay allows the browser TTS engine to reset after cancel() to prevent voice clipping
                setTimeout(setupAndSpeak, 100);
            } else {
                retryCount++;
                setTimeout(trySpeak, 50); 
            }
        };
        trySpeak();

        // Failsafe: Only triggers if the browser API completely locks up
        masterTimerRef.current = setTimeout(() => {
          if (window.__isSpeaking) {
             setVisible(false);
             setCurrentSubtitle('');
             window.__isSpeaking = false;
             window.speechSynthesis.cancel();
             window.dispatchEvent(new CustomEvent('narration-ended'));
          }
        }, Math.max(30000, wordCount * 1000));

      } else {
        // Fallback for browsers without TTS support
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