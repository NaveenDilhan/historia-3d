import React, { useEffect, useState, useRef } from 'react';
import useEarthAI from '../hooks/useEarthAI';
import { motion, AnimatePresence } from 'framer-motion';

class PauseableTimer {
  constructor() {
    this.timerId = null;
    this.start = 0;
    this.remaining = 0;
    this.cb = null;
    this.isPaused = false;
  }
  set(callback, delay, currentlyPaused) {
    this.clear();
    this.cb = callback;
    this.remaining = delay;
    this.start = Date.now();
    this.isPaused = currentlyPaused;
    if (!this.isPaused) this.timerId = setTimeout(this.cb, this.remaining);
  }
  pause() {
    if (!this.isPaused && this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
      this.remaining -= Date.now() - this.start;
      this.isPaused = true;
    }
  }
  resume() {
    if (this.isPaused && this.remaining > 0 && this.cb) {
      this.isPaused = false;
      this.start = Date.now();
      this.timerId = setTimeout(this.cb, this.remaining);
    }
  }
  clear() {
    if (this.timerId) clearTimeout(this.timerId);
    this.timerId = null;
    this.cb = null;
  }
}

export default function EarthDialogueBox({ currentEra }) {
  const { narration, loading } = useEarthAI();
  const [visible, setVisible] = useState(false);
  const [currentSubtitle, setCurrentSubtitle] = useState('');
  
  // Settings States
  const [isSubsMuted, setIsSubsMuted] = useState(window.__subtitlesMuted || false);
  
  // CHANGED DEFAULT TO 'small'
  const [subSize, setSubSize] = useState(window.__subSize || 'small');
  
  const masterTimer = useRef(new PauseableTimer()).current;
  const isGlobalPaused = useRef(false);

  // Settings Listeners
  useEffect(() => {
    const handleSubToggle = (e) => setIsSubsMuted(e.detail);
    const handleSizeChange = (e) => setSubSize(e.detail);
    
    window.addEventListener('subtitles-toggled', handleSubToggle);
    window.addEventListener('subtitle-size-changed', handleSizeChange);
    return () => {
      window.removeEventListener('subtitles-toggled', handleSubToggle);
      window.removeEventListener('subtitle-size-changed', handleSizeChange);
    };
  }, []);

  // Listen for global pause/resume
  useEffect(() => {
    const handlePauseToggle = (e) => {
      const shouldPause = e.detail;
      isGlobalPaused.current = shouldPause;
      if (shouldPause) {
        masterTimer.pause();
      } else {
        masterTimer.resume();
      }
    };

    const handleStop = () => {
      masterTimer.clear();
      setVisible(false);
      setCurrentSubtitle('');
    };

    window.addEventListener('narration-pause', handlePauseToggle);
    window.addEventListener('narration-stop', handleStop);
    return () => {
      window.removeEventListener('narration-pause', handlePauseToggle);
      window.removeEventListener('narration-stop', handleStop);
      masterTimer.clear();
    };
  }, [masterTimer]);

  useEffect(() => {
    const handleAudioEnded = () => {
      setVisible(false);
      setCurrentSubtitle('');
      masterTimer.clear();
      window.dispatchEvent(new CustomEvent('narration-ended'));
    };
    
    window.addEventListener('audio-playback-ended', handleAudioEnded);
    return () => {
      window.removeEventListener('audio-playback-ended', handleAudioEnded);
      masterTimer.clear();
    };
  }, [masterTimer]);

  useEffect(() => {
    if (loading) {
      setVisible(false);
      setCurrentSubtitle('');
      masterTimer.clear();
      return;
    }

    if (!narration) return;

    if (narration) {
      setVisible(true);
      masterTimer.clear();

      const rawSentences = narration.match(/.*?[.!?](?:\s|$)|.+/g) || [narration];
      const cleanSentences = rawSentences.map(s => s.replace(/["“”*]/g, '').trim()).filter(Boolean);
      
      if (cleanSentences.length === 0) return;

      const playSentence = (index) => {
          if (index >= cleanSentences.length) {
              setVisible(false);
              setCurrentSubtitle('');
              window.dispatchEvent(new CustomEvent('narration-ended'));
              return;
          }

          const text = cleanSentences[index];
          setCurrentSubtitle(text);

          const wordCount = text.split(' ').length;
          const sentenceTime = Math.max(2000, (wordCount * 330) + 300);

          masterTimer.set(() => {
              playSentence(index + 1);
          }, sentenceTime, isGlobalPaused.current);
      };

      playSentence(0);
    }
  }, [narration, loading, masterTimer]);

  const getSizeClasses = () => {
    if (subSize === 'small') return 'text-lg md:text-xl';
    if (subSize === 'large') return 'text-3xl md:text-5xl';
    return 'text-xl md:text-3xl'; // medium
  };

  return (
    <div className="relative w-full max-w-4xl min-h-[90px] flex justify-center items-end pb-4">
      <AnimatePresence mode="wait">
        {/* Hide perfectly if subtitles are disabled */}
        {visible && currentSubtitle && !isSubsMuted && (
          <motion.div
            key={currentSubtitle}
            initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(3px)' }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="absolute w-full text-center pointer-events-none"
          >
            <span 
               className={`text-white font-medium tracking-wide leading-relaxed transition-all duration-300 ${getSizeClasses()}`} 
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