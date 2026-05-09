import { useState, useEffect, useCallback, useRef } from 'react';

export default function useEarthAI() {
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);
  
  const abortControllerRef = useRef(null);

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
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            window.__isSpeaking = false;
        }
    }

    abortControllerRef.current = new AbortController();

    try {
      window.__isAILoading = true;
      setLoading(true);
      
      window.dispatchEvent(new CustomEvent('ai-narration-update', {
          detail: { narration: '', loading: true }
        }));

      // Strictly controlled prompt for a younger audience
      const cosmicContext = `
        SYSTEM PROMPT: You are a friendly, enthusiastic narrator explaining the history of Earth to a 10-year-old audience.
        
        TONE: Fun, super clear, and easy to understand. Speak like a great science teacher telling a cool story.
        
        RULE 1: Generate exactly 2 to 4 sentences. Keep sentences short and punchy.
        RULE 2: Use very basic vocabulary. Avoid all big scientific jargon. 
        RULE 3: NEVER repeat terms or phrases from previous sentences. Keep the story moving forward.
        RULE 4: Focus on the VISUAL state of the planet. What does the screen look like right now based on the user's action? Describe basic colors and movements.
        RULE 5: NEVER use names, terms like "young traveler", "kids", or the word "simulation". Speak directly but naturally.
        RULE 6: Return raw text only. No quotes, no introductory filler, no markdown.
        
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
      
      window.dispatchEvent(new CustomEvent('ai-narration-update', {
          detail: { narration: newText, loading: false }
        }));

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