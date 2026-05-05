import React, { useState, useEffect, useRef } from 'react';
import DialogueBox from './DialogueBox';
import InteractHint from './InteractHint';
import DinoModal from './DinoModal';
import HUD from './HUD';
import LessonCompleteOverlay from '../../../components/UI/LessonCompleteOverlay';
import useAI from '../../../hooks/useAI';

export default function JurassicUI({ hasStarted }) {
  const [hoveredDino, setHoveredDino] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [currentBiome, setCurrentBiome] = useState('dense forest');
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  
  // --- ACHIEVEMENT TRACKING ---
  const [discoveredEvents, setDiscoveredEvents] = useState(new Set());
  const [earnedMedal, setEarnedMedal] = useState(null);
  const totalEvents = 8; 

  const { getNarration } = useAI();
  const previousModal = useRef(null);
  const hasFinishedIntro = useRef(false);
  const hasTriggeredCongratsRef = useRef(false);
  const isApocalypseRef = useRef(false); 

  // Custom Modal Close Handler to track sequences
  const handleModalClose = () => {
      const closedType = activeModal;
      setActiveModal(null);
      
      if (closedType === 'geothermal') {
          // Tell the Scene to start the meteor sequence and block ambient events
          isApocalypseRef.current = true;
          window.dispatchEvent(new CustomEvent('geothermal-modal-closed'));
      } else if (closedType === 'meteor') {
          // The Chicxulub modal just closed. Trigger the final congratulations and calculate achievement.
          setTimeout(() => {
              hasTriggeredCongratsRef.current = true;

              // CALCULATE MEDAL
              const score = discoveredEvents.size;
              let medal = null;
              if (score === totalEvents) medal = 'gold';
              else if (score >= Math.floor(totalEvents * 0.6)) medal = 'silver';
              else if (score > 0) medal = 'bronze';
              
              setEarnedMedal(medal);

              // UPDATE DATABASE
              fetch("http://localhost:5000/api/users/achievements", {
                  method: "POST",
                  credentials: "include",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                      lessonId: "jurassic",
                      eventsFound: score,
                      totalEvents: totalEvents,
                      medal: medal
                  })
              }).catch(console.error);

              getNarration(
                  "The lesson has concluded.",
                  "Warmly congratulate the user on surviving the cataclysm and completing the Late Cretaceous simulation. Tell them their findings have been safely recorded in the Historia archives.",
                  true
              );
          }, 3000);
      }
  };

  useEffect(() => {
    const handleHover = (e) => setHoveredDino(e.detail.isHovering);
    
    // Normal interaction clicks
    const handleClick = (e) => {
        if (!showLessonComplete) {
            setActiveModal(prev => prev ? prev : e.detail.type);
        }
    };
    
    const handleBiomeChange = (e) => {
        const newBiome = e.detail.biome;
        setCurrentBiome(newBiome);
        if (hasFinishedIntro.current && activeModal === null && !showLessonComplete && !isApocalypseRef.current) {
            getNarration(
                `The user just crossed the border into the ${newBiome} biome.`,
                `Conversationally announce that they have entered the ${newBiome} biome. Give them an exciting hint about what type of terrain, plants, or dinosaurs they can expect to see here in the Late Cretaceous.`,
                true 
            );
        }
    };

    const handleStrikeStarted = () => {
        getNarration(
            "The meteor strike has begun.",
            "With intense urgency and awe, describe the apocalyptic meteor shower hitting the earth right now, explaining how this exact event led to the extinction of the dinosaurs.",
            true
        );
    };

    const handleShowerComplete = () => {
        setTimeout(() => {
            setActiveModal('meteor');
        }, 2000);
    };
    
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

  useEffect(() => {
    if (hasStarted) {
      const timer = setTimeout(() => {
          setActiveModal('tutorial');
          getNarration(
              "Tutorial Instructions.",
              "STRICT RULES: NO greetings. NO pleasantries. NO introductory words. ONLY state: Use the W, A, S, and D keys to move, the mouse to look around, and Left Click to interact with artifacts.",
              true
          );
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasStarted, getNarration]);

  useEffect(() => {
      // TRACK EVENTS FOR ACHIEVEMENTS
      if (activeModal && activeModal !== 'tutorial') {
          setDiscoveredEvents(prev => {
              const newSet = new Set(prev);
              newSet.add(activeModal);
              return newSet;
          });
      }

      if (previousModal.current === 'tutorial' && activeModal === null) {
          hasFinishedIntro.current = true;
          getNarration(
              "The tutorial just closed and the user is looking at the world.",
              "Warmly welcome them to the Late Cretaceous Period. Set a grand, cinematic, and adventurous tone.",
              true
          );
      } else if (activeModal === 'meteor') {
          getNarration(
              "The user is reading about the Chicxulub Meteorite.",
              "Give a brief, scientific explanation of the Chicxulub impactor (e.g. its estimated size, the crater it left, or its atmospheric effects). DO NOT repeat the dramatic description of the falling meteors, as you just did that.",
              true
          );
      } else if (activeModal !== null && activeModal !== 'tutorial') {
          getNarration(
              `The user just interacted with a ${activeModal} and opened its archive.`,
              `Smoothly pivot and provide a fascinating, conversational fact about ${activeModal} in the Late Cretaceous period.`,
              true
          );
      }
      previousModal.current = activeModal;
  }, [activeModal, getNarration]);

  if (!hasStarted) return null;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      
      {/* HUD Tracker Component */}
      <HUD 
        current={discoveredEvents.size} 
        total={totalEvents} 
        visible={!showLessonComplete} 
      />
      
      <div className={`absolute w-full px-8 flex justify-center pointer-events-none z-[150] transition-all duration-500 ease-in-out ${activeModal ? 'bottom-4' : 'bottom-12'}`}>
        <DialogueBox currentBiome={currentBiome} />
      </div>

      <InteractHint visible={hoveredDino && !activeModal} />
      
      <div className="pointer-events-auto">
         <DinoModal type={activeModal} onClose={handleModalClose} />
      </div>

      <LessonCompleteOverlay 
          show={showLessonComplete} 
          message="You have witnessed the cataclysm that ended the Cretaceous period. The simulation has successfully concluded."
          medal={earnedMedal}
      />
    </div>
  );
}