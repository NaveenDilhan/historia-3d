import React, { useState, useEffect, useRef } from 'react';
import DialogueBox from './DialogueBox';
import InteractHint from './InteractHint';
import DinoModal from './DinoModal';
import useAI from '../../../hooks/useAI';

export default function JurassicUI({ hasStarted }) {
  const [hoveredDino, setHoveredDino] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [currentBiome, setCurrentBiome] = useState('dense forest');
  
  const { getNarration } = useAI();
  const previousModal = useRef(null);
  const hasFinishedIntro = useRef(false);

  // Core Event Listeners
  useEffect(() => {
    const handleHover = (e) => setHoveredDino(e.detail.isHovering);
    const handleClick = (e) => setActiveModal(prev => prev ? prev : e.detail.type);
    
    const handleBiomeChange = (e) => {
        const newBiome = e.detail.biome;
        setCurrentBiome(newBiome);

        // Biome Announcement: Only play if intro is done and they aren't reading a modal
        if (hasFinishedIntro.current && activeModal === null) {
            getNarration(
                `The student just crossed the border into the ${newBiome} biome.`,
                `Conversationaly announce that they have entered the ${newBiome} biome. Give them an exciting hint about what type of terrain, plants, or dinosaurs they can expect to see here in the Late Cretaceous.`,
                true // Force interrupt ambient chatter!
            );
        }
    };

    window.addEventListener('dino-hover', handleHover);
    window.addEventListener('dino-click', handleClick);
    window.addEventListener('biome-change', handleBiomeChange);

    return () => {
      window.removeEventListener('dino-hover', handleHover);
      window.removeEventListener('dino-click', handleClick);
      window.removeEventListener('biome-change', handleBiomeChange);
    };
  }, [activeModal, getNarration]);

  // The Tutorial Voiceover Trigger
  useEffect(() => {
    if (hasStarted) {
      const timer = setTimeout(() => {
          setActiveModal('tutorial');
          getNarration(
              "The student just started the simulation and is looking at the control tutorial.",
              "Briefly instruct the student to use WASD to navigate the terrain and the mouse to look around and extract artifacts.",
              true
          );
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, getNarration]);

  // Grand Greeting & Artifact Interaction Pivot
  useEffect(() => {
      if (previousModal.current === 'tutorial' && activeModal === null) {
          hasFinishedIntro.current = true;
          getNarration(
              "The tutorial just closed and the student is looking at the world.",
              "Warmly welcome the traveler to the Late Cretaceous Period. Set a grand, cinematic, and adventurous tone.",
              true
          );
      } else if (activeModal !== null && activeModal !== 'tutorial') {
          getNarration(
              `The student just interacted with a ${activeModal} and opened its archive.`,
              `Smoothly pivot and provide a fascinating, conversational fact about ${activeModal} in the Late Cretaceous period.`,
              true
          );
      }
      
      previousModal.current = activeModal;
  }, [activeModal, getNarration]);

  if (!hasStarted) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      <div className="absolute bottom-12 w-full px-8 flex justify-center pointer-events-none z-50">
        <DialogueBox currentBiome={currentBiome} />
      </div>
      <InteractHint visible={hoveredDino && !activeModal} />
      <div className="pointer-events-auto">
         <DinoModal type={activeModal} onClose={() => setActiveModal(null)} />
      </div>
    </div>
  );
}