import React, { useState, useEffect, useRef } from 'react';
import DialogueBox from './DialogueBox';
import InteractHint from './InteractHint';
import DinoModal from './DinoModal';
import LessonCompleteOverlay from '../../../components/UI/LessonCompleteOverlay';
import useAI from '../../../hooks/useAI';

export default function JurassicUI({ hasStarted }) {
  const [hoveredDino, setHoveredDino] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [currentBiome, setCurrentBiome] = useState('dense forest');
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  
  const { getNarration } = useAI();
  const previousModal = useRef(null);
  const hasFinishedIntro = useRef(false);
  const hasTriggeredCongratsRef = useRef(false);

  // Custom Modal Close Handler to track sequences
  const handleModalClose = () => {
      const closedType = activeModal;
      setActiveModal(null);
      
      if (closedType === 'geothermal') {
          // Tell the Scene to start the 10-second countdown for the meteor
          window.dispatchEvent(new CustomEvent('geothermal-modal-closed'));
      } else if (closedType === 'meteor') {
          // The user finished reading about the meteor. 
          // Wait a few seconds, then play the congratulation message.
          setTimeout(() => {
              hasTriggeredCongratsRef.current = true;
              getNarration(
                  "The lesson has concluded.",
                  "Warmly congratulate the student on surviving the cataclysm and completing the Late Cretaceous lesson. Tell them their findings have been safely recorded in the Historia archives.",
                  true
              );
          }, 3000);
      }
  };

  useEffect(() => {
    const handleHover = (e) => setHoveredDino(e.detail.isHovering);
    
    // Normal interaction clicks
    const handleClick = (e) => {
        // Prevent opening modals if the lesson complete screen is up
        if (!showLessonComplete) {
            setActiveModal(prev => prev ? prev : e.detail.type);
        }
    };
    
    const handleBiomeChange = (e) => {
        const newBiome = e.detail.biome;
        setCurrentBiome(newBiome);
        if (hasFinishedIntro.current && activeModal === null && !showLessonComplete) {
            getNarration(
                `The student just crossed the border into the ${newBiome} biome.`,
                `Conversationaly announce that they have entered the ${newBiome} biome. Give them an exciting hint about what type of terrain, plants, or dinosaurs they can expect to see here in the Late Cretaceous.`,
                true 
            );
        }
    };

    // SEQUENCE STEP 2: The sky turns red, meteors fall, start narration
    const handleStrikeStarted = () => {
        getNarration(
            "The meteor strike has begun.",
            "With intense urgency and awe, describe the apocalyptic meteor shower hitting the earth right now, explaining how this exact event led to the extinction of the dinosaurs.",
            true
        );
    };

    // SEQUENCE STEP 3: The 30s shower finishes. Wait 2 seconds, pop the Meteor Info Modal
    const handleShowerComplete = () => {
        setTimeout(() => {
            setActiveModal('meteor');
        }, 2000);
    };
    
    // SEQUENCE STEP 5: The Congratulatory Audio finishes -> Wait 5s -> Show End Screen
    const handleNarrationEnded = () => {
        if (hasTriggeredCongratsRef.current) {
            hasTriggeredCongratsRef.current = false;
            setTimeout(() => {
                setShowLessonComplete(true);
            }, 5000);
        }
    };

    window.addEventListener('dino-hover', handleHover);
    window.addEventListener('dino-click', handleClick);
    window.addEventListener('biome-change', handleBiomeChange);
    window.addEventListener('meteor-strike-started', handleStrikeStarted);
    window.addEventListener('meteor-shower-complete', handleShowerComplete);
    window.addEventListener('narration-ended', handleNarrationEnded);

    return () => {
      window.removeEventListener('dino-hover', handleHover);
      window.removeEventListener('dino-click', handleClick);
      window.removeEventListener('biome-change', handleBiomeChange);
      window.removeEventListener('meteor-strike-started', handleStrikeStarted);
      window.removeEventListener('meteor-shower-complete', handleShowerComplete);
      window.removeEventListener('narration-ended', handleNarrationEnded);
    };
  }, [getNarration, showLessonComplete]);

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

  // Grand Greeting & General Artifact Interactions
  useEffect(() => {
      if (previousModal.current === 'tutorial' && activeModal === null) {
          hasFinishedIntro.current = true;
          getNarration(
              "The tutorial just closed and the student is looking at the world.",
              "Warmly welcome the traveler to the Late Cretaceous Period. Set a grand, cinematic, and adventurous tone.",
              true
          );
      } else if (activeModal !== null && activeModal !== 'tutorial' && activeModal !== 'meteor') {
          // General artifact logic
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
      
      <div className={`absolute w-full px-8 flex justify-center pointer-events-none z-[150] transition-all duration-500 ease-in-out ${activeModal ? 'bottom-4' : 'bottom-12'}`}>
        <DialogueBox currentBiome={currentBiome} />
      </div>

      <InteractHint visible={hoveredDino && !activeModal} />
      
      <div className="pointer-events-auto">
         {/* Pass our custom handleModalClose so we can track when specific modals close */}
         <DinoModal type={activeModal} onClose={handleModalClose} />
      </div>

      <LessonCompleteOverlay 
        show={showLessonComplete} 
        message="You have witnessed the cataclysm that ended the Cretaceous period. The simulation has successfully concluded."
      />

    </div>
  );
}