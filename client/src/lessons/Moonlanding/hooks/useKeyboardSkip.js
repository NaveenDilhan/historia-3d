import { useEffect } from 'react';

export function useKeyboardSkip(isActive, onSkip) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      // Allow skipping with Enter, Escape, or Space
      if (e.code === 'Enter' || e.code === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onSkip]);
}