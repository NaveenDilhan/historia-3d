import React, { useEffect, useState, useRef } from 'react';
import useAI from '../../../hooks/useAI';
import { motion, AnimatePresence } from 'framer-motion';

export default function DialogueBox() {
  const { narration, loading, getNarration } = useAI();
  const [visible, setVisible] = useState(false);
  
  const masterTimerRef = useRef(null);
  const ambientTimerRef = useRef(null); // The new idle timer

  // 1. SCENE EXIT CLEANUP
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

  // 2. THE AMBIENT IDLE LOOP (The "Tour Guide" feature)
  useEffect(() => {
    // If the narrator is currently talking or the AI is thinking, clear the ambient timer
    if (visible || loading) {
      if (ambientTimerRef.current) clearTimeout(ambientTimerRef.current);
      return;
    }

    // If there is silence, start a countdown to trigger an unsolicited fact
    // Wait between 10 to 18 seconds before speaking again
    const delay = 10000 + Math.random() * 8000; 
    
    ambientTimerRef.current = setTimeout(() => {
      // Double check locks just to be safe
      if (!window.__isAILoading && !window.__isSpeaking) {
        getNarration(
          "The player is currently wandering through the Jurassic landscape.", 
          "Share a brand new, random, fascinating fact about the Jurassic period to keep the journey interesting."
        );
      }
    }, delay);

    return () => clearTimeout(ambientTimerRef.current);
  }, [visible, loading, getNarration]);

  // 3. NARRATION AUDIO LOGIC
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

      // Calculate a generous maximum time for the audio to finish (approx 350ms per word + 3s buffer)
      const wordCount = narration.split(' ').length;
      const maxExpectedTime = Math.max(5000, (wordCount * 350) + 3000);

      // MASTER FALLBACK TIMER
      if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
      masterTimerRef.current = setTimeout(() => {
        setVisible(false);
        window.__isSpeaking = false;
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      }, maxExpectedTime);

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel(); // Clear any leftover junk

        // Split by punctuation
        const sentences = narration.match(/[^.!?]+[.!?]*/g) || [narration];
        const validSentences = sentences.map(s => s.trim()).filter(Boolean);

        if (validSentences.length === 0) return;

        // Store utterances globally to prevent Garbage Collection
        window.__speechUtterances = []; 

        const voices = window.speechSynthesis.getVoices();
        const scholarVoice = voices.find(v => 
          v.name.includes('UK') || 
          v.name.includes('Great Britain') || 
          v.name.includes('Google UK') ||
          v.name.includes('English (United Kingdom)')
        );

        // Queue all sentences sequentially into the browser API
        validSentences.forEach((text, index) => {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.95;
          utterance.pitch = 0.8;
          if (scholarVoice) utterance.voice = scholarVoice;

          // On the VERY LAST sentence, clear the UI and locks perfectly on time
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

      } else {
        // Fallback for unsupported browsers
        if (masterTimerRef.current) clearTimeout(masterTimerRef.current);
        const readTime = Math.max(3500, wordCount * 280);
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