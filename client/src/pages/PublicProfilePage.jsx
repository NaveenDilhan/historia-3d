import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronLeft, Trophy, BookOpen, Map, Crown,
  Brain, Compass
} from "lucide-react";

export default function PublicProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  const medalAssetMap = { gold: 'medal1', silver: 'medal2', bronze: 'medal3' };
  const getMedalFilename = (medalName) => {
      if (!medalName) return null;
      return medalAssetMap[medalName.toLowerCase()] || medalName;
  };

  const buildAvatarUrl = (seed, options) => {
    let url = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed || 'Scholar'}`;
    if (options) {
        if (options.skinColor) url += `&skinColor=${options.skinColor}`;
        if (options.top) url += `&top=${options.top}`;
        if (options.accessories && options.accessories !== "none") url += `&accessories=${options.accessories}`;
    }
    return url;
  };

  useEffect(() => {
    fetchPublicProfile();
  }, [id]);

  const fetchPublicProfile = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${id}`);
      if (res.ok) {
        const data = await res.json();
        // Ensure avatarOptions exists safely to prevent rendering crashes
        if (!data.avatarOptions) {
          data.avatarOptions = { skinColor: "f8d25c", top: "shortHair", accessories: "none" };
        }
        setProfile(data);
      } else {
        setError("This Scholar's records cannot be found in the archives.");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setError("Failed to consult the archives.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#1a120b] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (error || !profile) return (
    <div className="min-h-screen bg-[#1a120b] flex flex-col items-center justify-center text-amber-50 font-body relative overflow-hidden">
      <div className="bg-[#150f0a] border border-amber-900/40 p-8 rounded-2xl shadow-2xl text-center max-w-md">
        <Trophy className="w-12 h-12 text-amber-900/60 mx-auto mb-4" />
        <h2 className="text-xl font-heading font-bold text-amber-100 mb-2">Record Missing</h2>
        <p className="text-amber-200/60 text-sm mb-6">{error}</p>
        <button 
          onClick={() => navigate("/community")}
          className="px-6 py-2 bg-amber-900/30 hover:bg-amber-900/50 border border-amber-700/50 text-amber-400 rounded-full text-sm font-bold transition-all"
        >
          Return to Agora
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen text-amber-50 font-body ancient-wall-bg relative overflow-x-hidden selection:bg-amber-500/30">
      
      {/* Background & Overlays */}
      <style>{`
        .ancient-wall-bg {
          background-color: #120d08;
          background-image: 
            radial-gradient(circle at 50% 0%, rgba(217, 119, 6, 0.1), rgba(0, 0, 0, 0.95)),
            url("https://www.transparenttextures.com/patterns/stucco.png");
          background-blend-mode: screen, overlay;
          background-attachment: fixed;
        }
      `}</style>
      <div className="fixed inset-0 bg-[#1a120b]/90 z-[-1]"></div>
      <div className="fixed inset-0 bg-radial-gradient(circle at center, transparent 0%, #000 100%) pointer-events-none z-0"></div>

      <nav className="p-6 relative z-10 max-w-5xl mx-auto">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-amber-500/80 hover:text-amber-400 transition-colors uppercase text-xs font-bold tracking-widest"
        >
          <ChevronLeft size={16} /> Go Back
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pb-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Avatar & Bio */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="bg-[#150f0a]/60 backdrop-blur-xl border border-amber-900/40 rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative inline-block mb-6 group">
                <div className="w-40 h-40 rounded-full border-4 border-amber-800/50 shadow-[0_0_30px_rgba(245,158,11,0.1)] overflow-hidden bg-[#2a1d15] relative z-10">
                  <img 
                    src={buildAvatarUrl(profile.avatarSeed, profile.avatarOptions)} 
                    alt="Scholar Avatar" 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="absolute -top-2 -right-2 bg-amber-900 text-amber-400 p-2 rounded-full border border-amber-700/50 shadow-lg">
                  <Crown size={16} fill="currentColor" />
                </div>
              </div>

              <h2 className="text-2xl font-heading font-bold text-amber-100">{profile.firstName} {profile.lastName}</h2>
              <p className="text-amber-500/80 text-xs font-bold tracking-widest mt-1 mb-1">@{profile.username}</p>
              
              <div className="mt-4 mb-4 flex items-center justify-center gap-2">
                  <span className="text-amber-500 text-[10px] uppercase tracking-widest font-bold border border-amber-500/30 bg-amber-950/40 px-2 py-1 rounded">
                    {profile.title || 'Scholar'}
                  </span>
                  <span className="text-amber-700 text-[10px] uppercase tracking-widest font-bold border border-amber-900/50 bg-black/40 px-2 py-1 rounded flex items-center gap-1">
                    <Brain size={10}/> {profile.experienceLevel || 'Beginner'}
                  </span>
              </div>
              
              <div className="inline-block bg-amber-950/40 px-4 py-3 rounded-lg border border-amber-900/30 text-amber-200/80 text-sm italic w-full">
                "{profile.bio || 'A seeker of ancient truths.'}"
              </div>

              {profile.historicalInterests && profile.historicalInterests.length > 0 && (
                  <div className="mt-6 flex flex-wrap justify-center gap-1.5">
                      <div className="w-full flex items-center justify-center gap-2 mb-2 text-[10px] text-amber-600 font-bold uppercase tracking-widest">
                        <Compass size={12} /> Areas of Interest
                      </div>
                      {profile.historicalInterests.map(interest => (
                          <span key={interest} className="px-2 py-1 bg-black/40 border border-amber-900/30 text-amber-500 text-[9px] uppercase tracking-wider rounded">
                              {interest}
                          </span>
                      ))}
                  </div>
              )}
            </motion.div>
          </div>

          {/* RIGHT COLUMN: Stats & Achievements */}
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