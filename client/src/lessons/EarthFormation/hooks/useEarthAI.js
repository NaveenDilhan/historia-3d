import { useState, useEffect, useCallback, useRef } from 'react';

export default function useEarthAI() {
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Use a ref to keep track of the current active request so we can cancel it
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

    // If forcing an interrupt, kill any existing API request and stop the voice
    if (forceInterrupt) {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            window.__isSpeaking = false;
        }
    }

    // Create a new abort controller for this specific request
    abortControllerRef.current = new AbortController();

    try {
      window.__isAILoading = true;
      setLoading(true);
      
      window.dispatchEvent(new CustomEvent('ai-narration-update', {
          detail: { narration: '', loading: true }
        }));

      // Updated Prompt: Enforces 2 to 4 sentences with natural language.
      const cosmicContext = `
        SYSTEM PROMPT: You are a friendly, awe-inspiring narrator guiding the user through how our planet was built.
        
        TONE: Warm, conversational, highly visual, and totally natural. Speak like you are telling a fascinating story to a curious friend.
        
        RULE 1: Generate between 2 to 4 sentences. Do not cut your thoughts short, but do not exceed 4 sentences.
        RULE 2: Use VERY SIMPLE, everyday language. Explain things without complex geological or scientific jargon.
        RULE 3: VARY your sentence structures. Do not start every sentence the same way. Avoid sounding repetitive or robotic.
        RULE 4: Focus on the VISUAL state of the planet. What does the screen look like right now based on the user's action?
        RULE 5: NEVER use names, terms like "young traveler", or the word "simulation".
        RULE 6: Return raw text only. No quotes or introductory filler.
        
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