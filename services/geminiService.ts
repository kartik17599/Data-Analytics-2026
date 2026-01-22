
import { GoogleGenAI, Type } from "@google/genai";
import { StudyContent, PracticeQuestion, Formula } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `You are a world-class Data Analytics professor specializing in GATE 2026 and professional certifications.
Your goal is to provide perfectly structured, academically rigorous, yet accessible study material.
Always use standard mathematical notation for formulas and clear, single-point statements for last-minute revision.`;

export const generateStudyContent = async (topicTitle: string, category: string): Promise<StudyContent> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Topic: "${topicTitle}" (${category}).
    Provide a study guide with:
    1. "notes": Concise technical notes.
    2. "hinglishNotes": A conversational breakdown in Hinglish.
    3. "lastMinuteNotes": 7-10 "Single Point" high-impact facts.
    4. "tips": Specific exam shortcuts.
    5. "formulas": Strictly standard academic LaTeX.
       - "latex": Standard textbook LaTeX (e.g., \frac{n!}{(n-r)!}).
       - "originalScript": The "original written way" - a plain text representation that looks like a student's manual note (e.g., nPr = n! / (n-r)!).
       - "explanation": Exactly 1-sentence on what it measures.
       - "variableDefinitions": Define every symbol and index.
    6. "solvedQuestion": One high-quality solved GATE-style example.
    7. "practiceQuestions": 10 unique problems.
    8. "youtubeQuery": Optimal search string.`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          notes: { type: Type.STRING },
          hinglishNotes: { type: Type.STRING },
          lastMinuteNotes: { type: Type.ARRAY, items: { type: Type.STRING } },
          tips: { type: Type.ARRAY, items: { type: Type.STRING } },
          formulas: { 
            type: Type.ARRAY, 
            items: { 
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                latex: { type: Type.STRING },
                originalScript: { type: Type.STRING },
                explanation: { type: Type.STRING },
                variableDefinitions: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["name", "latex", "originalScript", "explanation", "variableDefinitions"]
            } 
          },
          solvedQuestion: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              solution: { type: Type.STRING },
            },
            required: ["question", "solution"],
          },
          practiceQuestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING },
                explanation: { type: Type.STRING },
                tips: { type: Type.STRING }
              },
              required: ["question", "answer", "explanation", "tips"]
            }
          },
          youtubeQuery: { type: Type.STRING },
        },
        required: ["notes", "hinglishNotes", "lastMinuteNotes", "tips", "formulas", "solvedQuestion", "practiceQuestions", "youtubeQuery"],
      },
    },
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Parse Error:", error);
    throw new Error("Failed to generate consistent study content.");
  }
};

export const fetchFormulaByName = async (formulaName: string): Promise<Formula> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Mathematical formula for "${formulaName}". Provide both standard LaTeX and a "originalScript" (plain text/handwritten style). Define all variables. 1-sentence explanation.`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          latex: { type: Type.STRING },
          originalScript: { type: Type.STRING },
          explanation: { type: Type.STRING },
          variableDefinitions: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["name", "latex", "originalScript", "explanation", "variableDefinitions"]
      }
    }
  });

  try {
    return JSON.parse(response.text.trim());
  } catch (error) {
    throw new Error("Formula not found.");
  }
};

export const generateMorePracticeQuestions = async (topicTitle: string, category: string, count: number = 10): Promise<PracticeQuestion[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate ${count} additional unique practice questions for "${topicTitle}".`,
    config: {
      systemInstruction: SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            answer: { type: Type.STRING },
            explanation: { type: Type.STRING },
            tips: { type: Type.STRING }
          },
          required: ["question", "answer", "explanation", "tips"]
        }
      },
    },
  });

  return JSON.parse(response.text.trim());
};
