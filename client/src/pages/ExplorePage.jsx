import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'
import { Compass, Scroll, ChevronLeft, Star, PlayCircle, Clock } from 'lucide-react'
import LessonPopup from '../components/UI/LessonPopup'

export default function ExplorePage() {
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // --- Mock Auth State (Mirroring Homepage) ---
  const [isLoggedIn] = useState(true); // Assuming logged in for this view

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'lessons'))
        const lessonData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setLessons(lessonData)
      } catch (error) {
        console.error('Error fetching lessons:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchLessons()
  }, [])

  return (
    <div className="min-h-screen text-amber-50 font-body overflow-x-hidden selection:bg-amber-500/30 relative">
      
      {/* ---------------- GLOBAL STYLES (Sync with Homepage) ---------------- */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800&family=Lato:wght@400;700&display=swap');
        .font-heading { font-family: 'Cinzel', serif; }
        .font-body { font-family: 'Lato', sans-serif; }

        .ancient-wall-bg {
          background-color: #1a120b;
          background-image: 
            radial-gradient(circle at 50% -20%, rgba(217, 119, 6, 0.15), rgba(0, 0, 0, 0.9)),
            url("https://www.transparenttextures.com/patterns/wall-4-light.png");
          background-blend-mode: screen, overlay;
          background-attachment: fixed;
        }
      `}</style>

      {/* Background Layers */}
      <div className="fixed inset-0 ancient-wall-bg z-[-2]"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-[-1]"></div>

      {/* ---------------- NAVIGATION ---------------- */}
      <nav className="sticky top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto bg-[#1a120b]/80 backdrop-blur-xl border border-amber-900/30 shadow-2xl rounded-2xl px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="bg-amber-900/50 p-2 rounded-lg border border-amber-700/50">
              <Scroll className="w-5 h-5 text-amber-400" />
            </div>
            <h1 className="text-xl font-heading font-bold text-amber-100 tracking-widest">HISTORIA</h1>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate("/")} className="text-amber-200/70 hover:text-amber-100 flex items-center gap-2 transition-colors">
              <ChevronLeft size={16} /> Back
            </button>
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 overflow-hidden cursor-pointer" onClick={() => navigate("/profile")}>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="Profile" />
            </div>
          </div>
        </div>
      </nav>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* Header Section */}
        <header className="mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-amber-100 mb-4 tracking-tight drop-shadow-xl">
              The Great Library
            </h2>
            <div className="w-32 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto mb-6"></div>
            <p className="text-amber-200/60 max-w-2xl mx-auto text-lg italic">
              "To know where you are going, you must first understand where you have been."
            </p>
          </motion.div>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-heading text-amber-500 tracking-widest">Consulting Archives...</p>
          </div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {lessons.map((lesson) => (
              <motion.div
                key={lesson.id}
                variants={{
                  hidden: { opacity: 0, scale: 0.9 },
                  visible: { opacity: 1, scale: 1 }
                }}
                whileHover={{ y: -10 }}
                onClick={() => setSelectedLesson(lesson)}
                className="group cursor-pointer relative bg-[#1a130e]/60 backdrop-blur-sm border border-amber-900/40 rounded-2xl overflow-hidden hover:border-amber-500/50 transition-all duration-300 shadow-xl"
              >
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-700 to-transparent opacity-50 group-hover:opacity-100 transition-opacity"></div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-amber-600 font-bold border border-amber-900/50 px-2 py-1 rounded">
                      Era {lesson.era || 'I'}
                    </span>
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
                  </div>

                  <h3 className="text-2xl font-heading font-bold text-amber-100 mb-3 group-hover:text-amber-400 transition-colors">
                    {lesson.title}
                  </h3>
                  
                  <p className="text-amber-200/50 text-sm leading-relaxed mb-6 line-clamp-3">
                    {lesson.description}
                  </p>

                  {/* Progress Section */}
                  <div className="space-y-3">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-amber-700">
                      <span>Scholarly Progress</span>
                      <span>{lesson.progress || 0}%</span>
                    </div>
                    <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden border border-amber-950">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${lesson.progress || 0}%` }}
                        className="h-full bg-gradient-to-r from-amber-900 via-amber-600 to-amber-400"
                      ></motion.div>
                    </div>
                  </div>
                </div>

                {/* Footer of Card */}
                <div className="px-8 py-4 bg-amber-950/20 border-t border-amber-900/30 flex items-center justify-between group-hover:bg-amber-900/30 transition-colors">
                  <div className="flex items-center gap-2 text-amber-200/40 text-xs">
                    <Clock size={12} />
                    <span>15 min read</span>
                  </div>
                  <PlayCircle className="text-amber-500 group-hover:scale-110 transition-transform" size={24} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="bg-[#120c08] text-amber-200/40 py-12 border-t border-amber-900/30 relative z-10">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <Scroll className="w-5 h-5" />
            <span className="font-heading font-bold tracking-widest">HISTORIA</span>
          </div>
          <p className="text-xs">© {new Date().getFullYear()} Preservation Society. No rights reserved—history belongs to all.</p>
        </div>
      </footer>

      {/* Lesson Popup Integration */}
      <AnimatePresence>
        {selectedLesson && (
          <LessonPopup
            lesson={selectedLesson}
            onClose={() => setSelectedLesson(null)}
            onPlay={() => {
              setSelectedLesson(null)
              navigate('/scene')
            }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}