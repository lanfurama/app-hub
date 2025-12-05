import { GoogleGenAI, Type } from "@google/genai";
import { AppData, Feedback, AIAnalysisResult } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client strictly as requested
const ai = new GoogleGenAI({ apiKey });

export const generateAppInsights = async (app: AppData, feedbacks: Feedback[]): Promise<AIAnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your configuration.");
  }

  const feedbackSummary = feedbacks.map(f => `- [${f.type}] ${f.title}: ${f.description}`).join('\n');
  
  const prompt = `
    You are a Senior Product Manager and Tech Lead. Analyze the following application and its user feedback.
    
    App Name: ${app.name}
    Description: ${app.description}
    Tech Stack: ${app.techStack.join(', ')}
    
    User Feedback:
    ${feedbackSummary || "No feedback yet."}
    
    Provide a structured analysis in JSON format containing:
    1. A brief executive summary of the app's current state.
    2. A list of 3 concrete feature suggestions to improve the app.
    3. A list of 3 potential technical challenges or bugs based on the stack and feedback.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            suggestions: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            technicalChallenges: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) {
        throw new Error("Empty response from AI");
    }
    
    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};
