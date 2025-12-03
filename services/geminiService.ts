import OpenAI from "openai";
import { Appointment, FinancialRecord } from "../types";

const getAI = () => {
  const apiKey = process.env.OPENAI_API_KEY || "";
  return new OpenAI({ apiKey });
};

// ========================
// MENSAGEM DE WHATSAPP
// ========================
export const generateWhatsAppMessage = async (
  appointment: Appointment,
  companyName: string
): Promise<string> => {
  if (!process.env.OPENAI_API_KEY)
    return "API Key ausente. Configure OPENAI_API_KEY no Vercel.";

  const ai = getAI();

  const prompt = `
    Gere uma mensagem de WhatsApp profissional da empresa "${companyName}".
    Dados:
    Cliente: ${appointment.clientName}
    Data: ${new Date(appointment.start).toLocaleString("pt-BR")}
    Status: ${appointment.status}
    Tipo: Lembrete/Confirmação.
    Responda de forma curta, clara, educada e em Português do Brasil.
  `;

  try {
    const response = await ai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content || "Erro ao gerar mensagem.";
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Erro ao gerar mensagem inteligente.";
  }
};

// ========================
// ANÁLISE FINANCEIRA
// ========================
export const analyzeFinancials = async (
  records: FinancialRecord[]
): Promise<string> => {
  if (!process.env.OPENAI_API_KEY) return "API Key ausente.";

  const ai = getAI();
  const summary = JSON.stringify(records.slice(0, 20));

  const prompt = `
    Analise estes dados financeiros JSON: ${summary}
    Resuma em 3 pontos e sugira 1 melhoria.
    Responda em Português do Brasil.
  `;

  try {
    const response = await ai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return response.choices[0]?.message?.content || "Erro ao gerar análise.";
  } catch (error) {
    console.error("OpenAI Error:", error);
    return "Erro ao analisar dados.";
  }
};
