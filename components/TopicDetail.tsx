
import React, { useState, useEffect, useRef } from 'react';
import { SubTopic, AppTab, StudyContent, Formula, PracticeQuestion } from '../types';
import { generateStudyContent, generateMorePracticeQuestions } from '../services/geminiService';
import katex from 'katex';

interface TopicDetailProps {
  subTopic: SubTopic;
  category: string;
  onToggleComplete: (id: string) => void;
  onContentGenerated: (id: string, content: StudyContent) => void;
  onAddMoreQuestions: (id: string, questions: PracticeQuestion[]) => void;
  onBack?: () => void;
}

export const FormulaItem: React.FC<{ formula: Formula }> = ({ formula }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<'textbook' | 'manuscript'>('textbook');

  useEffect(() => {
    if (containerRef.current && view === 'textbook') {
      try {
        const cleanFormula = formula.latex.replace(/^(\$\$|\\\[|\\\(|`)/, '').replace(/(\$\$|\\\]|\\\)|`)$/, '').trim();
        katex.render(cleanFormula, containerRef.current, { throwOnError: false, displayMode: true });
      } catch (e) {
        containerRef.current.textContent = formula.latex;
      }
    }
  }, [formula.latex, view]);

  return (
    <div className="bg-white rounded-2xl md:rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm flex flex-col mb-8">
      <div className="bg-slate-50 p-6 md:p-8 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h4 className="text-slate-900 font-black text-lg md:text-2xl">{formula.name}</h4>
          <div className="flex bg-slate-200 p-1 rounded-xl w-fit">
            <button onClick={() => setView('textbook')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${view === 'textbook' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}>Textbook</button>
            <button onClick={() => setView('manuscript')} className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase ${view === 'manuscript' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}>Original</button>
          </div>
        </div>
        <p className="text-slate-600 text-sm md:text-lg font-bold italic border-l-4 border-indigo-200 pl-4">{formula.explanation}</p>
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className={`flex-1 p-8 md:p-12 flex items-center justify-center relative overflow-hidden min-h-[200px] border-b lg:border-b-0 lg:border-r border-slate-100 ${view === 'manuscript' ? 'bg-[#fffdf0]' : 'bg-white'}`}>
          <div className="relative z-10 w-full overflow-x-auto scrollbar-hide py-4 flex justify-center">
            {view === 'textbook' ? <div ref={containerRef} className="text-2xl md:text-5xl font-serif"></div> : <div className="text-2xl md:text-5xl font-handwriting text-slate-700 whitespace-nowrap">{formula.originalScript}</div>}
          </div>
        </div>
        <div className="lg:w-[300px] bg-slate-50/40 p-6 md:p-8">
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Key Symbols</h5>
          <div className="space-y-3">
            {formula.variableDefinitions?.map((def, idx) => (
              <div key={idx} className="flex gap-2 text-xs md:text-sm font-bold text-slate-700"><span className="text-indigo-400">•</span>{def}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const TopicDetail: React.FC<TopicDetailProps> = ({ subTopic, category, onToggleComplete, onContentGenerated, onAddMoreQuestions, onBack }) => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Notes);
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (!subTopic.content && !loading) handleGenerate(); }, [subTopic.id]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateStudyContent(subTopic.title, category);
      onContentGenerated(subTopic.id, result);
    } catch (err) { alert("Generation failed. Check connection."); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="bg-white rounded-3xl p-16 flex flex-col items-center text-center animate-pulse">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
      <h3 className="text-lg font-black">Building {subTopic.title}</h3>
    </div>
  );

  const content = subTopic.content;
  if (!content) return null;

  const TabIcon = ({ tab }: { tab: AppTab }) => {
    switch (tab) {
      case AppTab.Notes: return <span>📝</span>;
      case AppTab.LastMinute: return <span>⚡</span>;
      case AppTab.Formulas: return <span>π</span>;
      case AppTab.Practice: return <span>🎯</span>;
      default: return <span>📖</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden pb-16 md:pb-0">
      <div className="px-6 py-6 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-black leading-tight">{subTopic.title}</h3>
          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">{category}</p>
        </div>
        <button onClick={() => onToggleComplete(subTopic.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${subTopic.completed ? 'bg-emerald-500' : 'bg-white/10 border border-white/20'}`}>
          {subTopic.completed ? '✓ Mastery' : 'Mark Done'}
        </button>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex border-b border-slate-100 bg-slate-50 overflow-x-auto scrollbar-hide">
        {Object.values(AppTab).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === tab ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-400'}`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-10">
        {activeTab === AppTab.Notes && <div className="prose prose-slate max-w-none text-slate-700 font-medium whitespace-pre-line text-sm md:text-lg">{content.notes}</div>}
        {activeTab === AppTab.LastMinute && <div className="space-y-3">{content.lastMinuteNotes.map((p, i) => <div key={i} className="bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl font-black text-sm md:text-lg">{p}</div>)}</div>}
        {activeTab === AppTab.Hinglish && <div className="bg-indigo-50/30 p-6 rounded-2xl font-serif font-bold italic text-indigo-900 md:text-xl">{content.hinglishNotes}</div>}
        {activeTab === AppTab.Formulas && <div className="space-y-6">{content.formulas.map((f, i) => <FormulaItem key={i} formula={f} />)}</div>}
        {activeTab === AppTab.Tips && <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{content.tips.map((t, i) => <div key={i} className="p-4 bg-amber-50 rounded-xl font-bold text-sm">⚡ {t}</div>)}</div>}
        {activeTab === AppTab.SolvedQuestion && <div className="space-y-6"><div className="p-6 bg-slate-50 rounded-2xl font-black border border-slate-100">{content.solvedQuestion.question}</div><div className="p-6 bg-emerald-50 rounded-2xl font-bold border border-emerald-100 whitespace-pre-line">{content.solvedQuestion.solution}</div></div>}
        {activeTab === AppTab.Practice && <div className="space-y-4">{content.practiceQuestions.map((q, i) => <div key={i} className="p-4 border border-slate-100 rounded-2xl"><p className="font-black text-sm mb-2">{q.question}</p><div className="text-[10px] text-emerald-600 font-black uppercase">Ans: {q.answer}</div></div>)}</div>}
        {activeTab === AppTab.Resources && <div className="flex flex-col items-center py-10"><a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(content.youtubeQuery)}`} target="_blank" className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest">Watch Video Lectures</a></div>}
      </div>

      {/* Mobile Bottom Navigation - Android Style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center justify-around px-2 py-3 z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
        {[AppTab.Notes, AppTab.LastMinute, AppTab.Formulas, AppTab.Practice, AppTab.Tips].map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center gap-1 transition-all ${activeTab === tab ? 'text-indigo-600' : 'text-slate-400'}`}>
            <span className="text-lg"><TabIcon tab={tab} /></span>
            <span className="text-[7px] font-black uppercase tracking-tighter">{tab}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
