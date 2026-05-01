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
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-20 flex items-center gap-3 bg-[#1a120b]/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-amber-600/50 shadow-[0_0_30px_rgba(245,158,11,0.3)] pointer-events-none"
        >
            {/* Uses your provided left-click PNG/SVG */}
            <img 
                src="/assets/left-click.png" 
                alt="Left Click" 
                className="w-8 h-8 object-contain animate-bounce" 
                onError={(e) => { e.target.src = '/assets/scroll.png'; }} // Failsafe
            />
            <span style={{ fontFamily: "'Cinzel', serif" }} className="text-amber-400 font-bold tracking-widest text-lg drop-shadow-md">
                INTERACT
            </span>
        </div>
    );
}