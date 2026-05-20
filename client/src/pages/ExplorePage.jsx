import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Compass, Users, Clock, LogIn, Calendar, Search, Filter, 
  Globe, PlayCircle, Lock, Zap, Heart, Twitter, Github, Mail, ChevronRight 
} from 'lucide-react';
import LessonPopup from '../components/UI/LessonPopup';

// Helper to construct the customized avatar URL
const buildAvatarUrl = (seed, options) => {
    let url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'Scholar'}`;
    if (options) {
        if (options.skinColor) url += `&skinColor=${options.skinColor}`;
        if (options.top) url += `&top=${options.top}`;
        if (options.accessories && options.accessories !== "none") url += `&accessories=${options.accessories}`;
    }
    return url;
};

export default function ExplorePage() {
  const [lessons, setLessons] = useState([]);
  const [userAchievements, setUserAchievements] = useState([]);
  const [unlockedLessons, setUnlockedLessons] = useState([]);
  const [knowledgePoints, setKnowledgePoints] = useState(0);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- SEARCH & FILTER STATE ---
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEra, setSelectedEra] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const navigate = useNavigate();

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({
    name: "",
    avatar: ""
  });

  // Helper to convert medal to progress percentage
  const getProgressFromMedal = (medal) => {
      if (medal === 'gold') return 100;
      if (medal === 'silver') return 50;
      if (medal === 'bronze') return 25;
      return 0;
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      setIsLoggedIn(true);
      
      // Determine display name
      const displayName = userInfo.firstName 
        ? `${userInfo.firstName} ${userInfo.lastName}`
        : (userInfo.name || userInfo.username || 'Scholar');

      // Immediately load the configured avatar from local storage
      setUser({
        name: displayName,
        avatar: buildAvatarUrl(userInfo.avatarSeed, userInfo.avatarOptions)
      });

      // Fetch full profile to keep stats and avatar perfectly in sync
      fetch("http://localhost:5000/api/users/profile", { credentials: "include" })
        .then(res => res.json())
        .then(data => {
            if (data.achievements) setUserAchievements(data.achievements);
            if (data.unlockedLessons) setUnlockedLessons(data.unlockedLessons);
            if (data.stats) setKnowledgePoints(data.stats.knowledgePoints);
            
            // Sync avatar and name in case they were updated in another tab/device
            const fetchedName = data.firstName ? `${data.firstName} ${data.lastName}` : (data.username || 'Scholar');
            setUser({
              name: fetchedName,
              avatar: buildAvatarUrl(data.avatarSeed, data.avatarOptions)
            });
        })
        .catch(console.error);
    }
  }, []);

  useEffect(() => {
    const fetchLessons = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/lessons');
        
        if (!response.ok) throw new Error('Failed to fetch from the Great Library');
        
        const lessonData = await response.json();
        setLessons(lessonData);
      } catch (err) {
        console.error('Error fetching lessons:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLessons();
  }, []);

  const getLessonStats = (lesson) => {
      const lessonId = lesson.slug || lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const ach = userAchievements.find(a => a.lessonId === lessonId);
      
      const timeSpent = ach?.timeSpent ? ach.timeSpent : (ach ? ach.eventsFound * 5 : 0);
      
      return {
          medal: ach ? ach.medal : null,
          timeSpent: `${timeSpent}m`,
          lastPlayed: ach?.unlockedAt 
            ? new Date(ach.unlockedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) 
            : 'Never played'
      };
  };

  // Callback to update local state when a lesson is successfully unlocked in the popup
  const handleUnlockSuccess = (newKP, newUnlockedList) => {
    setKnowledgePoints(newKP);
    setUnlockedLessons(newUnlockedList);
  };

  // --- FILTERING LOGIC ---
  const availableEras = useMemo(() => {
      const eras = lessons.map(l => l.era).filter(Boolean);
      return [...new Set(eras)];
  }, [lessons]);

  const availableRegions = useMemo(() => {
      const regions = lessons.map(l => l.region).filter(Boolean);
      return [...new Set(regions)];
  }, [lessons]);

  const filteredLessons = useMemo(() => {
      return lessons.filter(lesson => {
          const matchesSearch = 
            lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lesson.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (lesson.tags && lesson.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
            
          const matchesEra = selectedEra === 'All' || lesson.era === selectedEra;
          const matchesRegion = selectedRegion === 'All' || lesson.region === selectedRegion;

          return matchesSearch && matchesEra && matchesRegion;
      });
  }, [lessons, searchQuery, selectedEra, selectedRegion]);

  return (
    <div className="min-h-screen text-amber-50 font-body overflow-x-hidden selection:bg-amber-500/30 relative">
      
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
        /* Custom Scrollbar for select elements */
        select option { background-color: #1a120b; color: #fef3c7; }
      `}</style>

      <div className="fixed inset-0 ancient-wall-bg z-[-2]"></div>
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-[-1]"></div>

      <nav className="sticky top-0 w-full z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto bg-[#1a120b]/80 backdrop-blur-xl border border-amber-900/30 shadow-2xl rounded-2xl px-6 py-3 flex justify-between items-center">
          
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="group-hover:rotate-6 transition-transform flex items-center justify-center">
               <img src="/assets/scroll.png" alt="Scroll Icon" className="w-9 h-9 object-contain rounded-lg" />
            </div>
            <img 
               src="/assets/dark_brown.png" 
               alt="Historia Banner" 
               className="h-6 md:h-8 object-contain drop-shadow-md"
               style={{ filter: "brightness(0) invert(1) sepia(1) saturate(5) hue-rotate(5deg)" }}
            />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <NavLink onClick={() => navigate("/explore")} icon={<Compass size={16} />} label="Explore" isActive={true} />
            <NavLink onClick={() => navigate("/community")} icon={<Users size={16} />} label="Community" isActive={false} />
            
            <div className="w-px h-6 bg-amber-900/50 mx-2"></div>
            
            {isLoggedIn ? (
              <div className="flex items-center gap-4">
                {/* KP Display / Link to Store */}
                <div 
                  onClick={() => navigate('/store')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-amber-900/20 border border-amber-500/30 rounded-full text-amber-300 font-bold tracking-widest text-xs cursor-pointer hover:bg-amber-900/50 hover:border-amber-400 transition-all group shadow-inner"
                  title="Acquire more Knowledge Points"
                >
                    <Zap size={14} className="text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform" />
                    <span>{knowledgePoints} KP</span>
                    <span className="text-amber-600 ml-1 font-black group-hover:text-amber-400 transition-colors">+</span>
                </div>
                
                {/* User Profile */}
                <button 
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-3 p-1 pr-4 bg-amber-950/40 border border-amber-500/30 rounded-full hover:bg-amber-900/50 transition-all active:scale-95 group"
                >
                  <div className="w-8 h-8 rounded-full border-2 border-amber-500 overflow-hidden group-hover:border-amber-400 transition-colors bg-amber-900">
                    <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-medium text-amber-100 max-w-[100px] truncate">{user.name}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 px-5 py-2 rounded-lg font-medium text-sm hover:brightness-110 shadow-lg border border-amber-600/30 transition-all active:scale-95"
              >
                <LogIn size={16} />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        <header className="mb-10 text-center">
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

        {/* --- SEARCH AND FILTER WIDGET --- */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between bg-[#150f0a]/60 p-4 rounded-2xl border border-amber-900/40 shadow-lg backdrop-blur-md"
        >
          {/* Text Search */}
          <div className="relative w-full md:w-1/2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-amber-700" />
            <input
              type="text"
              placeholder="Search archives by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-amber-900/50 rounded-xl py-3 pl-12 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all placeholder:text-amber-900/60"
            />
          </div>

          {/* Category Dropdowns */}
          <div className="flex w-full md:w-auto gap-4">
            <div className="relative w-full md:w-48 group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors" />
              <select
                value={selectedEra}
                onChange={(e) => setSelectedEra(e.target.value)}
                className="w-full bg-black/40 border border-amber-900/50 rounded-xl py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Time Periods</option>
                {availableEras.map(era => <option key={era} value={era}>{era}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-700">▼</div>
            </div>

            <div className="relative w-full md:w-48 group">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full bg-black/40 border border-amber-900/50 rounded-xl py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all appearance-none cursor-pointer"
              >
                <option value="All">All Regions</option>
                {availableRegions.map(region => <option key={region} value={region}>{region}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-amber-700">▼</div>
            </div>
          </div>
        </motion.div>

        {/* --- DYNAMIC RENDER AREA --- */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 font-heading text-amber-500 tracking-widest">Consulting Archives...</p>
          </div>
        ) : error ? (
            <div className="text-center py-20">
                <p className="text-red-400 font-heading tracking-widest mb-4">The scrolls are missing: {error}</p>
                <button onClick={() => window.location.reload()} className="text-amber-500 underline">Try again</button>
            </div>
        ) : filteredLessons.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20 border border-amber-900/20 border-dashed rounded-3xl bg-black/20">
                <Compass className="w-12 h-12 text-amber-900/50 mx-auto mb-4" />
                <p className="text-amber-200/40 font-heading tracking-widest text-lg">No records match your criteria.</p>
                <button onClick={() => { setSearchQuery(''); setSelectedEra('All'); setSelectedRegion('All'); }} className="mt-2 text-amber-500 text-sm hover:underline">Clear all filters</button>
            </motion.div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredLessons.map((lesson, index) => {
              const stats = getLessonStats(lesson);
              const calculatedProgress = getProgressFromMedal(stats.medal);
              const lessonSlug = lesson.slug || lesson.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
              
              // Check if locked
              const isLocked = lesson.isPremium && !unlockedLessons.includes(lessonSlug);
              
              // Calculate a dynamic background position to "break apart" the map across cards
              const bgPosX = (index % 3) * 50;
              const bgPosY = Math.floor(index / 3) * 50;

              return (
                <motion.div
                  key={lesson._id}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    visible: { opacity: 1, scale: 1 }
                  }}
                  whileHover={{ y: -10 }}
                  onClick={() => setSelectedLesson({ ...lesson, slug: lessonSlug, medal: stats.medal, progress: calculatedProgress, isLocked })}
                  className={`group cursor-pointer relative bg-[#1a130e]/80 border ${isLocked ? 'border-zinc-800' : 'border-amber-900/40 hover:border-amber-500/50'} rounded-2xl overflow-hidden transition-all duration-300 shadow-xl flex flex-col`}
                >
                  {/* Map Background Fragment */}
                  <div 
                    className={`absolute inset-0 z-0 opacity-30 mix-blend-screen pointer-events-none transition-opacity duration-500 group-hover:opacity-60 ${isLocked ? 'grayscale opacity-10' : ''}`}
                    style={{
                      backgroundImage: `url("/assets/map.webp")`,
                      backgroundSize: '300% 300%',
                      backgroundPosition: `${bgPosX}% ${bgPosY}%`
                    }}
                  />
                  
                  <div className={`absolute top-0 left-0 w-full h-1 ${isLocked ? 'bg-zinc-800' : 'bg-gradient-to-r from-transparent via-amber-700 to-transparent'} opacity-50 group-hover:opacity-100 transition-opacity z-10`}></div>
                  
                  <div className="p-8 flex-1 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[10px] uppercase tracking-[0.3em] font-bold border px-2 py-1 rounded bg-[#1a120b]/80 ${isLocked ? 'text-zinc-500 border-zinc-800' : 'text-amber-600 border-amber-900/50'}`}>
                        {lesson.era ? lesson.era.replace(/era/i, '').trim() : 'MESOZOIC'}
                      </span>
                      
                      {/* Region Tag */}
                      {lesson.region && lesson.region !== 'Global' && (
                        <span className={`text-[9px] uppercase tracking-[0.2em] font-bold border px-2 py-1 rounded flex items-center gap-1 ${isLocked ? 'text-zinc-600 border-zinc-800 bg-black/40' : 'text-amber-200/50 border-amber-900/30 bg-black/40'}`}>
                          <Globe size={10} /> {lesson.region}
                        </span>
                      )}
                    </div>
                    
                    <h3 className={`text-2xl font-heading font-bold mb-3 transition-colors drop-shadow-md flex items-center gap-3 ${isLocked ? 'text-zinc-400' : 'text-amber-100 group-hover:text-amber-400'}`}>
                      {isLocked && <Lock size={20} className="text-zinc-500" />}
                      {lesson.title}
                    </h3>
                    
                    <p className={`text-sm leading-relaxed mb-6 line-clamp-3 ${isLocked ? 'text-zinc-600' : 'text-amber-200/50'}`}>
                      {lesson.description}
                    </p>

                    <div className="space-y-3 mt-auto">
                      <div className={`flex justify-between text-[10px] font-bold uppercase tracking-widest ${isLocked ? 'text-zinc-700' : 'text-amber-700'}`}>
                        <span>Progress</span>
                      </div>
                      <div className="w-full bg-black/60 h-1.5 rounded-full overflow-hidden border border-black/80">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${calculatedProgress}%` }}
                          className={`h-full ${isLocked ? 'bg-zinc-700' : 'bg-gradient-to-r from-amber-900 via-amber-600 to-amber-400'}`}
                        ></motion.div>
                      </div>
                    </div>
                  </div>
                  
                  {/* FOOTER */}
                  <div className={`px-8 py-4 bg-[#110b08]/80 border-t flex items-center justify-between relative z-10 ${isLocked ? 'border-zinc-900' : 'border-amber-900/30 group-hover:bg-amber-900/20'} transition-colors`}>
                    <div className="flex flex-col gap-1.5">
                      <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${isLocked ? 'text-zinc-600' : 'text-amber-200/50'}`}>
                        <Clock size={12} className={isLocked ? "text-zinc-600" : "text-amber-600"} />
                        <span>{stats.timeSpent} Spent</span>
                      </div>
                      <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest ${isLocked ? 'text-zinc-700' : 'text-amber-500/40'}`}>
                        <Calendar size={10} />
                        <span>Last: {stats.lastPlayed}</span>
                      </div>
                    </div>
                    {isLocked ? (
                        <div className="flex items-center gap-1.5 text-zinc-400 font-bold text-xs uppercase tracking-widest">
                             <Zap size={14} className="fill-zinc-400" /> {lesson.kpCost} KP
                        </div>
                    ) : (
                        <PlayCircle className="text-amber-500 group-hover:scale-110 group-hover:text-amber-400 transition-all drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" size={32} strokeWidth={1.5} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>

      {/* UPDATED VISUAL FOOTER */}
      <footer className="bg-gradient-to-b from-[#120c08] to-black text-amber-200/60 py-16 border-t border-amber-900/50 relative z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-screen pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-12 gap-12 relative z-10">
          
          {/* Brand & Description */}
          <div className="col-span-1 md:col-span-4 space-y-6">
              <div className="flex items-center gap-3 text-amber-100 group cursor-pointer">
                <img src="/assets/scroll.png" alt="Scroll Icon" className="w-10 h-10 object-contain opacity-90 rounded-lg group-hover:rotate-6 transition-transform" />
                <span className="font-heading font-bold text-2xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">HISTORIA</span>
              </div>
              <p className="text-sm leading-relaxed max-w-sm">
                Preserving the past for the future. An open-source initiative blending WebGL and AI to digitize human history into immersive, interactive experiences.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <SocialIcon icon={<Twitter size={18} />} />
                <SocialIcon icon={<Github size={18} />} />
                <SocialIcon icon={<Mail size={18} />} />
              </div>
          </div>

          {/* Quick Links */}
          <div className="col-span-1 md:col-span-2">
              <h4 className="text-amber-500 font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-2">Platform</h4>
              <ul className="space-y-4 text-sm font-medium">
                 <FooterLink label="Explore Eras" />
                 <FooterLink label="Community Forum" />
                 <FooterLink label="Artifact Store" />
              </ul>
          </div>

          {/* Resources */}
          <div className="col-span-1 md:col-span-2">
              <h4 className="text-amber-500 font-bold mb-6 uppercase text-xs tracking-widest flex items-center gap-2">Resources</h4>
              <ul className="space-y-4 text-sm font-medium">
                 <FooterLink label="Credits & Team" />
                 <FooterLink label="My Profile" />
                 <li className="hover:text-amber-200 cursor-default transition-colors flex items-center gap-2 group opacity-60">
                   <span className="w-1.5 h-1.5 rounded-full bg-amber-700 transition-colors"></span>
                   Educators API <span className="text-[9px] bg-amber-900/50 text-amber-400 px-1.5 py-0.5 rounded ml-1 border border-amber-700/50">SOON</span>
                 </li>
              </ul>
          </div>

          {/* Newsletter / Keep In Touch */}
          <div className="col-span-1 md:col-span-4 bg-[#1a120b]/50 p-6 rounded-2xl border border-amber-900/30 shadow-inner">
              <h4 className="text-amber-400 font-bold mb-3 uppercase text-xs tracking-widest">Join the Expedition</h4>
              <p className="text-xs mb-4 text-amber-200/50 leading-relaxed">Get monthly dispatches on new historical eras, community events, and 3D artifact drops directly to your inbox.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your parchment..." 
                  className="bg-[#0f0a06] border border-amber-900/50 rounded-lg px-4 py-2 text-sm w-full text-amber-100 placeholder:text-amber-700/50 focus:outline-none focus:border-amber-500 transition-colors"
                />
                <button className="bg-gradient-to-br from-amber-700 to-amber-900 hover:from-amber-600 hover:to-amber-800 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center border border-amber-500/30">
                  <ChevronRight size={18} />
                </button>
              </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto px-8 mt-16 pt-8 border-t border-amber-900/30 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p className="flex items-center gap-1 text-amber-200/40">
            © {new Date().getFullYear()} Historia Project. Built with <Heart size={12} className="text-red-900 mx-1 fill-red-900" /> for history.
          </p>
          <div className="flex gap-6 text-amber-200/40">
            <span className="hover:text-amber-300 transition-colors cursor-pointer">Privacy Doctrine</span>
            <span className="hover:text-amber-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="hover:text-amber-300 transition-colors cursor-pointer">Cookie Manifesto</span>
          </div>
        </div>
      </footer>

      <AnimatePresence>
        {selectedLesson && (
          <LessonPopup 
            lesson={selectedLesson}
            userKP={knowledgePoints}
            isLoggedIn={isLoggedIn}
            onUnlockSuccess={handleUnlockSuccess}
            onClose={() => setSelectedLesson(null)}
            onPlay={() => {
              const routeId = selectedLesson.slug;
              setSelectedLesson(null);
              navigate(`/scene/${routeId}`);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// NavLink Component matching HomePage styling
function NavLink({ icon, label, onClick, isActive }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 font-medium transition-colors group relative ${isActive ? 'text-amber-400' : 'text-amber-200/70 hover:text-amber-100'}`}
    >
      <span className="group-hover:-translate-y-0.5 transition-transform duration-300">{icon}</span>
      <span>{label}</span>
      <span className={`absolute -bottom-1 left-0 h-[1px] transition-all duration-300 ${isActive ? 'w-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]' : 'w-0 bg-amber-400 group-hover:w-full'}`}></span>
    </button>
  );
} 

// Static Footer Helper Components
function FooterLink({ label }) {
  return (
    <li>
      <span className="cursor-pointer hover:text-amber-200 transition-all flex items-center gap-2 group text-amber-200/60">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-700 group-hover:bg-amber-400 transition-colors group-hover:scale-125"></span>
        <span className="group-hover:translate-x-1 transition-transform">{label}</span>
      </span>
    </li>
  );
}

function SocialIcon({ icon }) {
  return (
    <button className="w-9 h-9 rounded-full bg-amber-950/40 border border-amber-900/50 flex items-center justify-center hover:bg-amber-900 hover:border-amber-600 hover:text-amber-100 transition-all hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(217,119,6,0.2)]">
      {icon}
    </button>
  );
}