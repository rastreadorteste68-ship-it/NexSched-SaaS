import OpenAI from "openai";
import { Appointment, FinancialRecord } from "../types";

const getOpenAI = () => {
    // Configuração para usar OPENAI_API_KEY do ambiente.
    // dangerouslyAllowBrowser: true é necessário pois estamos rodando em ambiente Client-Side (React).
    // Em produção, isso deve ser movido para uma API Route do Next.js.
    const apiKey = process.env.OPENAI_API_KEY || ''; 
    return new OpenAI({ 
        apiKey,
        dangerouslyAllowBrowser: true 
    });
};

export const generateWhatsAppMessage = async (appointment: Appointment, companyName: string): Promise<string> => {
    if (!process.env.OPENAI_API_KEY) return "API Key ausente. Por favor, configure a OPENAI_API_KEY.";
    
    const client = getOpenAI();
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
        const response = await client.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
        });
        return response.choices[0]?.message?.content || "Não foi possível gerar a mensagem.";
    } catch (error) {
        console.error("OpenAI Error:", error);
        return "Erro ao criar mensagem inteligente.";
    }
};

export const analyzeFinancials = async (records: FinancialRecord[]): Promise<string> => {
     if (!process.env.OPENAI_API_KEY) return "API Key ausente.";

     const client = getOpenAI();
     const summary = JSON.stringify(records.slice(0, 20)); // Limit size
     const prompt = `
        Analise estes dados financeiros JSON de uma pequena empresa: ${summary}.
        Forneça um resumo conciso de 3 pontos sobre a saúde financeira e sugira 1 melhoria.
        Responda em Português do Brasil.
        Formate como texto simples.
     `;

     try {
         const response = await client.chat.completions.create({
             model: "gpt-4o-mini",
             messages: [{ role: "user", content: prompt }],
         });
         return response.choices[0]?.message?.content || "Análise indisponível.";
     } catch (error) {
         console.error("OpenAI Error:", error);
         return "Erro ao analisar financeiro.";
     }
}