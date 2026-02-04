
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Topic, Formula } from '../types';
import { fetchFormulaByName } from '../services/geminiService';
import { FormulaItem } from './TopicDetail';

interface DashboardProps {
  topics: Topic[];
  onInstall?: () => void;
  showInstall?: boolean;
  isReady?: boolean;
  onOpenVault?: () => void;
}

const COLORS = ['#4f46e5', '#e2e8f0'];

const MountainClimb: React.FC<{ percentage: number }> = ({ percentage }) => {
  const getAltitudeLabel = (p: number) => {
    if (p === 0) return "At the Trailhead";
    if (p < 25) return "Lush Foothills";
    if (p < 50) return "Alpine Meadows";
    if (p < 75) return "Glacier Pass";
    if (p < 100) return "The Thin Air";
    return "Base Camp Secured!";
  };

  const getAltitudeColor = (p: number) => {
    if (p < 25) return "text-emerald-500";
    if (p < 50) return "text-slate-500";
    if (p < 75) return "text-blue-400";
    return "text-indigo-600";
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative group">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mastery Expedition</h3>
          <p className={`text-sm font-black ${getAltitudeColor(percentage)}`}>{getAltitudeLabel(percentage)}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-black text-slate-900">{Math.round(percentage * 88.48)}m</span>
          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Relative Altitude</p>
        </div>
      </div>

      <div className="relative h-48 w-full bg-slate-50 rounded-2xl border border-slate-100 p-4 overflow-hidden shadow-inner">
        {/* Sky Background with subtle stars at high altitude */}
        <div className={`absolute inset-0 transition-colors duration-1000 ${percentage > 75 ? 'bg-slate-900' : 'bg-sky-50'}`}>
          {percentage > 75 && <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(white 1px, transparent 0)', backgroundSize: '20px 20px' }}></div>}
        </div>

        {/* Background Mountain Shape */}
        <svg viewBox="0 0 400 200" className="absolute bottom-0 left-0 w-full h-auto opacity-10">
          <path d="M0,200 L150,50 L250,120 L400,20 L400,200 Z" fill="currentColor" className="text-slate-900" />
        </svg>

        {/* The Trail */}
        <svg viewBox="0 0 400 200" className="absolute inset-0 w-full h-full p-4" fill="none">
          <path 
            id="climbPath"
            d="M20,160 Q80,150 120,110 T220,90 T320,40" 
            stroke="#e2e8f0" 
            strokeWidth="12" 
            strokeLinecap="round" 
            className="opacity-50"
          />
          <path 
            d="M20,160 Q80,150 120,110 T220,90 T320,40" 
            stroke="#4f46e5" 
            strokeWidth="12" 
            strokeLinecap="round" 
            strokeDasharray="400"
            strokeDashoffset={400 - (percentage * 4)}
            className="transition-all duration-1000 ease-out drop-shadow-[0_0_8px_rgba(79,70,229,0.3)]"
          />
          
          {/* Milestone markers */}
          <circle cx="20" cy="160" r="6" fill="#4f46e5" />
          <circle cx="120" cy="110" r="6" fill={percentage >= 33 ? "#4f46e5" : "#cbd5e1"} />
          <circle cx="220" cy="90" r="6" fill={percentage >= 66 ? "#4f46e5" : "#cbd5e1"} />
          <circle cx="320" cy="40" r="8" fill={percentage === 100 ? "#f59e0b" : "#cbd5e1"} className={percentage === 100 ? "animate-pulse" : ""} />
        </svg>

        {/* The Climber Icon */}
        <div 
          className="absolute transition-all duration-1000 ease-out z-10"
          style={{
            left: `${10 + (percentage * 0.75)}%`,
            bottom: `${15 + (percentage * 0.6)}%`,
            transform: 'translate(-50%, 50%)'
          }}
        >
          <div className="relative group/climber">
            <div className="bg-indigo-600 text-white p-2 rounded-xl shadow-xl animate-bounce hover:scale-125 transition-transform cursor-pointer">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.5,5A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 11.5,5A1.5,1.5 0 0,1 13,3.5A1.5,1.5 0 0,1 14.5,5M5,22V20L8.5,15.5L7,11.5L8.5,8L10.5,10.5L13,10.5L16.5,8L15,11.5L16.5,15.5L20,20V22H17.5V18.5L14,15.5L11,15.5L7.5,18.5V22H5Z" />
              </svg>
            </div>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -mt-10 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover/climber:opacity-100 transition-opacity shadow-lg">
              YOU ARE HERE
            </div>
          </div>
        </div>
      </div>
      
      {/* Dynamic Motivation Text */}
      <div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <p className="text-xs font-bold text-slate-600 italic">
          {percentage === 0 && "Double-check your equipment. The first module is the hardest step."}
          {percentage > 0 && percentage < 50 && "Great pace! You're making progress through the foothills."}
          {percentage >= 50 && percentage < 100 && "Over halfway! The air is thin but your resolve is thick."}
          {percentage === 100 && "SUMMIT REACHED. You have mastered the entire DA 2026 syllabus!"}
        </p>
      </div>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ topics, onInstall, showInstall, isReady, onOpenVault }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [spotlightFormula, setSpotlightFormula] = useState<Formula | null>(null);

  const allSubTopics = topics.flatMap(t => t.subTopics);
  const completedCount = allSubTopics.filter(st => st.completed).length;
  const totalCount = allSubTopics.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isVaultUnlocked = completionPercentage === 100;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || searching) return;
    setSearching(true);
    try {
      const formula = await fetchFormulaByName(searchQuery);
      setSpotlightFormula(formula);
    } catch (err) {
      alert("Could not find that formula. Try something like 'RMSE' or 'Bayes Theorem'.");
    } finally {
      setSearching(false);
    }
  };

  const predictRank = () => {
    if (completedCount === 0) return "50,000+";
    const score = (completedCount / totalCount);
    if (score > 0.95) return "Under 100";
    if (score > 0.85) return "Under 500";
    if (score > 0.70) return "Top 1,000";
    if (score > 0.50) return "Top 2,500";
    if (score > 0.30) return "Top 5,000";
    return "Top 25,000";
  };

  const data = [
    { name: 'Completed', value: completedCount },
    { name: 'Remaining', value: totalCount - completedCount },
  ];

  return (
    <div className="space-y-4">
      {/* Visual Climb Game */}
      <MountainClimb percentage={completionPercentage} />

      {/* Vault Unlock Card */}
      {isVaultUnlocked && (
        <div className="bg-slate-900 p-8 rounded-[2.5rem] border-4 border-amber-400 shadow-[0_0_50px_-12px_rgba(251,191,36,0.4)] animate-in zoom-in duration-500 overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/10 to-transparent"></div>
          <div className="relative z-10 flex flex-col items-center text-center">
             <div className="w-20 h-20 bg-amber-400 text-slate-900 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-xl group-hover:rotate-12 transition-transform">🏆</div>
             <h3 className="text-2xl font-black text-white mb-2">Expedition Successful</h3>
             <p className="text-slate-400 text-xs font-bold mb-6 max-w-xs uppercase tracking-widest">You've reached Base Camp 2026. Unified mastery archive is now open.</p>
             <button 
               onClick={onOpenVault}
               className="w-full bg-amber-400 text-slate-900 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-white hover:scale-105 transition-all"
             >
               Enter Revision Vault
             </button>
          </div>
        </div>
      )}

      {/* Gamified Install Card */}
      {showInstall && (
        <div className="bg-indigo-600 p-6 rounded-[2.5rem] shadow-xl border border-indigo-500 overflow-hidden relative group">
          <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📱</div>
            <div className="flex-1">
              <div className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">Equipment Check</div>
              <div className="text-white font-black text-sm">Install App for Offline Study</div>
              <p className="text-[9px] text-indigo-200 font-bold uppercase mt-1">Faster access on the trail</p>
            </div>
            <button 
              onClick={onInstall}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest relative z-10 shadow-lg transition-all ${isReady ? 'bg-white text-indigo-600 animate-pulse hover:scale-105' : 'bg-white/20 text-white cursor-pointer hover:bg-white/40'}`}
            >
              {isReady ? 'Get App Now' : 'Manual Setup'}
            </button>
          </div>
        </div>
      )}

      {/* Progress Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 overflow-hidden relative">
        <div className="flex-1 z-10">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Mastery Stats</h2>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-black text-indigo-600">{completionPercentage}%</span>
            <span className="text-sm font-bold text-slate-400">Complete</span>
          </div>
          <p className="text-sm font-medium text-slate-500">
            <strong>{completedCount}</strong>/<strong>{totalCount}</strong> modules secured.
          </p>
        </div>
        
        <div className="w-full h-32 md:w-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={50}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-indigo-600">
            {completedCount}/{totalCount}
          </div>
        </div>
      </div>

      {/* Formula Spotlight Search */}
      {!isVaultUnlocked && (
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Formula Scout</h3>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search e.g. 'Eigenvalues', 'PCA'..."
                className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {searching && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={searching}
              className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg"
            >
              Search
            </button>
          </form>
          
          {spotlightFormula && (
            <div className="mt-6 animate-in zoom-in-95 fade-in duration-500">
               <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Found Resource</span>
                  <button onClick={() => setSpotlightFormula(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
               </div>
               <FormulaItem formula={spotlightFormula} />
            </div>
          )}
        </div>
      )}

      {/* Rank Predictor Card */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-950 p-6 rounded-3xl shadow-xl border border-white/5 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all duration-500"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest">GATE Rank Model</h3>
            <span className="bg-indigo-500/20 text-indigo-300 text-[10px] px-2 py-0.5 rounded-full font-bold">Predictor AI</span>
          </div>
          
          <div className="mb-4">
            <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Target Ranking</div>
            <div className="text-3xl font-black text-white tracking-tighter">
              {predictRank()}
            </div>
          </div>

          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(79,70,229,0.5)] transition-all duration-1000" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
            {completionPercentage < 50
                ? "Every step is a rank earned. Keep going."
                : completionPercentage < 90 
                  ? "Elite status incoming. You are in the top percentiles."
                  : "Revision ready. Your mastery profile is world-class."
            }
          </p>
        </div>
      </div>
    </div>
  );
};
