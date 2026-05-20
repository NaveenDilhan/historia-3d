import React, { useEffect, useState, useRef } from 'react';
import useAI from '../hooks/useAI';
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

export default function DialogueBox({ currentBiome }) {
  const { narration, loading, getNarration } = useAI();
  const [visible, setVisible] = useState(false);
  const [ambientActive, setAmbientActive] = useState(true);
  
  // New States for Settings
  const [isSubsMuted, setIsSubsMuted] = useState(window.__subtitlesMuted || false);
  
  // CHANGED DEFAULT TO 'small'
  const [subSize, setSubSize] = useState(window.__subSize || 'small');
  
  const masterTimer = useRef(new PauseableTimer()).current;
  const ambientTimer = useRef(new PauseableTimer()).current;
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
        ambientTimer.pause();
      } else {
        masterTimer.resume();
        ambientTimer.resume();
      }
    };

    const handleStop = () => {
      masterTimer.clear();
      ambientTimer.clear();
      setVisible(false);
    };

    window.addEventListener('narration-pause', handlePauseToggle);
    window.addEventListener('narration-stop', handleStop);
    return () => {
      window.removeEventListener('narration-pause', handlePauseToggle);
      window.removeEventListener('narration-stop', handleStop);
      masterTimer.clear();
      ambientTimer.clear();
    };
  }, [masterTimer, ambientTimer]);

  useEffect(() => {
    const handleGeothermalClosed = () => {
      setAmbientActive(false); 
      ambientTimer.clear();
    };
    window.addEventListener('geothermal-modal-closed', handleGeothermalClosed);
    return () => window.removeEventListener('geothermal-modal-closed', handleGeothermalClosed);
  }, [ambientTimer]);

  useEffect(() => {
    const handleAudioEnded = () => {
      setVisible(false);
      masterTimer.clear();
      window.dispatchEvent(new CustomEvent('narration-ended'));
    };
    
    window.addEventListener('audio-playback-ended', handleAudioEnded);
    return () => {
      window.removeEventListener('audio-playback-ended', handleAudioEnded);
      masterTimer.clear();
      ambientTimer.clear();
    };
  }, [masterTimer, ambientTimer]);

  useEffect(() => {
    if (!ambientActive || visible || loading) {
      ambientTimer.clear();
      return;
    }
    const delay = 10000; 
    ambientTimer.set(() => {
      if (!window.__isAILoading && !window.__isSpeaking) {
        getNarration(
          `The user is exploring the ${currentBiome} biome.`, 
          `Share a fascinating, conversational fact about what the ${currentBiome} would have looked like in the Late Cretaceous period. Keep it fresh, human-like, and highly immersive.`,
          false 
        );
      }
    }, delay, isGlobalPaused.current);

    return () => ambientTimer.clear();
  }, [visible, loading, getNarration, currentBiome, ambientActive, ambientTimer]);

  useEffect(() => {
    if (loading) {
      setVisible(false);
      masterTimer.clear();
      return;
    }

    if (!narration) {
        window.dispatchEvent(new CustomEvent('narration-ended'));
        return;
    }

    if (narration) {
      setVisible(true);
      const wordCount = narration.split(' ').length;
      const displayTime = Math.max(3000, (wordCount * 330) + 1500);

      masterTimer.set(() => {
        setVisible(false);
        window.dispatchEvent(new CustomEvent('narration-ended'));
      }, displayTime, isGlobalPaused.current);
    }
  }, [narration, loading, masterTimer]);

  const getFontSize = () => {
    if (subSize === 'small') return '1.15rem';
    if (subSize === 'large') return '2rem';
    return '1.5rem'; // medium
  };

  return (
    <AnimatePresence>
      {/* Hide the element entirely if subtitles are muted, but keep the timers running in logic */}
      {visible && !isSubsMuted && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="subtitle-box"
        >
          <div className="subtitle-text" style={{ fontSize: getFontSize(), transition: 'font-size 0.3s ease' }}>
            {narration.replace(/["“”]/g, '')}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}