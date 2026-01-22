
import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { Topic, SubTopic, StudyContent, PracticeQuestion } from './types';
import { INITIAL_SYLLABUS } from './constants';
import { Dashboard } from './components/Dashboard';
import { TopicDetail } from './components/TopicDetail';

const STORAGE_KEY = 'da_2026_mastery_data';

const App: React.FC = () => {
  const [topics, setTopics] = useState<Topic[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_SYLLABUS;
  });
  const [selectedSubTopicId, setSelectedSubTopicId] = useState<string | null>(null);
  const [isRoadmapVisible, setIsRoadmapVisible] = useState<boolean>(true);
  const [mobileView, setMobileView] = useState<'roadmap' | 'content'>('roadmap');

  // Save progress whenever topics state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(topics));
  }, [topics]);

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
      localStorage.removeItem(STORAGE_KEY);
      setSelectedSubTopicId(null);
      setIsRoadmapVisible(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-8 lg:px-8 transition-all duration-500 min-h-screen">
      {/* Header */}
      <header className="mb-6 flex items-center justify-between sticky top-0 bg-gray-50/80 backdrop-blur-md z-30 py-2">
        <div className="flex items-center gap-4">
          {!isRoadmapVisible && (
             <button 
               onClick={() => {
                 setIsRoadmapVisible(true);
                 setMobileView('roadmap');
               }}
               className="bg-white border border-slate-200 p-2.5 rounded-2xl text-slate-600 hover:text-indigo-600 shadow-sm flex items-center gap-2"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 19l-7-7 7-7" /></svg>
               <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Roadmap</span>
             </button>
          )}
          <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
            DA <span className="text-indigo-600">2026</span>
          </h1>
        </div>
        
        <button 
          onClick={resetProgress}
          className="text-[9px] font-black text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors"
        >
          Reset App
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 relative items-start pb-20 md:pb-0">
        {/* Roadmap Column */}
        <div className={`lg:col-span-4 space-y-6 transition-all duration-500 ${
          isRoadmapVisible ? 'block' : 'hidden lg:hidden'
        } ${mobileView === 'content' ? 'hidden lg:block' : 'block'}`}>
          <Dashboard topics={topics} />
          
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
          {selectedTopicInfo ? (
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
              <p className="text-slate-500 max-w-xs font-bold text-sm">Select a module from the Roadmap to begin your mastery session.</p>
            </div>
          )}
        </div>
      </div>
      <Analytics />
    </div>
  );
};

export default App;
