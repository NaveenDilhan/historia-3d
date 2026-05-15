import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const archiveData = {
    tutorial: {
        title: "TUTORIAL",
    },
    trex: {
        title: "TYRANNOSAURUS REX",
        images: ["/assets/scroll.png", "/assets/scroll.png", "/assets/scroll.png"]
    },
    apatosaurus: {
        title: "ALAMOSAURUS",
        images: ["/assets/scroll.png", "/assets/scroll.png", "/assets/scroll.png"]
    },
    triceratops: {
        title: "TRICERATOPS",
        images: ["/assets/scroll.png", "/assets/scroll.png", "/assets/scroll.png"]
    },
    angiosperm: {
        title: "EARLY ANGIOSPERMS",
        images: ["/assets/scroll.png", "/assets/scroll.png", "/assets/scroll.png"]
    },
    ammonite: { 
        title: "AMMONITE FOSSILS",
        images: ["/assets/scroll.png", "/assets/scroll.png", "/assets/scroll.png"]
    },
    largebone: {
        title: "LARGE BONE FOSSIL",
        images: ["/assets/scroll.png", "/assets/scroll.png", "/assets/scroll.png"]
    },
    geothermal: {
        title: "GEOTHERMAL VENT",
        images: ["/assets/scroll.png", "/assets/scroll.png", "/assets/scroll.png"]
    },
    meteor: {
        title: "CHICXULUB METEORITE",
        images: ["/assets/scroll.png", "/assets/scroll.png", "/assets/scroll.png"]
    }
};

export default function DinoModal({ type, onClose }) {
    const modalRef = useRef(null);
    const overlayRef = useRef(null);
    const [canClose, setCanClose] = useState(false);

    useEffect(() => {
        let delayTimer;
        let failsafeTimer;

        if (type) {
            
            setCanClose(false);

            
            const handleNarrationEnded = () => {
                delayTimer = setTimeout(() => {
                    setCanClose(true);
                }, 3000);
            };
            window.addEventListener('narration-ended', handleNarrationEnded);


            failsafeTimer = setTimeout(() => {
                setCanClose(true);
            }, 60000); 


            let ctx = gsap.context(() => {
                const tl = gsap.timeline();
                

                tl.fromTo(overlayRef.current, 
                    { opacity: 0 }, 
                    { opacity: 1, duration: 0.4, ease: "power2.out" }
                );


                tl.fromTo(modalRef.current,
                    { opacity: 0, scale: 0.85, y: 60, rotationX: -15, transformPerspective: 1000 },
                    { opacity: 1, scale: 1, y: 0, rotationX: 0, duration: 0.8, ease: "back.out(1.5)" },
                    "<0.1" 
                );


                tl.fromTo(".animate-item",
                    { opacity: 0, y: 20 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.1, ease: "power2.out" },
                    "-=0.5" 
                );

            }, overlayRef);


            return () => {
                window.removeEventListener('narration-ended', handleNarrationEnded);
                clearTimeout(delayTimer);
                clearTimeout(failsafeTimer);
                ctx.revert();
            };
        }
    }, [type]);


    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter' && canClose) {
                onClose();
            }
        };

        if (type) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [type, canClose, onClose]);

    if (!type) return null;
    const data = archiveData[type];

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            
            <div ref={modalRef} className="relative w-[90vw] max-w-4xl min-h-[50vh] bg-[#1a120b] border border-amber-900/50 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.15)] flex flex-col overflow-visible">
                
                {/* Decorative Top Line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80 animate-item rounded-t-3xl"></div>
                
                <div className="flex-1 flex flex-col items-center justify-center p-8">
                    {type === 'tutorial' ? (
                        /* --- TUTORIAL VIEW --- */
                        <div className="flex flex-col items-center justify-center w-full h-full">
                            <div className="text-center mb-8">
                                <h2 style={{ fontFamily: "'Cinzel', serif" }} className="text-2xl md:text-3xl font-bold text-amber-100 tracking-wider animate-item">
                                    {data.title}
                                </h2>
                                <div className="w-24 h-px bg-amber-700/50 mx-auto mt-4 animate-item"></div>
                            </div>
                            
                            <div className="flex flex-col md:flex-row items-center justify-center gap-10 md:gap-16 w-full">
                                {/* WASD Cluster & Text */}
                                <div className="flex flex-col items-center gap-2 animate-item">
                                    <img 
                                        src="/assets/keyboard_w.png" 
                                        alt="W Key" 
                                        className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                        onError={(e) => { e.target.src = '/assets/w.png'; }} 
                                    />
                                    <div className="flex gap-2">
                                        <img 
                                            src="/assets/keyboard_a.png" 
                                            alt="A Key" 
                                            className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                            onError={(e) => { e.target.src = '/assets/a.png'; }}
                                        />
                                        <img 
                                            src="/assets/keyboard_s.png" 
                                            alt="S Key" 
                                            className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                            onError={(e) => { e.target.src = '/assets/s.png'; }}
                                        />
                                        <img 
                                            src="/assets/keyboard_d.png" 
                                            alt="D Key" 
                                            className="w-14 h-14 md:w-16 md:h-16 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                            onError={(e) => { e.target.src = '/assets/d.png'; }}
                                        />
                                    </div>
                                    <div className="mt-4 px-5 py-2 bg-amber-950/40 border border-amber-900/50 rounded-lg text-center shadow-inner">
                                        <p className="text-amber-400 font-bold tracking-widest text-sm uppercase">Navigate Terrain</p>
                                        <p className="text-amber-200/50 text-xs mt-1">Move forward, back, left, and right</p>
                                    </div>
                                </div>
                                
                                {/* Visual Separator */}
                                <div className="text-amber-700/50 text-3xl md:text-4xl font-black mb-6 md:mb-0 animate-item">+</div>
                                
                                {/* Mouse Icon & Text */}
                                <div className="flex flex-col items-center animate-item">
                                    <img 
                                        src="/assets/left-click.png" 
                                        alt="Mouse Interaction" 
                                        className="w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                                        onError={(e) => { e.target.src = '/assets/scroll.png'; }} 
                                    />
                                    <div className="mt-4 px-5 py-2 bg-amber-950/40 border border-amber-900/50 rounded-lg text-center shadow-inner">
                                        <p className="text-amber-400 font-bold tracking-widest text-sm uppercase">Survey & Extract</p>
                                        <p className="text-amber-200/50 text-xs mt-1">Look around and Left Click on targets</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* --- INFORMATION VIEW (T-Rex / Apatosaurus / Angiosperm / Ammonite) --- */
                        <div className="flex flex-col items-center justify-center w-full h-full py-4">
                            
                            {/* Dinosaur/Plant/Fossil Name Header */}
                            <div className="text-center mb-8 w-full">
                                <div className="text-[10px] uppercase tracking-[0.3em] text-amber-600 font-bold mb-2 animate-item">
                                    Historical Archive
                                </div>
                                <h3 style={{ fontFamily: "'Cinzel', serif" }} className="text-3xl md:text-4xl font-bold text-amber-100 tracking-widest drop-shadow-lg animate-item">
                                    {data.title}
                                </h3>
                                <div className="w-24 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mt-4 animate-item"></div>
                            </div>

                            {/* 3 Slanted Pictures dynamically loaded from archiveData */}
                            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 px-4">
                                {/* Panel 1: Slanted Left */}
                                <div className="w-full md:w-1/3 aspect-[4/5] max-w-[220px] bg-black border-2 border-amber-900/40 rounded-2xl overflow-hidden shadow-2xl transform -rotate-6 hover:rotate-0 hover:scale-105 transition-all duration-500 relative group cursor-pointer animate-item">
                                    <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10"></div>
                                    <img src={data.images[0]} alt="Archive 1" className="w-full h-full object-contain p-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                                
                                {/* Panel 2: Popped forward, slightly Slanted Right */}
                                <div className="w-full md:w-1/3 aspect-[4/5] max-w-[220px] bg-black border-2 border-amber-500/50 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.2)] transform rotate-3 scale-110 hover:rotate-0 hover:scale-115 transition-all duration-500 relative z-10 group cursor-pointer animate-item">
                                    <div className="absolute inset-0 bg-amber-600/10 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10"></div>
                                    <img src={data.images[1]} alt="Archive 2" className="w-full h-full object-contain p-6 opacity-100" />
                                </div>
                                
                                {/* Panel 3: Slanted Left */}
                                <div className="w-full md:w-1/3 aspect-[4/5] max-w-[220px] bg-black border-2 border-amber-900/40 rounded-2xl overflow-hidden shadow-2xl transform -rotate-3 hover:rotate-0 hover:scale-105 transition-all duration-500 relative group cursor-pointer animate-item">
                                    <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay group-hover:opacity-0 transition-opacity z-10"></div>
                                    <img src={data.images[2]} alt="Archive 3" className="w-full h-full object-contain p-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className={`absolute -bottom-7 left-1/2 -translate-x-1/2 transition-all duration-700 z-[110] ${canClose ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
                    <button 
                        onClick={() => canClose && onClose()}
                        className="group relative px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 rounded-full font-bold tracking-widest uppercase overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_40px_rgba(245,158,11,0.7)] transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-amber-500/50 flex items-center gap-3 animate-pulse hover:animate-none"
                    >
                        <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full -translate-x-full transition-transform duration-700 ease-out skew-x-12"></div>
                        
                        <span className="relative z-10 flex items-center gap-3">
                            <span>Press</span>
                            <img 
                                src="/assets/keyboard_enter.png" 
                                alt="Enter Key" 
                                className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                onError={(e) => { e.target.src = '/assets/scroll.png'; }}
                            />
                            <span>to continue</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}