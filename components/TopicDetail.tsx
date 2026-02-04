
import React, { useState, useEffect, useRef, useMemo } from 'react';
import katex from 'katex';
import { marked } from 'marked';
import { SubTopic, AppTab, StudyContent, Formula, PracticeQuestion } from '../types';
import { generateStudyContent, generateMorePracticeQuestions } from '../services/geminiService';

interface TopicDetailProps {
  subTopic: SubTopic;
  category: string;
  onToggleComplete: (id: string) => void;
  onContentGenerated: (id: string, content: StudyContent) => void;
  onAddMoreQuestions: (id: string, questions: PracticeQuestion[]) => void;
  onBack?: () => void;
}

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const html = useMemo(() => {
    try {
      return marked.parse(content);
    } catch (e) {
      return content;
    }
  }, [content]);

  return (
    <div 
      className="github-markdown-body prose prose-slate max-w-none"
      dangerouslySetInnerHTML={{ __html: html as string }}
    />
  );
};

const LatexRenderer: React.FC<{ formula: string }> = ({ formula }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (containerRef.current) {
      try {
        katex.render(formula, containerRef.current, {
          throwOnError: false,
          displayMode: true,
          trust: true,
        });
      } catch (e) {
        containerRef.current.textContent = formula;
      }
    }
  }, [formula]);
  return <div ref={containerRef} className="overflow-x-auto py-4" />;
};

export const FormulaItem: React.FC<{ formula: Formula }> = ({ formula }) => {
  const [showOriginal, setShowOriginal] = useState(true);

  return (
    <div className="bg-white rounded-2xl md:rounded-[2.5rem] border-2 border-slate-100 overflow-hidden shadow-sm flex flex-col mb-8 break-inside-avoid">
      <div className="bg-slate-50 p-6 md:p-8 border-b border-slate-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <h4 className="text-slate-900 font-black text-lg md:text-2xl">{formula.name}</h4>
          <div className="flex bg-slate-200 p-1 rounded-xl no-print">
            <button 
              onClick={() => setShowOriginal(true)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showOriginal ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Script
            </button>
            <button 
              onClick={() => setShowOriginal(false)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!showOriginal ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500'}`}
            >
              Katex
            </button>
          </div>
        </div>
        <p className="text-slate-600 text-sm md:text-lg font-bold italic border-l-4 border-indigo-200 pl-4">{formula.explanation}</p>
      </div>
      <div className="flex flex-col lg:flex-row">
        <div className="flex-1 p-8 md:p-12 flex items-center justify-center relative overflow-hidden min-h-[180px] border-b lg:border-b-0 lg:border-r border-slate-100 bg-[#fffdf0]">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          <div className="relative z-10 w-full flex justify-center">
             {showOriginal ? (
               <div className="text-3xl md:text-6xl font-handwriting text-slate-800 whitespace-nowrap drop-shadow-sm select-text">
                  {formula.originalScript}
               </div>
             ) : (
               <LatexRenderer formula={formula.latex} />
             )}
          </div>
        </div>
        <div className="lg:w-[320px] bg-slate-50/40 p-6 md:p-8">
          <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Variable Legend</h5>
          <div className="space-y-3">
            {formula.variableDefinitions?.map((def, idx) => (
              <div key={idx} className="flex gap-2 text-xs md:text-sm font-bold text-slate-700">
                <span className="text-indigo-400 shrink-0">•</span>
                <span>{def}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const PracticeQuestionItem: React.FC<{ question: PracticeQuestion; index: number }> = ({ question, index }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="p-6 border border-slate-100 rounded-3xl hover:border-indigo-200 transition-all break-inside-avoid shadow-sm group bg-white">
      <div className="flex justify-between items-start mb-4">
        <p className="font-black text-slate-900 text-base flex-1">
          <span className="text-indigo-600 mr-2">Q{index + 1}.</span> {question.question}
        </p>
      </div>
      
      {!showAnswer ? (
        <button 
          onClick={() => setShowAnswer(true)}
          className="w-full py-3 bg-slate-50 rounded-2xl border border-slate-100 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 hover:border-indigo-100 transition-all"
        >
          Reveal Logic & Answer
        </button>
      ) : (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 mb-3">
            <div className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
              Calculated Result
            </div>
            <div className="font-bold text-slate-800 text-sm md:text-base">{question.answer}</div>
          </div>
          
          <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 mb-3">
             <div className="text-[10px] text-indigo-600 font-black uppercase tracking-widest mb-2">Mental Process</div>
             <p className="text-xs md:text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line">{question.explanation}</p>
          </div>

          {question.tips && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
               <div className="text-[10px] text-amber-600 font-black uppercase tracking-widest mb-1 flex items-center gap-2">
                 <span>💡</span> Solver Tip
               </div>
               <p className="text-[11px] font-bold text-slate-700 italic">{question.tips}</p>
            </div>
          )}

          <button 
            onClick={() => setShowAnswer(false)}
            className="mt-4 text-[9px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest"
          >
            Hide Answer
          </button>
        </div>
      )}
    </div>
  );
};

export const TopicDetail: React.FC<TopicDetailProps> = ({ subTopic, category, onToggleComplete, onContentGenerated, onAddMoreQuestions, onBack }) => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.Notes);
  const [loading, setLoading] = useState(false);
  const [addingQuestions, setAddingQuestions] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [showRawMarkdown, setShowRawMarkdown] = useState(false);

  useEffect(() => { if (!subTopic.content && !loading) handleGenerate(); }, [subTopic.id]);
  
  useEffect(() => { setShowSolution(false); }, [subTopic.id]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const result = await generateStudyContent(subTopic.title, category);
      onContentGenerated(subTopic.id, result);
    } catch (err) { 
      console.error(err);
      alert("Generation failed. Try again."); 
    }
    finally { setLoading(false); }
  };

  const handleAddQuestions = async () => {
    if (addingQuestions) return;
    setAddingQuestions(true);
    try {
      const newQuestions = await generateMorePracticeQuestions(subTopic.title, category, 10);
      onAddMoreQuestions(subTopic.id, newQuestions);
    } catch (err) {
      alert("Could not load more questions. Please try again.");
    } finally {
      setAddingQuestions(false);
    }
  };

  const handleDownloadTxt = () => {
    if (!subTopic.content) return;
    const c = subTopic.content;
    const text = `
DA 2026 STUDY GUIDE: ${subTopic.title}
Category: ${category}
==================================================

[CONCEPT NOTES]
${c.notes}

[HINGLISH EXPLANATION]
${c.hinglishNotes}

[LAST MINUTE REVISION POINTS]
${c.lastMinuteNotes.map((p, i) => `${i + 1}. ${p}`).join('\n')}

[FORMULAS]
${c.formulas.map(f => `- ${f.name}: ${f.originalScript}\n  Explanation: ${f.explanation}`).join('\n\n')}

[EXAM TIPS]
${c.tips.map(t => `* ${t}`).join('\n')}

[SOLVED EXAMPLE]
Q: ${c.solvedQuestion.question}
A: ${c.solvedQuestion.solution}

Generated by DA 2026 Tracker
    `.trim();

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${subTopic.title.replace(/\s+/g, '_')}_Study_Notes.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) return (
    <div className="bg-white rounded-3xl p-16 flex flex-col items-center text-center animate-pulse">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-6"></div>
      <h3 className="text-lg font-black">Organizing Mastery for {subTopic.title}...</h3>
      <p className="text-slate-400 font-bold text-xs mt-2">Wait while AI builds your formula selection guide.</p>
    </div>
  );

  const content = subTopic.content;
  if (!content) return (
    <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center text-center">
       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
       </div>
       <h3 className="text-lg font-black text-slate-900 mb-2">No Content Found</h3>
       <button onClick={handleGenerate} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">Try Regenerate</button>
    </div>
  );

  const TabIcon = ({ tab }: { tab: AppTab }) => {
    switch (tab) {
      case AppTab.Notes: return <span>📝</span>;
      case AppTab.LastMinute: return <span>⚡</span>;
      case AppTab.Hinglish: return <span>🗣️</span>;
      case AppTab.Formulas: return <span>π</span>;
      case AppTab.Tips: return <span>💡</span>;
      case AppTab.SolvedQuestion: return <span>📖</span>;
      case AppTab.Practice: return <span>🎯</span>;
      case AppTab.Resources: return <span>🎥</span>;
      default: return <span>📄</span>;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden pb-16 md:pb-0">
      {/* Header with Export Actions */}
      <div className="px-6 py-6 border-b border-slate-100 bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-black leading-tight">{subTopic.title}</h3>
          <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-1">{category}</p>
        </div>
        
        <div className="flex items-center gap-2 no-print">
          <button 
            onClick={handleGenerate}
            title="Regenerate Simplified Content"
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          </button>

          <button 
            onClick={handleDownloadTxt}
            title="Download Study Sheet"
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          </button>
          
          <button 
            onClick={handlePrint}
            title="Export as PDF"
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all border border-white/10"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          </button>

          <div className="w-[1px] h-6 bg-white/10 mx-1"></div>

          <button onClick={() => onToggleComplete(subTopic.id)} className={`px-4 py-2 rounded-xl text-[10px] font-black transition-all ${subTopic.completed ? 'bg-emerald-500' : 'bg-white/10 border border-white/20'}`}>
            {subTopic.completed ? '✓ Mastery' : 'Mark Done'}
          </button>
        </div>
      </div>

      {/* Desktop Tabs */}
      <div className="hidden md:flex border-b border-slate-100 bg-slate-50 overflow-x-auto scrollbar-hide no-print">
        {Object.values(AppTab).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap border-b-2 transition-all ${activeTab === tab ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>
            <span className="mr-2"><TabIcon tab={tab} /></span>
            {tab}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="p-4 md:p-10 min-h-[400px]">
        <div key={activeTab}>
          {activeTab === AppTab.Notes && (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-4xl mx-auto">
               <div className="github-readme-preview shadow-lg">
                  <div className="github-readme-header flex flex-wrap justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7l.01.01a.75.75 0 11-1.078 1.043A2.495 2.495 0 012 15.5v-13zm10.5 8.5V1.5H4.5a1 1 0 00-1 1V14a.5.5 0 01-.5.5.5.5 0 01-.5-.5V2.5a2.5 2.5 0 012.5-2.5h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7l.01.01a.75.75 0 11-1.078 1.043A2.495 2.495 0 012 15.5v-13z"></path></svg>
                      README.md
                    </div>
                    {/* Mode Toggle mimicking GitHub */}
                    <div className="flex bg-slate-200 p-1 rounded-lg no-print">
                      <button 
                        onClick={() => setShowRawMarkdown(false)}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${!showRawMarkdown ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Preview
                      </button>
                      <button 
                        onClick={() => setShowRawMarkdown(true)}
                        className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all ${showRawMarkdown ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                      >
                        Code
                      </button>
                    </div>
                  </div>

                  <div className="github-markdown-body">
                    {showRawMarkdown ? (
                      <pre className="text-xs font-mono bg-slate-50 p-6 rounded-lg overflow-auto whitespace-pre-wrap select-text">
                        {content.notes}
                      </pre>
                    ) : (
                      <MarkdownRenderer content={content.notes} />
                    )}
                  </div>
               </div>
               <div className="mt-8 flex justify-center no-print">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Decision Matrix Enabled v3.0
                  </p>
               </div>
            </div>
          )}
          
          {activeTab === AppTab.LastMinute && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="mb-6 bg-rose-900 p-6 rounded-[2rem] text-white">
                <h4 className="text-xs font-black uppercase tracking-widest text-rose-300 mb-1">Critical Hooks</h4>
                <p className="text-sm font-bold opacity-80">Quick recall items for the final hour.</p>
              </div>
              {content.lastMinuteNotes.map((p, i) => (
                <div key={i} className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-r-2xl font-black text-sm md:text-lg flex gap-4 hover:translate-x-1 transition-transform cursor-default">
                  <span className="text-rose-500 w-6">{i + 1}.</span>
                  <span className="text-slate-800">{p}</span>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === AppTab.Hinglish && (
            <div className="relative animate-in zoom-in-95 duration-500">
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center text-2xl shadow-lg z-10">💬</div>
              <div className="bg-gradient-to-br from-indigo-50 to-white p-10 md:p-14 rounded-[3rem] font-serif font-bold italic text-indigo-900 text-xl md:text-3xl border-2 border-indigo-100 shadow-xl leading-snug">
                "{content.hinglishNotes}"
                <div className="mt-8 pt-6 border-t border-indigo-100 text-[10px] font-black uppercase tracking-widest not-italic text-indigo-400">Mastery Guru</div>
              </div>
            </div>
          )}
          
          {activeTab === AppTab.Formulas && <div className="space-y-6 animate-in fade-in duration-300">{content.formulas.length > 0 ? content.formulas.map((f, i) => <FormulaItem key={i} formula={f} />) : <p className="text-center text-slate-400 font-bold">No formulas found for this topic.</p>}</div>}
          
          {activeTab === AppTab.Tips && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="col-span-full mb-4 bg-slate-900 p-8 rounded-[2.5rem] text-white overflow-hidden relative group">
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/20 rounded-full -mr-16 -mb-16 blur-3xl transition-all group-hover:bg-indigo-500/40"></div>
                <h4 className="text-xs font-black uppercase tracking-widest text-indigo-400 mb-2">Exam Blueprints</h4>
                <p className="font-bold text-base md:text-xl leading-relaxed">Expert strategies to optimize your problem-solving speed.</p>
              </div>
              {content.tips.map((t, i) => (
                <div key={i} className="p-6 bg-amber-50 rounded-[2rem] font-bold text-sm flex gap-5 border border-amber-100 group hover:bg-amber-100 transition-all hover:-translate-y-1 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-2xl shrink-0 shadow-sm group-hover:rotate-12 transition-transform">💡</div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest text-amber-600 font-black mb-1">Cheat Code #{i+1}</span>
                    <span className="text-slate-800 leading-relaxed text-base">{t}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === AppTab.SolvedQuestion && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-8 md:p-12 bg-slate-900 text-white rounded-[3rem] font-black text-lg md:text-2xl shadow-xl leading-relaxed">
                 <div className="text-indigo-400 text-xs uppercase mb-4 tracking-widest">Logic Path Mastery</div>
                {content.solvedQuestion.question}
              </div>
              
              {!showSolution ? (
                <button 
                  onClick={() => setShowSolution(true)}
                  className="w-full py-12 border-4 border-dashed border-indigo-100 rounded-[3rem] text-indigo-600 font-black uppercase tracking-widest hover:bg-indigo-50 hover:border-indigo-300 transition-all flex flex-col items-center justify-center gap-4 group"
                >
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                  </div>
                  Understand the Logical Chain
                </button>
              ) : (
                <div className="p-8 md:p-12 bg-white rounded-[3rem] font-bold border-2 border-emerald-100 whitespace-pre-line text-slate-800 leading-relaxed shadow-xl animate-in zoom-in-95 duration-500">
                  <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <div className="text-[10px] uppercase font-black tracking-widest text-emerald-600 flex items-center gap-2">
                       <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                       Logic Resolved
                    </div>
                    <button onClick={() => setShowSolution(false)} className="text-[10px] font-black text-slate-300 hover:text-red-500 uppercase transition-colors">Hide Solution</button>
                  </div>
                  <div className="text-base md:text-xl">
                    {content.solvedQuestion.solution}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {activeTab === AppTab.Practice && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 gap-6">
                {content.practiceQuestions.map((q, i) => (
                  <PracticeQuestionItem key={i} question={q} index={i} />
                ))}
              </div>
              
              <div className="pt-8">
                <button 
                  onClick={handleAddQuestions}
                  disabled={addingQuestions}
                  className={`w-full flex items-center justify-center gap-4 py-8 rounded-[2.5rem] border-4 border-dashed transition-all ${addingQuestions ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed' : 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-300'}`}
                >
                  {addingQuestions ? (
                    <>
                      <div className="w-6 h-6 border-4 border-slate-300 border-t-indigo-600 rounded-full animate-spin"></div>
                      <span className="text-xs font-black uppercase tracking-widest">Training AI Brain...</span>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"/></svg>
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest">Need More? Load 10 New Questions</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
          
          {activeTab === AppTab.Resources && (
            <div className="flex flex-col items-center py-20 no-print animate-in zoom-in-95 duration-300">
              <div className="w-32 h-32 bg-rose-50 rounded-[2.5rem] flex items-center justify-center text-rose-500 mb-8 shadow-inner relative group cursor-pointer overflow-hidden">
                 <div className="absolute inset-0 bg-rose-600 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                 <svg className="w-16 h-16 relative z-10 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
              </div>
              <h4 className="text-3xl font-black mb-3 text-slate-900 tracking-tight text-center">Video Study Room</h4>
              <p className="text-slate-500 font-bold mb-10 text-center max-w-sm leading-relaxed">AI has selected the most high-yield tutorials for {subTopic.title}.</p>
              <a 
                href={`https://www.youtube.com/results?search_query=${encodeURIComponent(content.youtubeQuery)}`} 
                target="_blank" 
                className="group relative bg-rose-600 text-white px-16 py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-rose-200 hover:bg-rose-700 hover:scale-105 active:scale-95 transition-all"
              >
                Launch Recommended Lectures
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500"></span>
                </span>
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Navigation - Scrollable for all tabs */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex items-center overflow-x-auto scrollbar-hide px-4 py-3 z-40 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)] no-print">
        <div className="flex items-center gap-6 min-w-max mx-auto pb-2">
          {Object.values(AppTab).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center gap-1 transition-all px-2 ${activeTab === tab ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
              <span className="text-xl"><TabIcon tab={tab} /></span>
              <span className="text-[8px] font-black uppercase tracking-tighter whitespace-nowrap">{tab}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
