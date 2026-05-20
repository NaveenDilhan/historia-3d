import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Save, Edit2, LogOut, ChevronLeft, 
  Trophy, BookOpen, Map, Crown, RefreshCw, Sparkles,
  Calendar, Brain, Compass, AtSign
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const availableInterests = [
    "Ancient Civilizations", "Space Exploration", "Medieval History", 
    "Paleontology", "World Wars", "Industrial Revolution"
  ];

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    bio: "",
    avatarSeed: "",
    avatarOptions: { skinColor: "f8d25c", top: "shortFlat", accessories: "none" },
    title: "",
    age: "",
    experienceLevel: "Beginner",
    historicalInterests: [],
    stats: { knowledgePoints: 0, erasExplored: 0, artifactsFound: 0 },
    achievements: [] 
  });

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    bio: "",
    avatarSeed: "",
    avatarOptions: { skinColor: "f8d25c", top: "shortFlat", accessories: "none" },
    age: "",
    experienceLevel: "",
    historicalInterests: []
  });

  const medalAssetMap = { gold: 'medal1', silver: 'medal2', bronze: 'medal3' };
  const getMedalFilename = (medalName) => {
      if (!medalName) return null;
      return medalAssetMap[medalName.toLowerCase()] || medalName;
  };

  const buildAvatarUrl = (seed, options) => {
    let url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'Scholar'}`;
    
    // Map old/invalid database entries to valid DiceBear 7.x options
    const topMapper = {
      'shortHair': 'shortFlat',
      'longHair': 'straight01',
      'eyepatch': 'noHair'
    };

    if (options) {
        if (options.skinColor) url += `&skinColor=${options.skinColor}`;
        if (options.top) {
            const mappedTop = topMapper[options.top] || options.top;
            url += `&top=${mappedTop}`;
        }
        if (options.accessories && options.accessories !== "none") url += `&accessories=${options.accessories}`;
    }
    return url;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "GET", credentials: "include", headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const data = await res.json();
        
        // Ensure options exist
        const safeOptions = data.avatarOptions || { skinColor: "f8d25c", top: "shortFlat", accessories: "none" };
        
        setProfile({
            ...data,
            avatarOptions: safeOptions,
            age: data.age || "",
            experienceLevel: data.experienceLevel || "Beginner",
            historicalInterests: data.historicalInterests || [],
            achievements: data.achievements || []
        });
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          username: data.username,
          email: data.email,
          bio: data.bio,
          avatarSeed: data.avatarSeed,
          avatarOptions: safeOptions,
          age: data.age || "",
          experienceLevel: data.experienceLevel || "Beginner",
          historicalInterests: data.historicalInterests || []
        });
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleInterestToggle = (interest) => {
    setFormData(prev => ({
      ...prev,
      historicalInterests: prev.historicalInterests.includes(interest)
        ? prev.historicalInterests.filter(i => i !== interest)
        : [...prev.historicalInterests, interest]
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
          ...formData,
          age: formData.age ? parseInt(formData.age, 10) : null
      };

      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const updatedData = await res.json();
        setProfile({
            ...updatedData,
            age: updatedData.age || "",
            achievements: updatedData.achievements || []
        });
        
        localStorage.setItem("userInfo", JSON.stringify({ 
          name: `${updatedData.firstName} ${updatedData.lastName}`,
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          username: updatedData.username,
          email: updatedData.email,
          avatarSeed: updatedData.avatarSeed,
          avatarOptions: updatedData.avatarOptions
        }));
        
        setIsEditing(false);
        setMessage({ type: "success", text: "Identity updated successfully." });
      } else {
        const errData = await res.json();
        setMessage({ type: "error", text: errData.message || "Failed to update profile." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Server error." });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogout = async () => {
    try {
        await fetch("http://localhost:5000/api/auth/logout", { method: "POST", credentials: "include" });
    } catch (error) {}
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  const rerollAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setFormData({ ...formData, avatarSeed: randomSeed });
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1a120b] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen text-amber-50 font-body ancient-wall-bg relative overflow-x-hidden selection:bg-amber-500/30">
      <div className="fixed inset-0 bg-[#1a120b]/90 z-[-1]"></div>
      <div className="fixed inset-0 bg-radial-gradient(circle at center, transparent 0%, #000 100%) pointer-events-none z-0"></div>

      <nav className="p-6 relative z-10">
        <button 
          onClick={() => navigate("/explore")}
          className="flex items-center gap-2 text-amber-500/80 hover:text-amber-400 transition-colors uppercase text-xs font-bold tracking-widest"
        >
          <ChevronLeft size={16} /> Back to Library
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pb-20 relative z-10">
        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`fixed top-10 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg border ${
                message.type === 'success' ? 'bg-emerald-900/80 border-emerald-500/50 text-emerald-100' : 'bg-red-900/80 border-red-500/50 text-red-100'
              } backdrop-blur-md shadow-xl z-50 flex items-center gap-2`}
            >
              {message.type === 'success' ? <Sparkles size={16} /> : null}
              {message.text}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT COLUMN */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#150f0a]/60 backdrop-blur-xl border border-amber-900/40 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative inline-block mb-6 group">
                <div className="w-40 h-40 rounded-full border-4 border-amber-800/50 shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden bg-[#2a1d15] relative z-10">
                  <img 
                    src={buildAvatarUrl(
                        isEditing ? formData.avatarSeed : profile.avatarSeed, 
                        isEditing ? formData.avatarOptions : profile.avatarOptions
                    )} 
                    alt="Scholar Avatar" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-900 text-amber-400 p-2 rounded-full border border-amber-700/50 shadow-lg">
                  <Crown size={16} fill="currentColor" />
                </div>

                {isEditing && (
                  <motion.button
                    whileTap={{ rotate: 180 }} onClick={rerollAvatar} type="button"
                    className="absolute bottom-0 right-0 bg-amber-600 hover:bg-amber-500 text-white p-2.5 rounded-full shadow-lg border border-amber-400/30 transition-colors z-20"
                    title="Randomize Base Face"
                  >
                    <RefreshCw size={16} />
                  </motion.button>
                )}
              </div>

              {!isEditing ? (
                <>
                  <h2 className="text-2xl font-heading font-bold text-amber-100">{profile.firstName} {profile.lastName}</h2>
                  <p className="text-amber-500/80 text-xs font-bold tracking-widest mt-1 mb-1">@{profile.username}</p>
                  
                  <div className="mt-4 mb-4 flex items-center justify-center gap-2">
                      <span className="text-amber-500 text-[10px] uppercase tracking-widest font-bold border border-amber-500/30 bg-amber-950/40 px-2 py-1 rounded">{profile.title}</span>
                      <span className="text-amber-700 text-[10px] uppercase tracking-widest font-bold border border-amber-900/50 bg-black/40 px-2 py-1 rounded flex items-center gap-1"><Brain size={10}/> {profile.experienceLevel}</span>
                  </div>
                  
                  <div className="inline-block bg-amber-950/40 px-4 py-2 rounded-lg border border-amber-900/30 text-amber-200/60 text-sm italic w-full">
                    "{profile.bio}"
                  </div>

                  {profile.historicalInterests.length > 0 && (
                      <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                          {profile.historicalInterests.map(interest => (
                              <span key={interest} className="px-2 py-1 bg-black/40 border border-amber-900/30 text-amber-600 text-[9px] uppercase tracking-wider rounded">
                                  {interest}
                              </span>
                          ))}
                      </div>
                  )}
                  
                  <div className="mt-8 pt-8 border-t border-amber-900/30">
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="w-full py-3 bg-amber-900/20 border border-amber-700/30 hover:bg-amber-900/40 text-amber-200 rounded-xl transition-all flex items-center justify-center gap-2 font-bold text-sm"
                    >
                      <Edit2 size={16} /> Update Identity
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4 text-left mt-6 border-t border-amber-900/30 pt-4">
                  <p className="text-xs text-amber-500/80 uppercase tracking-widest font-bold mb-4 text-center">Avatar Customization</p>
                  
                  <div className="space-y-1">
                    <label className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Skin Tone</label>
                    <select 
                      value={formData.avatarOptions.skinColor} 
                      onChange={e => setFormData({...formData, avatarOptions: {...formData.avatarOptions, skinColor: e.target.value}})} 
                      className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-2 text-amber-50 text-xs outline-none"
                    >
                        <option value="614335">Dark Brown</option>
                        <option value="ae5d29">Brown</option>
                        <option value="d08b5b">Light Brown</option>
                        <option value="edb98a">Tan</option>
                        <option value="f8d25c">Yellow</option>
                        <option value="fd9841">Orange</option>
                        <option value="ffdbb4">Pale</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Hair & Headwear</label>
                    <select 
                      value={formData.avatarOptions.top} 
                      onChange={e => setFormData({...formData, avatarOptions: {...formData.avatarOptions, top: e.target.value}})} 
                      className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-2 text-amber-50 text-xs outline-none"
                    >
                        <option value="shortFlat">Short Hair</option>
                        <option value="straight01">Long Hair</option>
                        <option value="bob">Bob Cut</option>
                        <option value="bun">Bun</option>
                        <option value="curly">Curly</option>
                        <option value="dreads">Dreads</option>
                        <option value="fro">Afro</option>
                        <option value="shaggy">Shaggy</option>
                        <option value="turban">Turban</option>
                        <option value="hijab">Hijab</option>
                        <option value="hat">Hat</option>
                        <option value="winterHat1">Winter Hat</option>
                        <option value="noHair">Bald / No Hair</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-amber-500 uppercase tracking-widest font-bold">Accessories / Glasses</label>
                    <select 
                      value={formData.avatarOptions.accessories} 
                      onChange={e => setFormData({...formData, avatarOptions: {...formData.avatarOptions, accessories: e.target.value}})} 
                      className="w-full bg-black/40 border border-amber-900/50 rounded-lg p-2 text-amber-50 text-xs outline-none"
                    >
                        <option value="none">None</option>
                        <option value="round">Round Glasses</option>
                        <option value="kurt">Kurt Glasses</option>
                        <option value="prescription01">Prescription 1</option>
                        <option value="prescription02">Prescription 2</option>
                        <option value="sunglasses">Sunglasses</option>
                        <option value="wayfarers">Wayfarers</option>
                    </select>
                  </div>
                </div>
              )}
            </motion.div>

            <motion.button 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full mt-4 py-4 bg-red-950/20 border border-red-900/30 hover:bg-red-900/30 text-red-400/80 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest"
            >
              <LogOut size={16} /> Disconnect from Archives
            </motion.button>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <StatCard icon={<Trophy className="text-yellow-500" />} value={profile.stats?.knowledgePoints || 0} label="Knowledge Points" />
              <StatCard icon={<Map className="text-emerald-500" />} value={profile.stats?.erasExplored || 0} label="Eras Explored" />
              <StatCard icon={<BookOpen className="text-blue-500" />} value={profile.stats?.artifactsFound || 0} label="Artifacts Found" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-[#150f0a]/60 backdrop-blur-xl border border-amber-900/40 rounded-3xl p-8 relative"
            >
              {isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-heading text-xl text-amber-100">Edit Profile Details</h3>
                    <button 
                      type="button" 
                      onClick={() => { setIsEditing(false); setFormData(profile); }} 
                      className="text-xs text-amber-500/60 hover:text-amber-400 uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80">First Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
                        <input 
                          type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Last Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
                        <input 
                          type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Username</label>
                      <div className="relative">
                        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
                        <input 
                          type="text" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
                          className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Email Archive</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
                        <input 
                          type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 flex items-center gap-2"><Calendar size={12}/> Age (Optional)</label>
                        <input 
                            type="number" min="1" max="120" value={formData.age} onChange={(e) => setFormData({...formData, age: e.target.value})}
                            className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 px-4 text-amber-50 focus:border-amber-500/80 outline-none transition-all" 
                        />
                    </div>
                    
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 flex items-center gap-2"><Brain size={12}/> Experience</label>
                        <select 
                            value={formData.experienceLevel} onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                            className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 px-4 text-amber-50 focus:border-amber-500/80 outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="Beginner">Beginner Explorer</option>
                            <option value="Enthusiast">History Enthusiast</option>
                            <option value="Scholar">Advanced Scholar</option>
                        </select>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-3 pt-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80 flex items-center gap-2"><Compass size={12}/> Areas of Interest</label>
                        <div className="flex flex-wrap gap-2">
                            {availableInterests.map(interest => (
                                <button
                                    key={interest} type="button" onClick={() => handleInterestToggle(interest)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${
                                        formData.historicalInterests.includes(interest) 
                                        ? 'bg-amber-600/20 border-amber-500 text-amber-300' 
                                        : 'bg-black/30 border-amber-900/30 text-amber-600 hover:border-amber-700'
                                    }`}
                                >
                                    {interest}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-2 mt-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Personal Chronicle (Bio)</label>
                      <textarea 
                        value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows="3"
                        className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 px-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex gap-4">
                    <button 
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-amber-700 to-amber-900 text-amber-50 font-bold py-3 rounded-xl shadow-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 border border-amber-600/30"
                    >
                      <Save size={18} /> Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6 pb-6 border-b border-amber-900/30">
                    <h3 className="font-heading text-xl text-amber-100">Scholarly Achievements</h3>
                  </div>
                  
                  {profile.achievements && profile.achievements.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-2">
                      {profile.achievements.map((ach) => (
                        <div key={ach.lessonId} className="bg-black/30 p-4 rounded-2xl border border-amber-900/30 flex flex-col items-center justify-center hover:border-amber-500/50 transition-colors shadow-inner">
                          <img 
                            src={`/assets/${getMedalFilename(ach.medal)}.png`} 
                            alt={`${ach.medal} medal`} 
                            className="w-16 h-16 object-contain drop-shadow-[0_0_15px_rgba(245,158,11,0.3)] mb-3" 
                          />
                          <p className="text-amber-100 font-bold text-sm capitalize font-heading tracking-wider">{ach.lessonId}</p>
                          <p className={`text-[10px] uppercase tracking-widest mt-1 font-bold ${
                              ach.medal === 'gold' ? 'text-yellow-400' : 
                              ach.medal === 'silver' ? 'text-gray-300' : 'text-orange-400'
                          }`}>
                            {ach.medal} Medal
                          </p>
                          <p className="text-[10px] text-amber-200/40 mt-2">
                            {ach.eventsFound} / {ach.totalEvents} Events
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-10 opacity-60">
                      <Trophy className="w-12 h-12 text-amber-900 mx-auto mb-3" />
                      <p className="text-amber-200/50 text-sm">No major achievements recorded in the archives yet.</p>
                      <p className="text-amber-500/40 text-xs mt-1">Complete lessons to earn medals.</p>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-[#150f0a] border border-red-900/50 rounded-3xl p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-red-900/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-red-950/40 rounded-2xl flex items-center justify-center border border-red-900/50 mb-6 text-red-500 shadow-inner">
                  <LogOut size={28} />
                </div>
                
                <h3 className="font-heading text-2xl font-bold text-red-100 mb-3">Confirm Disconnect</h3>
                <p className="text-amber-200/60 text-sm mb-8 leading-relaxed">
                  Are you certain you wish to end your connection to the archives? You will need to re-log to continue your journey.
                </p>
                
                <div className="flex gap-4 w-full">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 py-3 bg-black/40 border border-amber-900/50 hover:bg-amber-900/30 text-amber-100 rounded-xl transition-all font-bold text-sm uppercase tracking-wider"
                  >
                    Remain
                  </button>
                  <button
                    onClick={handleLogout}
                    className="flex-1 py-3 bg-red-900/80 border border-red-500/50 hover:bg-red-800 text-red-50 rounded-xl transition-all font-bold text-sm uppercase tracking-wider shadow-[0_0_15px_rgba(220,38,38,0.2)]"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <div className="bg-[#1a130e]/80 border border-amber-900/30 p-6 rounded-2xl flex items-center gap-4 hover:border-amber-600/30 transition-colors">
      <div className="p-3 bg-black/40 rounded-xl shadow-inner border border-amber-900/20">
        {icon}
      </div>
      <div>
        <h4 className="text-2xl font-bold text-amber-100 font-heading">{value}</h4>
        <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">{label}</p>
      </div>
    </div>
  );
}