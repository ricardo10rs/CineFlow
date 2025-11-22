import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const analyzeContent = async (text: string, context: 'document' | 'announcement'): Promise<AIAnalysis> => {
  if (!apiKey) {
    console.warn("API Key is missing. Returning mock analysis.");
    return {
      summary: "Resumo indisponível (Chave API ausente).",
      tags: ["Sem tags"],
      sentiment: "Neutral"
    };
  }

  try {
    const prompt = `
      Analise o seguinte texto que representa um ${context === 'document' ? 'documento ou imagem corporativa' : 'comunicado oficial da empresa'}.
      
      Texto: "${text}"

      Gere um resumo conciso (máximo 15 palavras), extraia até 3 tags relevantes, e determine o sentimento/urgência (Positive, Neutral, Urgent).
      Responda estritamente em JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            tags: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            sentiment: { 
              type: Type.STRING, 
              enum: ["Positive", "Neutral", "Urgent"] 
            }
          },
          required: ["summary", "tags", "sentiment"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    
    return {
      summary: result.summary || "Sem resumo gerado.",
      tags: result.tags || [],
      sentiment: result.sentiment || "Neutral"
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      summary: "Erro ao processar IA.",
      tags: ["Erro"],
      sentiment: "Neutral"
    };
  }
};