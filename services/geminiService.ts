
import { GoogleGenAI, Type } from "@google/genai";
import { StudyContent, PracticeQuestion, Formula } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_PROMPT = `You are a world-class Data Analytics professor specializing in GATE 2026.
Your goal is to explain complex concepts in the simplest way possible.
Use the "ELI5" (Explain Like I'm Five) philosophy for foundations, then build up to technical rigor.
Always return ONLY raw JSON.`;

const parseGeminiJson = (text: string) => {
  const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("JSON Parse Error. Raw Text:", text);
    throw new Error("Invalid JSON format returned from AI.");
  }
};

export const generateStudyContent = async (topicTitle: string, category: string): Promise<StudyContent> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Topic: "${topicTitle}" (${category}).
    Provide a highly organized study guide in GitHub README.md style.
    
    CRITICAL: Include a section titled "🧭 Decision Matrix: Which Formula to Use?".
    This section must be a Markdown TABLE that maps:
    | If the Question mentions... | The Scenario is... | Use this Formula/Logic |
    | :--- | :--- | :--- |
    
    Format the "notes" field as follows:
    - # ${topicTitle}
    - > [ELI5 Summary]
    - ## 🚀 Quick Overview
    - ## 🎢 The Concept Analogy
    - ## 🛠️ Technical Breakdown (Core Logic)
    - ## 🧭 Decision Matrix: Which Formula to Use? (The Mapping Table)
    - ## ⚖️ Comparison vs Alternatives
    - ## ⚠️ Common Exam Traps
    - ## 📚 Revision Checklist

    Structure for JSON:
    1. "notes": Organized GitHub-style Markdown.
    2. "hinglishNotes": Conversational "Bhai-to-Bhai" explanation.
    3. "lastMinuteNotes": 10 "Memory Hooks".
    4. "tips": 5 "Cheat-code" exam tricks.
    5. "formulas": Array of objects (LaTeX + explanation).
    6. "solvedQuestion": 1 solved exam question.
    7. "practiceQuestions": 10 practice questions.
    8. "youtubeQuery": Best search term for a visual summary.`,
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

  return parseGeminiJson(response.text);
};

export const fetchFormulaByName = async (formulaName: string): Promise<Formula> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Detailed formula data for "${formulaName}".`,
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

  return parseGeminiJson(response.text);
};

export const generateMorePracticeQuestions = async (topicTitle: string, category: string, count: number = 10): Promise<PracticeQuestion[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate ${count} additional unique practice questions for "${topicTitle}". Make sure they test conceptual clarity first.`,
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

  return parseGeminiJson(response.text);
};
