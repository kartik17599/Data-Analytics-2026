
import React, { useState } from 'react';
import { Topic, PlanDay, SubTopic } from '../types';

interface StudyPlanProps {
  topics: Topic[];
  onSelectSubTopic: (id: string) => void;
  startDate: string;
  endDate: string;
  onSetStartDate: (date: string) => void;
  onSetEndDate: (date: string) => void;
}

export const StudyPlan: React.FC<StudyPlanProps> = ({ 
  topics, 
  onSelectSubTopic, 
  startDate, 
  endDate, 
  onSetStartDate, 
  onSetEndDate 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const getSubTopicById = (id: string): SubTopic | null => {
    for (const t of topics) {
      const st = t.subTopics.find(s => s.id === id);
      if (st) return st;
    }
    return null;
  };

  const calculateDayProgress = (subTopicIds: string[]) => {
    const total = subTopicIds.length;
    const completed = subTopicIds.filter(id => getSubTopicById(id)?.completed).length;
    return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
  };

  // Logic to spread all subtopics across the selected date range
  const getDynamicPlan = (): PlanDay[] => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Safety check for invalid range
    if (end < start) {
      const autoEnd = new Date(start);
      autoEnd.setDate(start.getDate() + 10);
      return []; // Return empty if called with invalid data during state sync
    }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    // Limit range to prevent UI exploding, though we'll handle whatever they pick
    const safeDays = Math.min(Math.max(diffDays, 1), 60);

    const allSubTopicIds = topics.flatMap(t => t.subTopics.map(st => st.id));
    const subTopicsPerDay = Math.ceil(allSubTopicIds.length / safeDays);

    const plan: PlanDay[] = [];
    for (let i = 0; i < safeDays; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      
      const startIndex = i * subTopicsPerDay;
      const daySubTopicIds = allSubTopicIds.slice(startIndex, startIndex + subTopicsPerDay);
      
      if (daySubTopicIds.length > 0) {
        plan.push({
          day: i + 1,
          date: formatDate(current),
          subTopicIds: daySubTopicIds,
          label: `Focus Area ${i + 1}`
        });
      }
    }
    return plan;
  };

  const dynamicPlan = getDynamicPlan();
  const today = new Date();
  const todayStr = formatDate(today);
  const endPlanDate = dynamicPlan.length > 0 ? dynamicPlan[dynamicPlan.length - 1].date : '...';

  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 transition-all duration-500">
      <div 
        className="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
          <div>
            <h3 className="text-white font-black text-sm uppercase tracking-widest">Custom War Plan</h3>
            <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter">
              {dynamicPlan.length > 0 ? `${dynamicPlan[0].date} — ${endPlanDate}` : 'Set dates below'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowCalendar(!showCalendar);
            }}
            className="p-2 bg-slate-800 rounded-xl text-indigo-400 hover:text-white transition-colors no-print"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </button>
          <button className="text-slate-400 p-1">
            <svg className={`w-5 h-5 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
          </button>
        </div>
      </div>

      {showCalendar && (
        <div className="p-6 border-b border-slate-800 bg-slate-800/20 animate-in fade-in slide-in-from-top-2 duration-300 no-print">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Battle Start</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => onSetStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Deadline (End)</label>
              <input 
                type="date" 
                value={endDate}
                onChange={(e) => onSetEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
            </div>
          </div>
          <button 
            onClick={() => setShowCalendar(false)}
            className="w-full bg-indigo-600 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-colors"
          >
            Confirm Date Range
          </button>
        </div>
      )}

      {!isCollapsed && (
        <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 max-h-[600px] overflow-y-auto scrollbar-hide animate-in slide-in-from-top-4 duration-300">
          {dynamicPlan.length === 0 ? (
            <div className="col-span-full py-10 text-center text-slate-500 font-bold text-xs">
              Please set a valid date range (End Date must be after Start Date).
            </div>
          ) : (
            dynamicPlan.map((plan) => {
              const { completed, total, percent } = calculateDayProgress(plan.subTopicIds);
              const isToday = plan.date === todayStr;
              const isDone = completed === total && total > 0;

              return (
                <div 
                  key={plan.day} 
                  className={`p-4 rounded-2xl border transition-all ${
                    isDone 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : isToday 
                        ? 'bg-indigo-600 border-indigo-500 ring-4 ring-indigo-600/20 shadow-lg shadow-indigo-900/40' 
                        : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`text-[8px] font-black uppercase tracking-widest ${isToday ? 'text-indigo-200' : 'text-slate-500'}`}>Day {plan.day}</span>
                      <h4 className={`text-[10px] font-black uppercase tracking-tight truncate w-24 ${isToday ? 'text-white' : 'text-slate-200'}`}>{plan.date}</h4>
                    </div>
                    <div className={`text-[10px] font-black ${isDone ? 'text-emerald-400' : isToday ? 'text-indigo-100' : 'text-slate-400'}`}>
                      {completed}/{total}
                    </div>
                  </div>

                  <div className="space-y-1 mb-3">
                    {plan.subTopicIds.map(id => {
                      const st = getSubTopicById(id);
                      return (
                        <button 
                          key={id}
                          onClick={() => onSelectSubTopic(id)}
                          className={`w-full text-left text-[9px] font-bold py-1 px-2 rounded-lg truncate transition-colors ${
                            st?.completed 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : isToday 
                                ? 'bg-white/10 text-white hover:bg-white/20' 
                                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {st?.completed ? '✓ ' : '○ '}{st?.title}
                        </button>
                      );
                    })}
                  </div>

                  <div className="h-1 w-full bg-black/20 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${isDone ? 'bg-emerald-400' : 'bg-indigo-400'}`} 
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
