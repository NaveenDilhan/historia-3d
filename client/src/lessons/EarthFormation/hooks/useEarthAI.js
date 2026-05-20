import { useState, useEffect, useCallback, useRef } from 'react';

export default function useEarthAI() {
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);
  
  const abortControllerRef = useRef(null);
  const audioRef = useRef(null); // Track the ElevenLabs audio object

  useEffect(() => {
    const handleAIUpdate = (e) => {
      setNarration(e.detail.narration);
      setLoading(e.detail.loading);
    };

    window.addEventListener('ai-narration-update', handleAIUpdate);
    return () => window.removeEventListener('ai-narration-update', handleAIUpdate);
  }, []);

  const getNarration = useCallback(async (userAction, context = '', forceInterrupt = false) => {
    if (window.__isAILoading && !forceInterrupt) return;

    if (forceInterrupt) {
        // Abort the fetch request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Interrupt the ElevenLabs audio stream
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        // Fallback cleanup
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
        }
        window.__isSpeaking = false;
    }

    abortControllerRef.current = new AbortController();

    try {
      window.__isAILoading = true;
      setLoading(true);
      
      window.dispatchEvent(new CustomEvent('ai-narration-update', {
          detail: { narration: '', loading: true }
        }));

      const cosmicContext = `
        SYSTEM PROMPT: You are a friendly, enthusiastic narrator explaining the history of Earth to a 10-year-old audience.
        
        TONE: Fun, super clear, and easy to understand. Speak like a great science teacher telling a cool story.
        
        RULE 1: Follow the exact instructions in the CONTEXT.
        RULE 2: Use very basic vocabulary. Avoid all big scientific jargon.
        RULE 3: NEVER repeat terms or phrases from previous sentences. Keep the story moving forward.
        RULE 4: Unless asked to provide a general greeting or creative intro, explain the actual scientific or historical concept. Do NOT describe what is happening on the user's screen or the visual interface.
        RULE 5: NEVER use names, terms like "young traveler", "kids", or the word "simulation". Speak directly but naturally.
        RULE 6: Return raw text only. No quotes, no introductory filler, no markdown.
        RULE 7: Stay STRICTLY on topic. If a specific anomaly or concept is mentioned in the CONTEXT, explain ONLY that concept. Do not talk about general geology or unrelated facts.
        
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
      const audioData = data.audioData; // Extract audio data
      
      window.dispatchEvent(new CustomEvent('ai-narration-update', {
          detail: { narration: newText, loading: false }
        }));

      // Prevent overlapping audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }

      // Play the ElevenLabs audio if it exists
      if (audioData) {
        const audioSrc = `data:audio/mpeg;base64,${audioData}`;
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        
        window.__isSpeaking = true;
        
        // Reset speaking state when finished
        audio.onended = () => {
            window.__isSpeaking = false;
        };

        audio.play().catch(e => {
            console.error("Audio playback prevented by browser:", e);
            window.__isSpeaking = false;
        });
      }

    } catch (err) {
      if (err.name === 'AbortError') {
          console.log('Previous AI narration request aborted for a newer one.');
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