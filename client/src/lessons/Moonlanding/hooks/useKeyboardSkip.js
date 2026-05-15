import { useEffect } from 'react';

export function useKeyboardSkip(isActive, onSkip) {
  useEffect(() => {
    if (!isActive) return;

    const handleKeyDown = (e) => {
      if (e.code === 'Enter' || e.code === 'Escape' || e.code === 'Space') {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, onSkip]);
}