import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Save, Edit2, LogOut, ChevronLeft, 
  Trophy, BookOpen, Map, Crown, RefreshCw, Sparkles 
} from "lucide-react";

export default function ProfilePage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    avatarSeed: "",
    title: "",
    stats: { knowledgePoints: 0, erasExplored: 0, artifactsFound: 0 },
    achievements: [] // Added achievements array
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    avatarSeed: ""
  });

  // Map the string values to their respective filenames
  const medalAssetMap = {
      gold: 'medal1',
      silver: 'medal2',
      bronze: 'medal3'
  };

  // Safely resolve the filename, defaulting to the raw prop if no match is found
  const getMedalFilename = (medalName) => {
      if (!medalName) return null;
      return medalAssetMap[medalName.toLowerCase()] || medalName;
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "GET", 
        credentials: "include", 
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({
            ...data,
            achievements: data.achievements || []
        });
        setFormData({
          name: data.name,
          email: data.email,
          bio: data.bio,
          avatarSeed: data.avatarSeed
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/users/profile", {
        method: "PUT",
        credentials: "include", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedData = await res.json();
        setProfile({
            ...updatedData,
            achievements: updatedData.achievements || []
        });
        localStorage.setItem("userInfo", JSON.stringify({ 
          name: updatedData.name, 
          email: updatedData.email 
        }));
        setIsEditing(false);
        setMessage({ type: "success", text: "Identity updated successfully." });
      } else {
        setMessage({ type: "error", text: "Failed to update profile." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Server error." });
    }
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogout = async () => {
    try {
        await fetch("http://localhost:5000/api/auth/logout", { 
            method: "POST",
            credentials: "include" 
        });
    } catch (error) {
        console.error("Logout failed", error);
    }
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
              initial={{ opacity: 0, y: -20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0 }}
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
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#150f0a]/60 backdrop-blur-xl border border-amber-900/40 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative inline-block mb-6 group">
                <div className="w-40 h-40 rounded-full border-4 border-amber-800/50 shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden bg-[#2a1d15] relative z-10">
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${isEditing ? formData.avatarSeed : profile.avatarSeed}`} 
                    alt="Scholar Avatar" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-900 text-amber-400 p-2 rounded-full border border-amber-700/50 shadow-lg">
                  <Crown size={16} fill="currentColor" />
                </div>

                {isEditing && (
                  <motion.button
                    whileTap={{ rotate: 180 }}
                    onClick={rerollAvatar}
                    type="button"
                    className="absolute bottom-0 right-0 bg-amber-600 hover:bg-amber-500 text-white p-2.5 rounded-full shadow-lg border border-amber-400/30 transition-colors z-20"
                    title="Re-roll Appearance"
                  >
                    <RefreshCw size={16} />
                  </motion.button>
                )}
              </div>

              {!isEditing ? (
                <>
                  <h2 className="text-2xl font-heading font-bold text-amber-100">{profile.name}</h2>
                  <p className="text-amber-500 text-sm uppercase tracking-widest font-bold mt-1 mb-4">{profile.title}</p>
                  
                  <div className="inline-block bg-amber-950/40 px-4 py-2 rounded-lg border border-amber-900/30 text-amber-200/60 text-sm italic">
                    "{profile.bio}"
                  </div>
                  
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
                <div className="space-y-4">
                  <p className="text-xs text-amber-500/80 uppercase tracking-widest font-bold">Forging New Identity</p>
                </div>
              )}
            </motion.div>

            <motion.button 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              onClick={handleLogout}
              className="w-full mt-4 py-4 bg-red-950/20 border border-red-900/30 hover:bg-red-900/30 text-red-400/80 rounded-2xl transition-all flex items-center justify-center gap-2 font-bold text-sm uppercase tracking-widest"
            >
              <LogOut size={16} /> Disconnect from Archives
            </motion.button>
          </div>

          {/* RIGHT COLUMN */}
          <div className="lg:col-span-2 space-y-8">
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <StatCard icon={<Trophy className="text-yellow-500" />} value={profile.stats?.knowledgePoints || 0} label="Knowledge Points" />
              <StatCard icon={<Map className="text-emerald-500" />} value={profile.stats?.erasExplored || 0} label="Eras Explored" />
              <StatCard icon={<BookOpen className="text-blue-500" />} value={profile.stats?.artifactsFound || 0} label="Artifacts Found" />
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
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
                      <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Scholar Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
                        <input 
                          type="text" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Email Archive</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
                        <input 
                          type="email" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-black/40 border border-amber-900/50 rounded-lg py-3 pl-10 pr-4 text-amber-50 focus:border-amber-500/50 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-amber-500/80">Personal Chronicle (Bio)</label>
                      <textarea 
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        rows="3"
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