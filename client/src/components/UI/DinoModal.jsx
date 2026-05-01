import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';

const archiveData = {
    tutorial: {
        title: "ARCHIVE UPLINK ESTABLISHED",
        image: "/assets/scroll.png", // Uses an existing asset as a placeholder
        desc: "Welcome to the simulation. Use [W] [A] [S] [D] to navigate the terrain. Use your [Mouse] to survey the environment. When you encounter indigenous fauna, center your view on them and [Left Click] to extract archival data.",
    },
    trex: {
        title: "TYRANNOSAURUS REX",
        image: "/assets/scroll.png", 
        desc: "Apex predator of the Late Cretaceous. Reaching up to 40 feet in length, this theropod possessed an immensely powerful bite force capable of crushing bone. Its binocular vision made it a terrifyingly effective tracker.",
    },
    apatosaurus: {
        title: "APATOSAURUS",
        image: "/assets/scroll.png",
        desc: "A colossal sauropod from the Late Jurassic. It utilized its immense, whip-like tail for defense against predators. Despite its fearsome size, it was a gentle herbivore that shaped the ancient forests.",
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
            <div ref={modalRef} className="relative w-full max-w-2xl bg-[#1a120b] border border-amber-900/50 rounded-3xl shadow-[0_0_60px_rgba(245,158,11,0.15)] overflow-hidden">
                {/* Decorative Top Line */}
                <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-80"></div>

                <button 
                    onClick={onClose} 
                    className="absolute top-4 right-4 z-10 p-2 bg-black/40 hover:bg-amber-900/50 text-amber-500 rounded-full transition-colors border border-amber-900/50"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col md:flex-row h-full">
                    {/* Image Section */}
                    <div className="md:w-2/5 relative h-48 md:h-auto bg-black border-r border-amber-900/30 flex items-center justify-center overflow-hidden">
                        <div className="absolute inset-0 bg-amber-900/20 mix-blend-overlay z-10"></div>
                        <img src={data.image} alt={data.title} className="w-2/3 h-2/3 object-contain opacity-70 drop-shadow-2xl" />
                    </div>

                    {/* Info Section */}
                    <div className="md:w-3/5 p-8 md:p-10 flex flex-col justify-center">
                        <div className="text-[10px] uppercase tracking-[0.3em] text-amber-600 font-bold mb-2">
                            Historical Archive
                        </div>
                        <h3 style={{ fontFamily: "'Cinzel', serif" }} className="text-2xl md:text-3xl font-bold text-amber-100 mb-4 tracking-wider">
                            {data.title}
                        </h3>
                        <div className="w-16 h-px bg-amber-700/50 mb-6"></div>
                        <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-amber-200/70 leading-relaxed text-sm">
                            {data.desc}
                        </p>

                        <button 
                            onClick={onClose} 
                            className="mt-8 self-start px-6 py-2.5 bg-amber-900/20 border border-amber-600/40 text-amber-400 text-xs uppercase tracking-widest font-bold rounded-lg hover:bg-amber-600 hover:text-amber-950 transition-all active:scale-95"
                        >
                            Close Archive
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}