
import React, { useState, useMemo } from 'react';
import { Topic, Formula, SubTopic } from '../types';
import { FormulaItem } from './TopicDetail';
import { marked } from 'marked';

interface RevisionVaultProps {
  topics: Topic[];
  onBack: () => void;
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

export const RevisionVault: React.FC<RevisionVaultProps> = ({ topics, onBack }) => {
  const [activeSubTab, setActiveSubTab] = useState<'notes' | 'formulas' | 'tips'>('notes');

  const allSubTopicsWithContent = useMemo(() => {
    return topics.flatMap(t => t.subTopics).filter(st => !!st.content);
  }, [topics]);

  const allFormulas = useMemo(() => {
    return allSubTopicsWithContent.flatMap(st => st.content!.formulas);
  }, [allSubTopicsWithContent]);

  const allTips = useMemo(() => {
    return allSubTopicsWithContent.flatMap(st => st.content!.tips);
  }, [allSubTopicsWithContent]);

  const allRevisionPoints = useMemo(() => {
    return allSubTopicsWithContent.flatMap(st => st.content!.lastMinuteNotes);
  }, [allSubTopicsWithContent]);

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700">
      <div className="bg-slate-900 rounded-[3rem] overflow-hidden border border-amber-500/30 shadow-2xl mb-8">
        <div className="p-10 md:p-14 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full -mr-32 -mt-32 blur-3xl animate-pulse"></div>
          
          <button 
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-colors text-[10px] font-black uppercase tracking-widest no-print"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7" /></svg>
            Back to Dashboard
          </button>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4">
              Revision <span className="text-amber-400">Vault</span>
            </h2>
            <p className="text-slate-400 font-bold text-lg md:text-xl max-w-2xl">
              100% Mastery achieved. Every formula, note, and exam trick generated during your journey is now unified here.
            </p>
          </div>
        </div>

        <div className="flex border-b border-white/5 bg-slate-900/50 backdrop-blur no-print">
          <button 
            onClick={() => setActiveSubTab('notes')}
            className={`flex-1 py-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeSubTab === 'notes' ? 'border-amber-400 text-amber-400 bg-white/5' : 'border-transparent text-slate-500'}`}
          >
            Master READMEs
          </button>
          <button 
            onClick={() => setActiveSubTab('formulas')}
            className={`flex-1 py-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeSubTab === 'formulas' ? 'border-amber-400 text-amber-400 bg-white/5' : 'border-transparent text-slate-500'}`}
          >
            Formula Bible
          </button>
          <button 
            onClick={() => setActiveSubTab('tips')}
            className={`flex-1 py-6 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 ${activeSubTab === 'tips' ? 'border-amber-400 text-amber-400 bg-white/5' : 'border-transparent text-slate-500'}`}
          >
            Ultimate Cheat Sheet
          </button>
        </div>

        <div className="p-6 md:p-12 bg-white min-h-[600px]">
          {activeSubTab === 'notes' && (
            <div className="space-y-20">
              {allSubTopicsWithContent.length > 0 ? (
                allSubTopicsWithContent.map((st, i) => (
                  <div key={st.id} className="animate-in fade-in slide-in-from-bottom-10 duration-500" style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="flex items-center gap-4 mb-6 border-b-4 border-slate-900 pb-2">
                       <span className="text-4xl">📚</span>
                       <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">{st.title}</h3>
                    </div>
                    <div className="github-readme-preview shadow-sm mb-12">
                      <div className="github-readme-header">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16"><path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7l.01.01a.75.75 0 11-1.078 1.043A2.495 2.495 0 012 15.5v-13zm10.5 8.5V1.5H4.5a1 1 0 00-1 1V14a.5.5 0 01-.5.5.5.5 0 01-.5-.5V2.5a2.5 2.5 0 012.5-2.5h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7l.01.01a.75.75 0 11-1.078 1.043A2.495 2.495 0 012 15.5v-13z"></path></svg>
                        Archive: {st.title}
                      </div>
                      <div className="github-markdown-body bg-slate-50/30">
                        <MarkdownRenderer content={st.content!.notes} />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 text-slate-400 font-bold">Generate notes for topics to see them here.</div>
              )}
            </div>
          )}

          {activeSubTab === 'formulas' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {allFormulas.length > 0 ? (
                allFormulas.map((f, i) => (
                  <div key={i} className="animate-in zoom-in-95 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                    <FormulaItem formula={f} />
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 text-slate-400 font-bold">No formulas available in the vault yet.</div>
              )}
            </div>
          )}

          {activeSubTab === 'tips' && (
            <div className="space-y-12 max-w-4xl mx-auto">
              <div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-8 flex items-center gap-4">
                   <span className="w-12 h-1 bg-amber-600 rounded-full"></span>
                   Ultimate Cheat Sheet
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allTips.map((tip, i) => (
                      <div key={i} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex gap-4 group hover:bg-white hover:shadow-xl transition-all">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xl shadow-sm shrink-0">💡</div>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{tip}</p>
                      </div>
                    ))}
                 </div>
              </div>

              <div>
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 mb-8 mt-16 flex items-center gap-4">
                   <span className="w-12 h-1 bg-indigo-600 rounded-full"></span>
                   Master Revision Hooks
                 </h3>
                 <div className="space-y-3">
                    {allRevisionPoints.map((point, i) => (
                      <div key={i} className="p-5 bg-indigo-50 border-l-4 border-indigo-500 rounded-r-2xl font-black text-sm md:text-lg text-indigo-900 flex gap-4 hover:translate-x-1 transition-transform">
                        <span className="text-indigo-400">⚡</span>
                        {point}
                      </div>
                    ))}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
