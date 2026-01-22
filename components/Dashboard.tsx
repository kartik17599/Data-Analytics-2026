
import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Topic, Formula } from '../types';
import { fetchFormulaByName } from '../services/geminiService';
import { FormulaItem } from './TopicDetail';

interface DashboardProps {
  topics: Topic[];
}

const COLORS = ['#4f46e5', '#e2e8f0'];

export const Dashboard: React.FC<DashboardProps> = ({ topics }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [spotlightFormula, setSpotlightFormula] = useState<Formula | null>(null);

  const allSubTopics = topics.flatMap(t => t.subTopics);
  const completedCount = allSubTopics.filter(st => st.completed).length;
  const totalCount = allSubTopics.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
      {/* Progress Card */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-6 overflow-hidden relative">
        <div className="flex-1 z-10">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Syllabus Progress</h2>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-5xl font-black text-indigo-600">{completionPercentage}%</span>
            <span className="text-sm font-bold text-slate-400">of DA 2026</span>
          </div>
          <p className="text-sm font-medium text-slate-500">
            <strong>{completedCount}</strong> sub-topics mastered out of <strong>{totalCount}</strong>.
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
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Formula Spotlight</h3>
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search e.g. 'RMSE', 'Z-Test'..."
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
            Find
          </button>
        </form>
        
        {spotlightFormula && (
          <div className="mt-6 animate-in zoom-in-95 fade-in duration-500">
             <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Instant Result</span>
                <button onClick={() => setSpotlightFormula(null)} className="text-slate-400 hover:text-red-500 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <FormulaItem formula={spotlightFormula} />
          </div>
        )}
      </div>

      {/* Rank Predictor Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-900 p-6 rounded-3xl shadow-xl border border-white/10 relative overflow-hidden group">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-500"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-indigo-200 uppercase tracking-widest">AI Rank Predictor</h3>
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">Beta</span>
          </div>
          
          <div className="mb-4">
            <div className="text-[10px] text-indigo-300 font-bold uppercase mb-1">Estimated AIR</div>
            <div className="text-3xl font-black text-white tracking-tighter">
              {predictRank()}
            </div>
          </div>

          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-emerald-400 transition-all duration-1000" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>

          <p className="text-[10px] text-indigo-100 font-medium leading-relaxed opacity-80">
            {completionPercentage < 70
                ? "Mastering foundations boosts your ranking profile significantly."
                : "Excellent standing! You're on track for a premium institute."
            }
          </p>
        </div>
      </div>
    </div>
  );
};
