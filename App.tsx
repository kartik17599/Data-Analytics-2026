
import React, { useState, useEffect, useRef } from 'react';
import { Topic, SubTopic, StudyContent, PracticeQuestion, UserSettings } from './types';
import { INITIAL_SYLLABUS } from './constants';
import { Dashboard } from './components/Dashboard';
import { TopicDetail } from './components/TopicDetail';
import { StudyPlan } from './components/StudyPlan';
import { RevisionVault } from './components/RevisionVault';

const STORAGE_KEY = 'da_2026_mastery_data';
const SETTINGS_KEY = 'da_2026_user_settings';

const App: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SYLLABUS;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem(SETTINGS_KEY);
    if (saved) return JSON.parse(saved);
    
    const start = new Date();
    const end = new Date();
    end.setDate(start.getDate() + 10); // Default 10-day deadline
    
    return { 
      planStartDate: start.toISOString().split('T')[0],
      planEndDate: end.toISOString().split('T')[0]
    };
  });

  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string | null>(null);
  const [isRoadmapVisible, setIsRoadmapVisible] = useState<boolean>(true);
  const [isRevisionMode, setIsRevisionMode] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'roadmap' | 'content' | 'revision'>('roadmap');
  
  // Install Prompt State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  }, [topics]);

  useEffect(() => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null);
      setIsInstalled(true);
      setShowManualModal(false);
    });

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallApp = async () => {
    if (isInstalled) {
      alert("App is already installed on your home screen!");
      return;
    }
    if (!deferredPrompt) {
      setShowManualModal(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const exportProgress = () => {
    const data = JSON.stringify({ topics, settings }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DA2026_Mastery_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (json.topics) {
          setTopics(json.topics);
          if (json.settings) setSettings(json.settings);
        } else if (Array.isArray(json)) {
          setTopics(json);
        } else {
          throw new Error("Invalid format");
        }
        alert("Import Successful!");
      } catch (err) {
        alert("Failed to import. Invalid JSON format.");
      }
    };
    reader.readAsText(file);
  };

  const toggleSubTopicCompletion = (subTopicId: string) => {
    setTopics(prev => prev.map(topic => ({
      ...topic,
      subTopics: topic.subTopics.map(st => 
        st.id === subTopicId ? { ...st, completed: !st.completed } : st
      )
    })));
  };

  const handleContentGenerated = (subTopicId: string, content: StudyContent) => {
    setTopics(prev => prev.map(topic => ({
      ...topic,
      subTopics: topic.subTopics.map(st => 
        st.id === subTopicId ? { ...st, content } : st
      )
    })));
  };

  const handleAddMoreQuestions = (subTopicId: string, newQuestions: PracticeQuestion[]) => {
    setTopics(prev => prev.map(topic => ({
      ...topic,
      subTopics: topic.subTopics.map(st => 
        st.id === subTopicId && st.content 
          ? { 
              ...st, 
              content: { 
                ...st.content, 
                practiceQuestions: [...st.content.practiceQuestions, ...newQuestions] 
              } 
            } 
          : st
      )
    })));
  };

  const selectSubTopic = (id: string) => {
    setIsRevisionMode(false);
    setSelectedSubTopicId(id);
    setIsRoadmapVisible(false);
    setMobileView('content');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const selectedTopicInfo = topics.reduce<{ topic: Topic, subTopic: SubTopic } | null>((acc, topic) => {
    if (acc) return acc;
    const subTopic = topic.subTopics.find(st => st.id === selectedSubTopicId);
    if (subTopic) return { topic, subTopic };
    return null;
  }, null);

  const resetProgress = () => {
    if (confirm("Clear all progress and notes? This cannot be undone.")) {
      setTopics(INITIAL_SYLLABUS);
      const start = new Date().toISOString().split('T')[0];
      const end = new Date();
      end.setDate(new Date().getDate() + 10);
      setSettings({ planStartDate: start, planEndDate: end.toISOString().split('T')[0] });
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(SETTINGS_KEY);
      setSelectedSubTopicId(null);
      setIsRoadmapVisible(true);
      setIsRevisionMode(false);
    }
  };

  const handleSetStartDate = (date: string) => {
    setSettings(prev => ({ ...prev, planStartDate: date }));
  };

  const handleSetEndDate = (date: string) => {
    setSettings(prev => ({ ...prev, planEndDate: date }));
  };

  const handleOpenVault = () => {
    setIsRevisionMode(true);
    setIsRoadmapVisible(false);
    setMobileView('revision');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 lg:px-8 transition-all duration-500 min-h-screen">
      <input type="file" ref={fileInputRef} onChange={importProgress} className="hidden" accept=".json" />
      
      {/* Header */}
      <header className="mb-6 flex items-center justify-between sticky top-0 bg-gray-50/80 backdrop-blur-md z-30 py-2">
        <div className="flex items-center gap-4">
          {(!isRoadmapVisible || isRevisionMode) && (
             <button 
               onClick={() => {
                 setIsRoadmapVisible(true);
                 setIsRevisionMode(false);
                 setMobileView('roadmap');
               }}
               className="bg-white border border-slate-200 p-2.5 rounded-2xl text-slate-600 hover:text-indigo-600 shadow-sm flex items-center gap-2"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7" /></svg>
               <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Back</span>
             </button>
          )}
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            DA <span className="text-indigo-600">2026</span>
            {isRevisionMode && <span className="ml-2 text-amber-500 text-sm uppercase tracking-widest">Vault</span>}
          </h1>
        </div>
        
        <div className="flex items-center gap-2 md:gap-4">
           <div className="flex items-center gap-1">
              <button 
                onClick={exportProgress}
                title="Export Progress"
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="Import Progress"
                className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              </button>
           </div>
           
           {!isInstalled && (
             <button 
               onClick={handleInstallApp}
               className="md:hidden flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-200"
             >
               <span>Install App</span>
             </button>
           )}
           <button 
             onClick={resetProgress}
             className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
           >
             Reset
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative items-start pb-20 md:pb-0">
        {/* Roadmap Column */}
        <div className={`lg:col-span-4 space-y-6 transition-all duration-500 ${
          isRoadmapVisible ? 'block' : 'hidden lg:hidden'
        } ${mobileView === 'content' || mobileView === 'revision' ? 'hidden lg:block' : 'block'}`}>
          
          <StudyPlan 
            topics={topics} 
            onSelectSubTopic={selectSubTopic} 
            startDate={settings.planStartDate}
            endDate={settings.planEndDate}
            onSetStartDate={handleSetStartDate}
            onSetEndDate={handleSetEndDate}
          />
          
          <Dashboard 
            topics={topics} 
            onInstall={handleInstallApp} 
            showInstall={!isInstalled} 
            isReady={!!deferredPrompt}
            onOpenVault={handleOpenVault}
          />
          
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Mastery Path</h2>
            <div className="space-y-8">
              {topics.map((topic, topicIdx) => (
                <div key={topic.id} className="relative">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[8px] font-black">{topicIdx + 1}</div>
                    <h3 className="text-[10px] font-black text-slate-900 uppercase truncate">{topic.category.split(':')[1] || topic.category}</h3>
                  </div>
                  <div className="pl-6 space-y-1.5 border-l-2 border-slate-50 ml-2.5">
                    {topic.subTopics.map(st => (
                      <button
                        key={st.id}
                        onClick={() => selectSubTopic(st.id)}
                        className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-left transition-all border ${
                          selectedSubTopicId === st.id
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                            : 'bg-white text-slate-600 border-slate-100'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center shrink-0 ${st.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-slate-50 border-slate-200'}`}>
                          {st.completed && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" /></svg>}
                        </div>
                        <span className="text-xs font-bold truncate">{st.title}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Column */}
        <div className={`transition-all duration-500 ease-in-out ${
          isRoadmapVisible ? 'lg:col-span-8' : 'lg:col-span-12 max-w-5xl mx-auto'
        } ${mobileView === 'roadmap' ? 'hidden lg:block' : 'block'} w-full`}>
          {isRevisionMode ? (
            <RevisionVault topics={topics} onBack={() => {
              setIsRevisionMode(false);
              setIsRoadmapVisible(true);
              setMobileView('roadmap');
            }} />
          ) : selectedTopicInfo ? (
            <TopicDetail 
              subTopic={selectedTopicInfo.subTopic} 
              category={selectedTopicInfo.topic.category}
              onToggleComplete={toggleSubTopicCompletion}
              onContentGenerated={handleContentGenerated}
              onAddMoreQuestions={handleAddMoreQuestions}
              onBack={() => {
                setMobileView('roadmap');
                setIsRoadmapVisible(true);
              }}
            />
          ) : (
            <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] border-2 border-dashed border-slate-200 p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
              <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-8 text-indigo-600">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Ready to Study?</h2>
              <p className="text-slate-500 max-w-xs font-bold text-sm">Select a module from the Roadmap or the War Plan to begin your mastery session.</p>
            </div>
          )}
        </div>
      </div>

      {/* Manual Install Instructions Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-end sm:items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 shadow-2xl animate-in slide-in-from-bottom-10 duration-500 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 -z-10 opacity-50"></div>
              
              <div className="flex justify-between items-start mb-8">
                <div className="bg-indigo-600 p-4 rounded-2xl text-white shadow-lg shadow-indigo-900/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <button onClick={() => setShowManualModal(false)} className="text-slate-400 hover:text-slate-600 p-2 bg-slate-50 rounded-full transition-colors">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Install App</h3>
              <p className="text-slate-500 font-bold mb-10 text-sm leading-relaxed">Your browser didn't trigger the automatic prompt. Use the <span className="text-indigo-600 underline underline-offset-4">manual setup</span> steps below:</p>
              
              <div className="space-y-8 mb-10">
                <div className="flex gap-5 group">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-md">1</div>
                  <div className="flex flex-col">
                    <p className="text-slate-700 font-black text-sm mb-2">Tap Three Dots (⋮)</p>
                    <p className="text-[11px] font-bold text-slate-500 leading-tight">Located at the top-right of your mobile browser menu.</p>
                  </div>
                </div>
                
                <div className="flex gap-5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-md">2</div>
                  <div className="flex flex-col">
                    <p className="text-slate-700 font-black text-sm mb-2">Select "Install App"</p>
                    <p className="text-[11px] font-bold text-slate-500 leading-tight">Or "Add to Home Screen" to enable standalone native-like experience.</p>
                  </div>
                </div>

                <div className="flex gap-5">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-sm font-black shrink-0 shadow-md">3</div>
                  <div className="flex flex-col">
                    <p className="text-slate-700 font-black text-sm mb-2">Ready to Study</p>
                    <p className="text-[11px] font-bold text-slate-500 leading-tight">The app icon will appear instantly on your device home screen.</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowManualModal(false)}
                className="w-full bg-slate-900 text-white py-5 rounded-[1.5rem] font-black text-sm uppercase tracking-[0.2em] shadow-2xl shadow-slate-200 hover:bg-indigo-600 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                Back to Roadmap
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
