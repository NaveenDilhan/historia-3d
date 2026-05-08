import React, { useState, useEffect } from 'react';
import { MCQ_DATA } from '../Data/mcqData';

export default function MCQOverlay({ eraId, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isFinished, setIsFinished] = useState(false);

  const questions = MCQ_DATA[eraId];

  useEffect(() => {
    const handleKey = (e) => {
      // If quiz is done, pressing Space completes the section
      if (isFinished) {
        if (e.code === 'Space' || e.code === 'Enter') {
          onComplete(score);
        }
        return;
      }

      // If answering a question
      if (!showResult && e.key >= '1' && e.key <= '4') {
        const answerIdx = parseInt(e.key) - 1;
        setSelectedAnswer(answerIdx);
        setShowResult(true);

        if (answerIdx === questions[currentIndex].a) {
          setScore(s => s + 1);
        }

        // Auto-advance after showing the result for 1.5 seconds
        setTimeout(() => {
          setShowResult(false);
          setSelectedAnswer(null);
          if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
          } else {
            setIsFinished(true);
          }
        }, 1500);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentIndex, showResult, isFinished, score, questions, onComplete]);

  if (!questions) return null;

  return (
    <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-auto">
      <div className="bg-[#0a0a0f] border-2 border-cyan-500/50 p-10 rounded-2xl w-[800px] shadow-[0_0_50px_rgba(0,255,255,0.15)] text-center">
        
        {!isFinished ? (
          <>
            <div className="text-cyan-400 font-mono text-sm tracking-widest mb-6 uppercase">
              System Assessment — Question {currentIndex + 1} / 5
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-10 leading-relaxed">
              {questions[currentIndex].q}
            </h2>

            <div className="grid grid-cols-2 gap-6 text-left">
              {questions[currentIndex].options.map((opt, idx) => {
                let bgClass = "bg-gray-900 border-gray-700 text-gray-300";
                if (showResult) {
                  if (idx === questions[currentIndex].a) bgClass = "bg-emerald-900/50 border-emerald-500 text-emerald-400"; // Correct answer highlights green
                  else if (idx === selectedAnswer) bgClass = "bg-red-900/50 border-red-500 text-red-400"; // Wrong selected answer highlights red
                  else bgClass = "bg-gray-900 border-gray-800 text-gray-600 opacity-50"; 
                }

                return (
                  <div key={idx} className={`p-4 rounded-xl border-2 transition-all duration-300 ${bgClass} flex items-center`}>
                    <span className="bg-black/50 text-cyan-400 w-8 h-8 flex items-center justify-center rounded-lg font-bold mr-4 border border-cyan-500/30">
                      {idx + 1}
                    </span>
                    <span className="font-medium text-lg">{opt}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-10">
             <h2 className="text-4xl font-bold text-white mb-4">Assessment Complete</h2>
             <p className="text-2xl text-cyan-400 mb-8">Score: {score} / 5</p>
             {score === 5 ? (
                <p className="text-emerald-400 mb-8">Flawless analysis. Maximum data gathered.</p>
             ) : (
                <p className="text-amber-400 mb-8">Partial data reconstructed. Progression authorized.</p>
             )}
             <div className="inline-block bg-cyan-500/20 text-cyan-300 px-8 py-3 rounded-full font-mono uppercase tracking-widest border border-cyan-500/50 animate-pulse">
               Press [SPACE] to Resume Simulation
             </div>
          </div>
        )}
      </div>
    </div>
  );
}