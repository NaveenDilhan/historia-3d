import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function InteractHint({ visible }) {
    const hintRef = useRef(null);

    useEffect(() => {
        if (visible) {
            gsap.fromTo(hintRef.current,
                { opacity: 0, scale: 0.5, y: 20 },
                { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2)" }
            );
        }
    }, [visible]);

    if (!visible) return null;

    return (
        <div 
            ref={hintRef} 
            // UPDATED: Removed bg, border, and backdrop-blur classes. Kept positioning.
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-24 flex items-center gap-4 pointer-events-none"
        >
            <img 
                src="/assets/left-click.png" 
                alt="Left Click" 
                // Added a drop-shadow so the icon remains visible against varied 3D backgrounds
                className="w-10 h-10 object-contain animate-bounce drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]" 
                onError={(e) => { e.target.src = '/assets/scroll.png'; }} 
            />
            <span 
                // UPDATED: Applied a rounded, game-like font stack and strong text-shadow for readability
                style={{ 
                    fontFamily: "'Varela Round', 'Nunito', 'Comic Sans MS', sans-serif",
                    textShadow: "0px 4px 15px rgba(0,0,0,1), 0px 2px 5px rgba(0,0,0,0.8)" 
                }} 
                className="text-amber-400 font-extrabold tracking-[0.15em] text-2xl"
            >
                INTERACT
            </span>
        </div>
    );
}