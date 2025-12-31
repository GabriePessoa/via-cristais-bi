
import { GoogleGenAI } from "@google/genai";
import { TollRecord } from "../types";

export const getOperationalInsights = async (data: TollRecord[]) => {
  /* ALWAYS initialize GoogleGenAI with { apiKey: process.env.API_KEY } inside the service call to ensure the latest key is used */
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Fixed: Map to use snake_case properties if camelCase ones are undefined
  const summary = data.map(r => ({
    plaza: r.plaza_name || r.plazaName,
    traffic: (r.light_vehicles || r.lightVehicles || 0) + (r.heavy_vehicles || r.heavyVehicles || 0),
    incidents: r.incidents || 0,
    revenue: (r.revenue_cash || r.revenueCash || 0) + (r.revenue_electronic || r.revenueElectronic || 0)
  }));

  const prompt = `Analise os seguintes dados operacionais de praças de pedágio e forneça 3 insights estratégicos curtos (máximo 2 frases cada) focados em eficiência operacional e segurança.
  Dados: ${JSON.stringify(summary)}
  
  Responda em Português do Brasil com um tom profissional de BI.`;

  try {
    /* FIX: Use 'gemini-3-pro-preview' for complex text analysis tasks as per guidelines */
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
    });
    /* FIX: Access response.text directly (it is a property, not a method) */
    return response.text;
  } catch (error) {
    console.error("Erro ao obter insights do Gemini:", error);
    return "Não foi possível gerar insights no momento. Verifique sua conexão ou dados.";
  }
};
