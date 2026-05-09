import React, { useEffect, useState, useRef } from 'react';
import useEarthAI from '../hooks/useEarthAI';
import { motion, AnimatePresence } from 'framer-motion';

export default function EarthDialogueBox({ currentEra }) {
  const { narration, loading } = useEarthAI();
  const [visible, setVisible] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  const masterTimerRef = useRef(null);
  const currentUtteranceRef = useRef(null); 

  // Initialize and "Warm Up" the TTS Engine
  useEffect(() => {
    const loadVoices = () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.getVoices();
        
        // BUG FIX: The "Silent Warmup"
        // Playing an empty string at volume 0 forces the browser's audio context 
        // to initialize in the background. This prevents the engine from clipping 
        // the first few words of the actual first sentence it tries to read.
        const wakeUpUtterance = new SpeechSynthesisUtterance('');
        wakeUpUtterance.volume = 0;
        wakeUpUtterance.rate = 1;
        window.speechSynthesis.speak(wakeUpUtterance);
        
        // Resume catches any stuck state in certain browsers
        window.speechSynthesis.resume();
      }
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
        return;
    }

    if (narration) {
      setVisible(true);
      window.__isSpeaking = true;
      
      const wordCount = narration.split(' ').length;
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        
        // Extract raw sentences and clean up weird characters
        const rawSentences = narration.match(/[^.!?]+[.!?]*/g) || [narration];
        const cleanSentences = rawSentences.map(s => s.replace(/["“”*]/g, '').trim()).filter(Boolean);
        
        if (cleanSentences.length === 0) return;

        const setupAndSpeak = () => {
          const voices = window.speechSynthesis.getVoices();
          
          let ukFemaleVoice = voices.find(v => 
               (v.lang === 'en-GB' || v.lang === 'en_GB') && 
               (v.name.includes('Female') || v.name.includes('Hazel') || v.name.includes('Serena') || v.name.includes('Martha'))
          );
          if (!ukFemaleVoice) ukFemaleVoice = voices.find(v => v.lang === 'en-GB' || v.name.includes('UK'));

          const playSentence = (index) => {
              if (index >= cleanSentences.length || !window.__isSpeaking) {
                  setVisible(false);
                  setCurrentSubtitle('');
                  window.__isSpeaking = false;
                  window.dispatchEvent(new CustomEvent('narration-ended'));
                  return;
              }

              const text = cleanSentences[index];
              const utterance = new SpeechSynthesisUtterance(text);
              utterance.rate = 0.95;
              utterance.pitch = 1.1; 
              if (ukFemaleVoice) utterance.voice = ukFemaleVoice;

              utterance.onstart = () => {
                  setCurrentSubtitle(text);
              };

              utterance.onend = () => {
                  playSentence(index + 1);
              };

              utterance.onerror = (e) => {
                  console.warn('Speech API error:', e);
                  playSentence(index + 1); 
              };

              currentUtteranceRef.current = utterance;
              
              // BUG FIX: The "First Sentence Micro-Buffer"
              // Add a slight 150ms delay specifically before the *first* sentence.
              // This gives the audio hardware enough time to physically engage 
              // after the synthesis begins processing.
              if (index === 0) {
                  setTimeout(() => window.speechSynthesis.speak(utterance), 150);
              } else {
                  window.speechSynthesis.speak(utterance);
              }
          };

          playSentence(0);
        };

        let retryCount = 0;
        const trySpeak = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0 || retryCount > 5) {
                // Ensure there is a gap between the silent warmup and the real text
                setTimeout(setupAndSpeak, 250);
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