import { useState, useEffect } from 'react';

export default function useAI() {
  const [narration, setNarration] = useState('');
  const [loading, setLoading] = useState(false);

  // Listen for global AI events so the UI updates when 3D models trigger the narrator
  useEffect(() => {
    const handleAIUpdate = (e) => {
      setNarration(e.detail.narration);
      setLoading(e.detail.loading);
    };
    window.addEventListener('ai-narration-update', handleAIUpdate);
    return () => window.removeEventListener('ai-narration-update', handleAIUpdate);
  }, []);

  async function getNarration(userAction, context = '') {
    try {
      setLoading(true);
      setNarration('');
      // Broadcast loading state
      window.dispatchEvent(new CustomEvent('ai-narration-update', { 
        detail: { narration: '', loading: true } 
      }));

      // --- THE SCHOLAR INJECTION ---
      // This forces the AI to reply like a professor without changing your backend
      const scholarContext = `
        SYSTEM PROMPT: You are a wise, encouraging historical scholar guiding a student through an interactive simulation of the Jurassic period. 
        TONE: Educational, warm, observant, and concise. Speak directly to the student as they explore this ancient world. 
        FORMAT: 1 to 3 short sentences maximum. Deliver interesting facts naturally, as if observing the flora and fauna alongside the player.
        CURRENT ENVIRONMENT/ACTION: ${userAction} - ${context}
      `;

      const res = await fetch('http://localhost:5000/api/narration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAction, context: scholarContext }),
      });
      const data = await res.json();

      const newText = data.narration || '';
      
      // Broadcast new text
      window.dispatchEvent(new CustomEvent('ai-narration-update', { 
        detail: { narration: newText, loading: false } 
      }));

    } catch (err) {
      console.error('AI call failed', err);
      const errorMsg = 'The chronosphere connection is disrupted. I cannot see what you are seeing...';
      window.dispatchEvent(new CustomEvent('ai-narration-update', { 
        detail: { narration: errorMsg, loading: false } 
      }));
    } finally {
      setLoading(false);
    }
  }

  return { narration, getNarration, loading };
}