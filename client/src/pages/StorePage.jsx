import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Zap, ShieldCheck, Gem, Scroll, CheckCircle } from 'lucide-react';

export default function StorePage() {
  const navigate = useNavigate();
  const [knowledgePoints, setKnowledgePoints] = useState(0);
  const [processingId, setProcessingId] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  const kpPackages = [
    { id: 1, name: "Scholar's Pouch", amount: 500, price: "$4.99", icon: <Scroll size={40} className="text-amber-500 mb-4" /> },
    { id: 2, name: "Chronicler's Satchel", amount: 1500, price: "$12.99", icon: <Gem size={40} className="text-amber-400 mb-4" />, popular: true },
    { id: 3, name: "Archivist's Chest", amount: 5000, price: "$39.99", icon: <ShieldCheck size={40} className="text-amber-300 mb-4" /> }
  ];

  useEffect(() => {
    fetch("http://localhost:5000/api/users/profile", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
          if (data.stats) setKnowledgePoints(data.stats.knowledgePoints);
      })
      .catch(console.error);
  }, []);

  const handlePurchase = async (pkg) => {
    setProcessingId(pkg.id);
    setSuccessMsg("");
    
    try {
      // Simulating payment gateway delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      const res = await fetch("http://localhost:5000/api/users/purchase-kp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ amount: pkg.amount })
      });

      const data = await res.json();
      if (res.ok) {
        setKnowledgePoints(data.stats.knowledgePoints);
        setSuccessMsg(`Successfully acquired ${pkg.amount} KP!`);
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Transaction failed", err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="min-h-screen text-amber-50 font-body overflow-x-hidden selection:bg-amber-500/30 relative flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 bg-[#1a120b] z-[-2]"></div>
      <div 
        className="fixed inset-0 bg-gradient-to-b from-transparent via-black/40 to-black z-[-1] mix-blend-multiply opacity-80"
        style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/black-scales.png")` }}
      ></div>

      <button 
        onClick={() => navigate('/explore')}
        className="absolute top-8 left-8 flex items-center gap-2 text-amber-500 hover:text-amber-300 transition-colors uppercase tracking-widest text-sm font-bold z-10"
      >
        <ArrowLeft size={16} /> Return to Archives
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 mt-16 z-10"
      >
        <h1 className="text-4xl md:text-6xl font-heading font-bold text-amber-100 mb-4 tracking-[0.2em] drop-shadow-lg">
          The Antiquary
        </h1>
        <p className="text-amber-200/60 max-w-xl mx-auto text-lg italic mb-6">
          "Procure the resources needed to unlock the deepest secrets of the timeline."
        </p>

        <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/50 border border-amber-500/30 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <span className="text-sm uppercase tracking-widest text-amber-200/50">Current Balance:</span>
            <div className="flex items-center gap-1.5 text-xl font-heading font-bold text-amber-400">
                <Zap className="fill-amber-400" size={20} />
                {knowledgePoints} KP
            </div>
        </div>
      </motion.div>

      {/* Success Notification */}
      {successMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3 bg-green-900/80 border border-green-500/50 text-green-100 rounded-full shadow-lg z-50 backdrop-blur-md"
          >
              <CheckCircle size={18} />
              <span className="font-bold tracking-widest text-sm uppercase">{successMsg}</span>
          </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full z-10">
        {kpPackages.map((pkg) => (
          <motion.div 
            key={pkg.id}
            whileHover={{ y: -10 }}
            className={`relative bg-[#150f0a]/80 backdrop-blur-md border ${pkg.popular ? 'border-amber-500' : 'border-amber-900/40'} rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl overflow-hidden`}
          >
            {pkg.popular && (
                <div className="absolute top-0 w-full bg-amber-500 text-amber-950 text-[10px] font-bold uppercase tracking-[0.3em] py-1">
                    Most Popular
                </div>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent pointer-events-none"></div>

            <div className="mt-6">{pkg.icon}</div>
            
            <h3 className="text-xl font-heading font-bold text-amber-100 mb-2">{pkg.name}</h3>
            
            <div className="flex items-center gap-2 mb-8">
                <Zap className="text-amber-500 fill-amber-500" size={24} />
                <span className="text-4xl font-bold tracking-tight text-amber-400">{pkg.amount}</span>
            </div>

            <button 
              onClick={() => handlePurchase(pkg)}
              disabled={processingId !== null}
              className={`w-full py-4 rounded-xl font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                  pkg.popular 
                  ? 'bg-amber-500 text-amber-950 hover:bg-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                  : 'bg-amber-900/30 border border-amber-700/50 text-amber-100 hover:bg-amber-900/60 hover:border-amber-500/80'
              }`}
            >
              {processingId === pkg.id ? (
                  <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                  <>Acquire for {pkg.price}</>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}