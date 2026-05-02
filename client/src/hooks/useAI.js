import { useState, useEffect, useCallback } from 'react';

export default function useAI() {
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);

  // Listen for global AI events
  useEffect(() => {
    const handleAIUpdate = (e) => {
      setNarration(e.detail.narration);
      setLoading(e.detail.loading);
    };
    window.addEventListener('ai-narration-update', handleAIUpdate);
    return () => window.removeEventListener('ai-narration-update', handleAIUpdate);
  }, []);

  // Wrapped in useCallback so it can be safely used in interval timers without causing infinite loops
  const getNarration = useCallback(async (userAction, context = '') => {
    // GLOBAL LOCKS: Prevent rapid re-triggering and overlapping audio
    if (window.__isAILoading) return;
    if (window.__isSpeaking) return;

    try {
      window.__isAILoading = true;
      setLoading(true);
      
      window.dispatchEvent(new CustomEvent('ai-narration-update', { 
        detail: { narration: '', loading: true } 
      }));

      // THE ONGOING SCHOLAR PERSONA
      const scholarContext = `
        SYSTEM PROMPT: You are a wise, encouraging historical scholar acting as an interactive test-track overseer (Portal style, but friendly and educational) for a student in a Jurassic period simulation. 
        TONE: Educational, warm, observant, and concise. Speak directly to the student.
        FORMAT: 1 to 2 short sentences maximum. You are keeping them company. Deliver interesting, unsolicited facts naturally about the climate, plants, or dinosaurs.
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
      // Fail silently for ambient loops so we don't spam error messages
    } finally {
      window.__isAILoading = false;
      setLoading(false);
    }
  }, []);

  return { narration, getNarration, loading };
}