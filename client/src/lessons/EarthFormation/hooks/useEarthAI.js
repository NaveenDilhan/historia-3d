import { useState, useEffect, useCallback } from 'react';

export default function useEarthAI() {
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (window.__isSpeaking && !forceInterrupt) return;

    if (forceInterrupt && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        window.__isSpeaking = false;
    }

    try {
      window.__isAILoading = true;
      setLoading(true);
      
      window.dispatchEvent(new CustomEvent('ai-narration-update', {
          detail: { narration: '', loading: true }
        }));

      // Dedicated Earth Formation Prompt
      const cosmicContext = `
        SYSTEM PROMPT: You are a cosmic observer and geological scholar guiding the user through the grand formation of Earth, from a vast expanse of stardust in the void to the modern living world.
        
        TONE: Awe-inspiring, cinematic, warm, and highly educational.
        
        RULE 1: 1 to 2 short sentences maximum.
        RULE 2: NEVER repeat a fact or phrase you have already shared.
        RULE 3: NEVER use terms like "young traveler", "traveler", "student", or "explorer". Address them directly.
        RULE 4: NEVER wrap your response in quotes. Return raw text only.
        RULE 5: If the prompt asks for instructions, provide ONLY the instructions in a clear, immersive way. No pleasantries.
        
        CURRENT ENVIRONMENT/ACTION: ${userAction} - ${context}
      `;

      const res = await fetch('http://localhost:5000/api/narration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAction, context: cosmicContext }),
      });

      const data = await res.json();
      const newText = data.narration || '';
      
      window.dispatchEvent(new CustomEvent('ai-narration-update', {
          detail: { narration: newText, loading: false }
        }));

    } catch (err) {
      console.error('AI call failed', err);
    } finally {
      window.__isAILoading = false;
      setLoading(false);
    }
  }, []);

  return { narration, getNarration, loading };
}