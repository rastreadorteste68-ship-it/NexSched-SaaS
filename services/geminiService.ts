import { GoogleGenAI } from "@google/genai";
import { Appointment, FinancialRecord } from "../types";

const getAI = () => {
    // In a real app, never expose key on client. This is for demo purposes as requested by the environment.
    const apiKey = process.env.API_KEY || ''; 
    return new GoogleGenAI({ apiKey });
};

export const generateWhatsAppMessage = async (appointment: Appointment, companyName: string): Promise<string> => {
    if (!process.env.API_KEY) return "API Key ausente. Por favor, configure a API_KEY.";
    
    const ai = getAI();
    const prompt = `
      Você é um assistente de IA para uma empresa chamada "${companyName}".
      Gere uma mensagem de WhatsApp curta, polida e profissional para um cliente (em Português do Brasil).
      
      Detalhes:
      Nome do Cliente: ${appointment.clientName}
      Data/Hora: ${new Date(appointment.start).toLocaleString('pt-BR')}
      Status: ${appointment.status}
      Ação: Lembrete/Confirmação
      
      A mensagem deve ser amigável, incluir os detalhes e pedir confirmação se o status for pendente. Não inclua linhas de assunto. Use emojis com moderação.
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "Não foi possível gerar a mensagem.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Erro ao criar mensagem inteligente.";
    }
};

export const analyzeFinancials = async (records: FinancialRecord[]): Promise<string> => {
     if (!process.env.API_KEY) return "API Key ausente.";

     const ai = getAI();
     const summary = JSON.stringify(records.slice(0, 20)); // Limit size for demo
     const prompt = `
        Analise estes dados financeiros JSON de uma pequena empresa: ${summary}.
        Forneça um resumo conciso de 3 pontos sobre a saúde financeira e sugira 1 melhoria.
        Responda em Português do Brasil.
        Formate como texto simples.
     `;

     try {
         const response = await ai.models.generateContent({
             model: 'gemini-2.5-flash',
             contents: prompt,
         });
         return response.text || "Análise indisponível.";
     } catch (error) {
         console.error("Gemini Error:", error);
         return "Erro ao analisar financeiro.";
     }
}