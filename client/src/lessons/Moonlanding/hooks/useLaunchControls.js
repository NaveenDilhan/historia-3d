import { useState, useEffect } from 'react';

export function useLaunchControls(phase, setPhase) {
  const [launchProgress, setLaunchProgress] = useState(0);

  useEffect(() => {
    if (phase !== 'launch') return;

    let isHolding = false;
    let frameId;

    const handleKeyDown = (e) => { 
      if (e.code === 'Space') {
        e.preventDefault();
        isHolding = true; 
      }
    };
    
    const handleKeyUp = (e) => { 
      if (e.code === 'Space') isHolding = false; 
    };

    const updateProgress = () => {
      setLaunchProgress((prev) => {
        if (isHolding) {
          const next = prev + 0.3; 
          if (next >= 100) {
            setPhase('liftoff'); 
            return 100;
          }
          return next;
        } else {
   
          return prev > 0 ? prev - 0.5 : 0; 
        }
      });
      frameId = requestAnimationFrame(updateProgress);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    frameId = requestAnimationFrame(updateProgress);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(frameId);
    };
  }, [phase, setPhase]);

  return launchProgress;
}