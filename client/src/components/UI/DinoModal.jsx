import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';

const archiveData = {
    tutorial: {
        title: "TUTORIAL",
    },
    trex: {
        title: "TYRANNOSAURUS REX",
        images: ["/assets/scroll.png", "/assets/scroll.png", "/assets/scroll.png"]
    },
    apatosaurus: {
        title: "APATOSAURUS",
        images: ["/assets/scroll.png", "/assets/scroll.png", "/assets/scroll.png"]
    },
    angiosperm: {
        title: "EARLY ANGIOSPERMS",
        images: ["/assets/scroll.png", "/assets/scroll.png", "/assets/scroll.png"]
    }
};

export default function DinoModal({ type, onClose }) {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);

    useEffect(() => {
        if (type) {
            // CRITICAL: Free the mouse cursor so the user can click the close button
            document.exitPointerLock(); 
            
            gsap.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
            gsap.fromTo(modalRef.current,
                { opacity: 0, scale: 0.8, y: 30 },
                { opacity: 1, scale: 1, y: 0, duration: 0.6, ease: "power3.out", delay: 0.1 }
            );
        }
    }, [type]);

    if (!type) return null;
    const data = archiveData[type];

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div ref={modalRef} className="relative w-[90vw] max-w-5xl min-h-[60vh] bg-[#1a120b] border border-amber-900/50 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden flex flex-col">
                
                {/* Decorative Top Line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80"></div>

                <button 
                    onClick={onClose} 
                    className="absolute top-6 right-6 z-50 p-2 bg-black/40 hover:bg-amber-900/50 text-amber-500 rounded-full transition-colors border border-amber-900/50"
                >
                    <X size={24} />
                </button>

                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    {type === 'tutorial' ? (
                        /* --- TUTORIAL VIEW --- */
                        <div className="flex flex-col items-center justify-center w-full h-full">
                            <div className="text-center mb-12">
                                <h2 style={{ fontFamily: "'Cinzel', serif" }} className="text-2xl md:text-3xl font-bold text-amber-100 tracking-wider">
                                    {data.title}
                                </h2>
                                <div className="w-24 h-px bg-amber-700/50 mx-auto mt-4"></div>
                            </div>

                            <div className="flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24 w-full">
                                {/* WASD Cluster & Text */}
                                <div className="flex flex-col items-center gap-2">
                                    <img 
                                        src="/assets/keyboard_w.png" 
                                        alt="W Key" 
                                        className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                        onError={(e) => { e.target.src = '/assets/w.png'; }} // Fallback if named differently
                                    />
                                    <div className="flex gap-2">
                                        <img 
                                            src="/assets/keyboard_a.png" 
                                            alt="A Key" 
                                            className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                            onError={(e) => { e.target.src = '/assets/a.png'; }}
                                        />
                                        <img 
                                            src="/assets/keyboard_s.png" 
                                            alt="S Key" 
                                            className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                            onError={(e) => { e.target.src = '/assets/s.png'; }}
                                        />
                                        <img 
                                            src="/assets/keyboard_d.png" 
                                            alt="D Key" 
                                            className="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                            onError={(e) => { e.target.src = '/assets/d.png'; }}
                                        />
                                    </div>
                                    <div className="mt-6 px-5 py-2 bg-amber-950/40 border border-amber-900/50 rounded-lg text-center shadow-inner">
                                        <p className="text-amber-400 font-bold tracking-widest text-sm uppercase">Navigate Terrain</p>
                                        <p className="text-amber-200/50 text-xs mt-1">Move forward, back, left, and right</p>
                                    </div>
                                </div>
                                
                                {/* Visual Separator */}
                                <div className="text-amber-700/50 text-4xl md:text-5xl font-black mb-8 md:mb-0">+</div>

                                {/* Mouse Icon & Text */}
                                <div className="flex flex-col items-center">
                                    <img 
                                        src="/assets/left-click.png" 
                                        alt="Mouse Interaction" 
                                        className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                        onError={(e) => { e.target.src = '/assets/scroll.png'; }} // Failsafe
                                    />
                                    <div className="mt-6 px-5 py-2 bg-amber-950/40 border border-amber-900/50 rounded-lg text-center shadow-inner">
                                        <p className="text-amber-400 font-bold tracking-widest text-sm uppercase">Survey & Extract</p>
                                        <p className="text-amber-200/50 text-xs mt-1">Look around and Left Click on targets</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* --- INFORMATION VIEW (T-Rex / Apatosaurus / Angiosperm) --- */
                        <div className="flex flex-col items-center justify-center w-full h-full py-4">
                            
                            {/* Dinosaur/Plant Name Header */}
                            <div className="text-center mb-10 w-full">
                                <div className="text-[10px] uppercase tracking-[0.3em] text-amber-600 font-bold mb-2">
                                    Historical Archive
                                </div>
                                <h3 style={{ fontFamily: "'Cinzel', serif" }} className="text-3xl md:text-5xl font-bold text-amber-100 tracking-widest drop-shadow-lg">
                                    {data.title}
                                </h3>
                                <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-6"></div>
                            </div>

                            {/* 3 Slanted Pictures dynamically loaded from archiveData */}
                            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 px-4">
                                
                                {/* Panel 1: Slanted Left */}
                                <div className="w-full md:w-1/3 aspect-[4/5] max-w-[280px] bg-black border-2 border-amber-900/40 rounded-2xl overflow-hidden shadow-2xl transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 relative group cursor-pointer">
                                    <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10"></div>
                                    <img src={data.images[0]} alt="Archive 1" className="w-full h-full object-contain p-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>

                                {/* Panel 2: Popped forward, slightly Slanted Right */}
                                <div className="w-full md:w-1/3 aspect-[4/5] max-w-[280px] bg-black border-2 border-amber-500/50 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.2)] transform rotate-3 scale-110 hover:rotate-0 hover:scale-115 transition-all duration-500 relative z-10 group cursor-pointer">
                                    <div className="absolute inset-0 bg-amber-600/10 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10"></div>
                                    <img src={data.images[1]} alt="Archive 2" className="w-full h-full object-contain p-8 opacity-100" />
                                </div>

                                {/* Panel 3: Slanted Left */}
                                <div className="w-full md:w-1/3 aspect-[4/5] max-w-[280px] bg-black border-2 border-amber-900/40 rounded-2xl overflow-hidden shadow-2xl transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 relative group cursor-pointer">
                                    <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10"></div>
                                    <img src={data.images[2]} alt="Archive 3" className="w-full h-full object-contain p-8 opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>

                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}