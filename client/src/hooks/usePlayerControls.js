import { useEffect, useState } from 'react';

/**
 * Tracks WASD movement + jump for first-person control
 */
export function usePlayerControls() {
  const [keys, setKeys] = useState({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          setKeys((k) => ({ ...k, forward: true }));
          break;
        case 's':
          setKeys((k) => ({ ...k, backward: true }));
          break;
        case 'a':
          setKeys((k) => ({ ...k, left: true }));
          break;
        case 'd':
          setKeys((k) => ({ ...k, right: true }));
          break;
        case ' ':
          setKeys((k) => ({ ...k, jump: true }));
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (e) => {
      switch (e.key.toLowerCase()) {
        case 'w':
          setKeys((k) => ({ ...k, forward: false }));
          break;
        case 's':
          setKeys((k) => ({ ...k, backward: false }));
          break;
        case 'a':
          setKeys((k) => ({ ...k, left: false }));
          break;
        case 'd':
          setKeys((k) => ({ ...k, right: false }));
          break;
        case ' ':
          setKeys((k) => ({ ...k, jump: false }));
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return keys;
}
