import { useState, useEffect, useCallback } from 'react';

export default function useAI() {
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

  // forceInterrupt ensures we can cleanly cut off ambient facts when the user clicks something
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

      // PERSONA: Human-like, Late Cretaceous, never repeats facts.
      const scholarContext = `
        SYSTEM PROMPT: You are a passionate, conversational historical scholar acting as an interactive tour guide for a student in a Late Cretaceous period simulation. 
        TONE: Extremely human-like, warm, observant, and engaging. Speak as if you are walking right beside them on this adventure.
        RULE 1: 1 to 2 short sentences maximum.
        RULE 2: NEVER repeat a fact or phrase you have already shared. Keep it fresh.
        CURRENT ENVIRONMENT/ACTION: ${userAction} - ${context}
      `;

      const res = await fetch('http://localhost:5000/api/narration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAction, context: scholarContext }),
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