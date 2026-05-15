import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function LessonCompleteOverlay({ 
     show, 
     title = "LESSON COMPLETE", 
     message = "The simulation has successfully concluded.",
     medal = null
 }) {
    const navigate = useNavigate();
    const [canProceed, setCanProceed] = useState(false);

    const medalAssetMap = {
        gold: 'medal1',
        silver: 'medal2',
        bronze: 'medal3'
    };

    const getMedalFilename = (medalName) => {
        if (!medalName) return null;
        return medalAssetMap[medalName.toLowerCase()] || medalName;
    };

    useEffect(() => {
        let timer;
        if (show) {
            timer = setTimeout(() => {
                setCanProceed(true);
            }, 1500);
        } else {
            setCanProceed(false);
        }
        return () => clearTimeout(timer);
    }, [show]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (show && canProceed && e.key === 'Enter') {
                navigate('/explore');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [show, canProceed, navigate]);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md px-4">
                    <motion.div
                        initial={{ scale: 0.85, opacity: 0, y: 30 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.85, opacity: 0, y: 30 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col items-center justify-center text-center p-12 md:p-16 border border-amber-500/40 rounded-3xl bg-[#1a120b] shadow-[0_0_100px_rgba(245,158,11,0.2)] relative overflow-visible w-[90vw] max-w-4xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent"></div>
                        
                        {medal && (
                            <div className="mb-8 flex flex-col items-center">
                                <img
                                    src={`/assets/${getMedalFilename(medal)}.png`}
                                    alt={`${medal} Medal`}
                                    className="w-32 h-32 object-contain drop-shadow-[0_0_25px_rgba(245,158,11,0.6)] animate-bounce"
                                />
                                <p className="text-amber-400 font-bold uppercase tracking-widest mt-4 text-sm">
                                    Achievement Unlocked
                                </p>
                            </div>
                        )}

                        <h1 style={{ fontFamily: "'Cinzel', serif" }} className="text-4xl md:text-6xl text-amber-500 font-bold mb-6 tracking-[0.2em] drop-shadow-lg">
                            {title}
                        </h1>
                        
                        <p style={{ fontFamily: "'Lato', sans-serif" }} className="text-amber-100/80 text-lg md:text-xl mb-12 max-w-lg leading-relaxed">
                            {message}
                        </p>
                        
                        <div className={`absolute -bottom-7 left-1/2 -translate-x-1/2 transition-all duration-700 ${canProceed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <div className="group relative px-8 py-3 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 rounded-full font-bold tracking-widest uppercase overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(245,158,11,0.4)] border-2 border-amber-500/50 flex items-center gap-3 animate-pulse">
                                <span className="relative z-10 flex items-center gap-3">
                                    <span>Press</span>
                                    <img 
                                        src="/assets/keyboard_enter.png" 
                                        alt="Enter Key" 
                                        className="w-10 h-10 object-contain drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                                        onError={(e) => { e.target.src = '/assets/scroll.png'; }}
                                    />
                                    <span>to Return to Archives</span>
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}