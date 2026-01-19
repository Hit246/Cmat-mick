
import { GoogleGenAI, Type } from "@google/genai";
import { TestAttempt, AIAnalysis } from "../types";

export const getAIAnalysis = async (attempt: TestAttempt, testTitle: string): Promise<AIAnalysis> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `Analyze this CMAT mock test attempt:
    Test: ${testTitle}
    Total Score: ${attempt.score}
    Section Scores: ${JSON.stringify(attempt.sectionWiseScores)}
    
    Provide a detailed performance analysis including strengths, weaknesses, a specific improvement plan for a CMAT aspirant, and suggested resources. Return the output in structured JSON format.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          improvementPlan: { type: Type.STRING },
          suggestedResources: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["strengths", "weaknesses", "improvementPlan", "suggestedResources"],
      },
    },
  });

  return JSON.parse(response.text || '{}');
};

export const getQuestionExplanation = async (question: string, options: string[], correctAnswer: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  const prompt = `Explain why the correct answer to this question is "${correctAnswer}".
  Question: ${question}
  Options: ${options.join(', ')}
  Provide a step-by-step breakdown suitable for a CMAT student.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text || "No explanation available.";
};
