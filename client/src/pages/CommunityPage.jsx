import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, Search, LogIn, MessageSquare, 
  Heart, Share2, Flame, Trophy, Users, BookOpen 
} from 'lucide-react';

export default function CommunityPage() {
  const navigate = useNavigate();
  
  // --- AUTH STATE ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({ name: "", avatar: "" });

  // --- COMMUNITY STATE ---
  const [activeTab, setActiveTab] = useState('All Scrolls');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo) {
      setIsLoggedIn(true);
      setUser({
        name: userInfo.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userInfo.avatarSeed || userInfo.name}`
      });
    }
  }, []);

  // --- DUMMY DATA FOR THE FORUM ---
  const categories = ['All Scrolls', 'Theories', 'Discoveries', 'Help & Guides'];
  
  const posts = [
    {
      id: 1,
      author: 'Leonidas',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Leonidas',
      time: '2 hours ago',
      category: 'Discoveries',
      title: 'Found a hidden geothermal vent in the Jurassic era!',
      content: 'If you navigate to the far left of the forest near the volcano border, there is a hidden steam vent. Interacting with it triggered a massive cloud of procedural fog. Has anyone else found this?',
      likes: 124,
      comments: 18,
      hot: true
    },
    {
      id: 2,
      author: 'Scholar_Athena',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Athena',
      time: '5 hours ago',
      category: 'Theories',
      title: 'The Apatosaurus migration patterns might be linked to the meteor event.',
      content: 'I was tracking the Apatosaurus model and noticed its idle animations face away from the meteor strike zone right before it hits. Could the developers have coded predictive survival instincts?',
      likes: 89,
      comments: 32,
      hot: false
    },
    {
      id: 3,
      author: 'MarcusAurelius',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
      time: '1 day ago',
      category: 'Help & Guides',
      title: 'How do I unlock the Ammonite fossil achievement?',
      content: 'I have scoured the beach biome where the sand meets the grass, but I can only find generic rocks. Are there specific coordinates I should be looking at?',
      likes: 45,
      comments: 12,
      hot: false
    }
  ];

  const topScholars = [
    { name: 'Socrates', points: 15420, rank: 1 },
    { name: 'Hypatia', points: 14200, rank: 2 },
    { name: 'Archimedes', points: 12850, rank: 3 },
  ];

  const filteredPosts = posts.filter(post => {
    const matchesTab = activeTab === 'All Scrolls' || post.category === activeTab;
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="min-h-screen text-amber-50 font-body overflow-x-hidden selection:bg-amber-500/30 relative">
      
      {/* ---------------- GLOBAL STYLES ---------------- */}
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
          
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <div className="group-hover:rotate-6 transition-transform flex items-center justify-center">
              <img src="/assets/scroll.png" alt="Scroll Icon" className="w-9 h-9 object-contain rounded-lg" onError={(e) => e.target.style.display='none'} />
            </div>
            <h1 className="text-xl font-heading font-bold text-amber-100 tracking-widest">HISTORIA</h1>
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => navigate("/")} className="text-amber-200/70 hover:text-amber-100 flex items-center gap-2 transition-colors">
              <ChevronLeft size={16} /> Back
            </button>
            
            {/* Dynamic Profile Button */}
            {isLoggedIn ? (
              <button 
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 p-1 pr-4 bg-amber-950/40 border border-amber-500/30 rounded-full hover:bg-amber-900/50 transition-all active:scale-95 group"
              >
                <div className="w-8 h-8 rounded-full border-2 border-amber-500 overflow-hidden group-hover:border-amber-400 transition-colors bg-amber-900">
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <span className="text-sm font-medium text-amber-100 max-w-[100px] truncate">{user.name}</span>
              </button>
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

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24 relative z-10">
        
        {/* Header */}
        <header className="mb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex items-center justify-center md:justify-start gap-3 mb-2 text-amber-500">
              <Users size={20} />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">The Agora</span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-amber-100 tracking-tight drop-shadow-xl">
              Scholars' Forum
            </h2>
            <p className="text-amber-200/60 max-w-xl text-lg mt-3">
              Share discoveries, debate historical theories, and connect with fellow time travelers.
            </p>
          </motion.div>

          <motion.div 
             initial={{ opacity: 0, x: 20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="w-full md:w-auto flex flex-col sm:flex-row gap-4"
          >
            {/* Search Bar */}
            <div className="relative group w-full sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700 group-focus-within:text-amber-400 transition-colors" />
              <input 
                type="text" 
                placeholder="Search the archives..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1a130e]/80 border border-amber-900/50 rounded-full py-3 pl-12 pr-4 text-amber-50 placeholder:text-amber-900/60 focus:outline-none focus:border-amber-500/50 transition-all backdrop-blur-sm shadow-inner"
              />
            </div>
            <button className="whitespace-nowrap px-6 py-3 bg-amber-600 hover:bg-amber-500 text-amber-950 font-bold rounded-full shadow-lg transition-colors border border-amber-400/50">
              Pen a Scroll
            </button>
          </motion.div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT COLUMN: Feed */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Categories */}
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar mask-edges">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveTab(category)}
                  className={`px-5 py-2.5 rounded-full text-sm font-bold tracking-widest uppercase transition-all whitespace-nowrap border ${
                    activeTab === category 
                      ? 'bg-amber-900/40 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]' 
                      : 'bg-black/20 text-amber-200/40 border-transparent hover:bg-black/40 hover:text-amber-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Posts Stream */}
            <AnimatePresence mode="popLayout">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#1a130e]/60 backdrop-blur-md border border-amber-900/40 rounded-2xl p-6 hover:border-amber-600/40 transition-all shadow-xl group"
                  >
                    {/* Post Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full border border-amber-700/50 overflow-hidden bg-[#2a1d15]">
                          <img src={post.avatar} alt={post.author} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-amber-100 text-sm">{post.author}</h4>
                            {post.hot && (
                              <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-red-400 bg-red-950/30 px-2 py-0.5 rounded border border-red-900/50">
                                <Flame size={10} /> Hot
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-amber-200/40">{post.time} • <span className="text-amber-500/60">{post.category}</span></span>
                        </div>
                      </div>
                    </div>

                    {/* Post Body */}
                    <div className="mb-6 cursor-pointer">
                      <h3 className="text-xl font-heading font-bold text-amber-50 mb-2 group-hover:text-amber-400 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-amber-200/60 text-sm leading-relaxed line-clamp-3">
                        {post.content}
                      </p>
                    </div>

                    {/* Post Actions */}
                    <div className="flex items-center gap-6 pt-4 border-t border-amber-900/30">
                      <button className="flex items-center gap-2 text-amber-200/50 hover:text-amber-400 transition-colors text-xs font-bold uppercase tracking-wider">
                        <Heart size={16} /> {post.likes}
                      </button>
                      <button className="flex items-center gap-2 text-amber-200/50 hover:text-amber-400 transition-colors text-xs font-bold uppercase tracking-wider">
                        <MessageSquare size={16} /> {post.comments} Responses
                      </button>
                      <button className="flex items-center gap-2 text-amber-200/50 hover:text-amber-400 transition-colors text-xs font-bold uppercase tracking-wider ml-auto">
                        <Share2 size={16} /> Share
                      </button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="text-center py-20 border border-amber-900/20 border-dashed rounded-2xl bg-black/20"
                >
                  <BookOpen className="w-12 h-12 text-amber-900/50 mx-auto mb-4" />
                  <p className="text-amber-200/40 font-heading tracking-widest text-lg">The archives yield no results.</p>
                  <button onClick={() => setSearchQuery('')} className="mt-2 text-amber-500 text-sm hover:underline">Clear search</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT COLUMN: Leaderboard & Stats */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Top Scholars Widget */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-[#150f0a]/80 backdrop-blur-xl border border-amber-900/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
              
              <div className="flex items-center gap-2 mb-6 border-b border-amber-900/30 pb-4">
                <Trophy className="text-amber-500" size={18} />
                <h3 className="font-heading font-bold text-amber-100 tracking-widest">Top Scholars</h3>
              </div>

              <div className="space-y-4">
                {topScholars.map((scholar) => (
                  <div key={scholar.rank} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                        scholar.rank === 1 ? 'bg-amber-500 text-amber-950' : 
                        scholar.rank === 2 ? 'bg-gray-300 text-gray-900' : 
                        'bg-amber-800 text-amber-100'
                      }`}>
                        {scholar.rank}
                      </div>
                      <span className="text-sm font-bold text-amber-200/80 group-hover:text-amber-200 transition-colors">
                        {scholar.name}
                      </span>
                    </div>
                    <span className="text-xs text-amber-500/60 font-mono">{scholar.points.toLocaleString()} KP</span>
                  </div>
                ))}
              </div>
              
              <button className="w-full mt-6 py-2.5 bg-black/40 border border-amber-900/30 hover:bg-amber-900/30 rounded-xl text-amber-500 text-xs uppercase font-bold tracking-widest transition-colors">
                View Full Rankings
              </button>
            </motion.div>

            {/* Trending Eras Widget */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-[#150f0a]/80 backdrop-blur-xl border border-amber-900/40 rounded-2xl p-6 shadow-2xl"
            >
              <h3 className="font-heading font-bold text-amber-100 tracking-widest mb-4">Active Eras</h3>
              <div className="flex flex-wrap gap-2">
                {['Jurassic', 'Roman Empire', 'Ancient Egypt', 'Earth Formation', 'Hadean Eon'].map(tag => (
                  <span key={tag} className="text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 bg-amber-950/30 border border-amber-900/50 text-amber-200/60 rounded-md cursor-pointer hover:border-amber-500/50 hover:text-amber-400 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </main>

    </div>
  );
}