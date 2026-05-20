import { useState, useEffect, useCallback, useRef } from 'react';

export default function useAI() {
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    const handleAIUpdate = (e) => {
      setNarration(e.detail.narration);
      setLoading(e.detail.loading);
    };

    const handlePauseToggle = (e) => {
      const shouldPause = e.detail;
      if (audioRef.current) {
        if (shouldPause) {
          audioRef.current.pause();
        } else {
          if (audioRef.current.currentTime > 0 && !audioRef.current.ended) {
            audioRef.current.play().catch(err => console.error(err));
          }
        }
      }
    };

    const handleStop = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      window.__isSpeaking = false;
    };

    // Ensure mute happens instantly
    const handleMuteToggle = (e) => {
      const isMuted = e.detail;
      if (audioRef.current) {
        audioRef.current.muted = isMuted;
      }
    };

    window.addEventListener('ai-narration-update', handleAIUpdate);
    window.addEventListener('narration-pause', handlePauseToggle);
    window.addEventListener('narration-stop', handleStop);
    window.addEventListener('sound-mute-toggled', handleMuteToggle);

    return () => {
      window.removeEventListener('ai-narration-update', handleAIUpdate);
      window.removeEventListener('narration-pause', handlePauseToggle);
      window.removeEventListener('narration-stop', handleStop);
      window.removeEventListener('sound-mute-toggled', handleMuteToggle);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []);

  const getNarration = useCallback(async (userAction, context = '', forceInterrupt = false) => {
    if (window.__isAILoading && !forceInterrupt) return;
    if (window.__isSpeaking && !forceInterrupt) return;

    if (forceInterrupt) {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        window.__isSpeaking = false;
    }

    try {
      window.__isAILoading = true;
      setLoading(true);
      window.dispatchEvent(new CustomEvent('ai-narration-update', { detail: { narration: '', loading: true } }));

      const scholarContext = `
        SYSTEM PROMPT: You are a passionate, conversational historical scholar acting as an interactive tour guide in a Late Cretaceous period simulation.
        TONE: Human-like, warm, observant, and engaging.
        RULE 1: 1 to 2 short sentences maximum.
        RULE 2: NEVER repeat a fact or phrase you have already shared. Keep it fresh.
        RULE 3: NEVER use terms like "young traveler", "traveler", "student", or "explorer".
        RULE 4: NEVER wrap your response in quotes. Return raw text only.
        RULE 5: If the prompt asks for instructions, provide ONLY the instructions.
        CURRENT ENVIRONMENT/ACTION: ${userAction} - ${context}
      `;

      const res = await fetch('http://localhost:5000/api/narration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAction, context: scholarContext }),
      });

      const data = await res.json();
      const newText = data.narration || '';
      const audioData = data.audioData; 
      
      window.dispatchEvent(new CustomEvent('ai-narration-update', { detail: { narration: newText, loading: false } }));

      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      if (audioData) {
        const audioSrc = `data:audio/mpeg;base64,${audioData}`;
        const audio = new Audio(audioSrc);
        
        // Respect current state instantly on creation
        audio.muted = !!window.__soundMuted;
        
        audioRef.current = audio;
        window.__isSpeaking = true;
        
        audio.onended = () => {
            window.__isSpeaking = false;
            window.dispatchEvent(new CustomEvent('audio-playback-ended'));
        };

        audio.play().catch(e => {
            console.error("Audio playback prevented by browser:", e);
            window.__isSpeaking = false;
            window.dispatchEvent(new CustomEvent('audio-playback-ended'));
        });
      }

    } catch (err) {
      console.error('AI call failed', err);
    } finally {
      window.__isAILoading = false;
      setLoading(false);
    }
  }, []);

  return { narration, getNarration, loading };
}