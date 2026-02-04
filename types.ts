
export interface Formula {
  name: string;
  latex: string;
  originalScript: string;
  explanation: string;
  variableDefinitions: string[];
}

export interface PracticeQuestion {
  question: string;
  answer: string;
  explanation: string;
  tips: string;
}

export interface StudyContent {
  notes: string;
  hinglishNotes: string;
  lastMinuteNotes: string[];
  tips: string[];
  formulas: Formula[];
  solvedQuestion: {
    question: string;
    solution: string;
  };
  practiceQuestions: PracticeQuestion[];
  youtubeQuery: string;
}

export interface SubTopic {
  id: string;
  title: string;
  completed: boolean;
  content?: StudyContent;
}

export interface Topic {
  id: string;
  category: string;
  subTopics: SubTopic[];
}

export interface PlanDay {
  day: number;
  date: string;
  subTopicIds: string[];
  label: string;
}

export enum AppTab {
  Notes = 'Notes',
  LastMinute = 'Last Minute',
  Hinglish = 'Hinglish Guru',
  Formulas = 'Formulas',
  Tips = 'Tips & Tricks',
  SolvedQuestion = 'Solved Question',
  Practice = 'Practice Quiz',
  Resources = 'Resources'
}

export interface UserSettings {
  planStartDate: string;
  planEndDate: string;
}
