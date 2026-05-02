// src/lessons/jurrasic/UI/JurassicUI.jsx
import React, { useState, useEffect } from 'react';
import DialogueBox from './DialogueBox';
import InteractHint from './InteractHint';
import DinoModal from './DinoModal';

export default function JurassicUI({ hasStarted }) {
  const [hoveredDino, setHoveredDino] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  // Listen for Raycast events from the 3D models
  useEffect(() => {
    const handleHover = (e) => setHoveredDino(e.detail.isHovering);
    const handleClick = (e) => setActiveModal(e.detail.type);

    window.addEventListener('dino-hover', handleHover);
    window.addEventListener('dino-click', handleClick);
    return () => {
      window.removeEventListener('dino-hover', handleHover);
      window.removeEventListener('dino-click', handleClick);
    };
  }, []);

  // Trigger Tutorial Modal when scene begins
  useEffect(() => {
    if (hasStarted) {
      const timer = setTimeout(() => setActiveModal('tutorial'), 2000);
      return () => clearTimeout(timer);
    }
  }, [hasStarted]);

  // Don't render the UI until the intro animation finishes
  if (!hasStarted) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
        <DialogueBox />
      </div>

      <InteractHint visible={hoveredDino && !activeModal} />

      <div className="pointer-events-auto">
         <DinoModal type={activeModal} onClose={() => setActiveModal(null)} />
      </div>
    </div>
  );
}