import { useState, useEffect, useCallback, useRef } from 'react';

export default function useEarthAI() {
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef(null);
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

    if (forceInterrupt) {
        if (abortControllerRef.current) abortControllerRef.current.abort();
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if ('speechSynthesis' in window) window.speechSynthesis.cancel();
        window.__isSpeaking = false;
    }

    abortControllerRef.current = new AbortController();

    try {
      window.__isAILoading = true;
      setLoading(true);
      window.dispatchEvent(new CustomEvent('ai-narration-update', { detail: { narration: '', loading: true } }));

      const cosmicContext = `
        SYSTEM PROMPT: You are a friendly, enthusiastic narrator explaining the history of Earth to a 10-year-old audience.
        TONE: Fun, super clear, and easy to understand.
        RULE 1: Follow the exact instructions in the CONTEXT.
        RULE 2: Use very basic vocabulary. Avoid all big scientific jargon.
        RULE 3: NEVER repeat terms or phrases from previous sentences. Keep the story moving forward.
        RULE 4: Unless asked to provide a general greeting or creative intro, explain the actual scientific or historical concept. Do NOT describe what is happening on the user's screen or the visual interface.
        RULE 5: NEVER use names, terms like "young traveler", "kids", or the word "simulation".
        RULE 6: Return raw text only. No quotes, no introductory filler, no markdown.
        RULE 7: Stay STRICTLY on topic.
        CURRENT SCENE / ACTION: ${userAction}
        CONTEXT TO INCLUDE: ${context}
      `;

      const res = await fetch('http://localhost:5000/api/narration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAction, context: cosmicContext }),
        signal: abortControllerRef.current.signal 
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
      if (err.name === 'AbortError') {
          console.log('Previous AI narration request aborted.');
      } else {
          console.error('AI call failed', err);
      }
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
          window.__isAILoading = false;
          setLoading(false);
      }
    }
  }, []);

  return { narration, getNarration, loading };
}