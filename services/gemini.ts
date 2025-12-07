import { GoogleGenAI, Type } from "@google/genai";
import { BusinessData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateFinancialInsight = async (data: BusinessData): Promise<string> => {
  if (!apiKey) return "API Key not configured.";

  const totalRevenue = data.transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = data.transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const outstandingInvoices = data.invoices
    .filter(i => i.status !== 'Paid' && i.status !== 'Void')
    .reduce((sum, i) => sum + i.totalAmount, 0);

  const unpaidBills = data.bills
    .filter(b => b.status !== 'Paid')
    .reduce((sum, b) => sum + b.amount, 0);

  const financialSummary = {
    totalAssets: data.assets.reduce((sum, a) => sum + a.value, 0),
    totalLiabilities: data.liabilities.reduce((sum, l) => sum + l.amount, 0),
    incomeStatement: {
      totalRevenue,
      totalExpenses,
      netIncome: totalRevenue - totalExpenses
    },
    receivables: {
      totalOutstanding: outstandingInvoices,
      count: data.invoices.filter(i => i.status !== 'Paid').length
    },
    payables: {
      totalUnpaid: unpaidBills,
      count: data.bills.filter(b => b.status !== 'Paid').length
    },
    recentTransactions: data.transactions.slice(-5).map(t => `${t.date}: ${t.description} ($${t.amount})`),
    cashPosition: data.assets.find(a => a.name.includes("Cash"))?.value || 0
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following business financial summary. Focus on:
      1. Profitability (Net Income margin).
      2. Liquidity (Can they pay bills with current cash + receivables?).
      3. One strategic recommendation regarding AR/AP management.
      
      Data: ${JSON.stringify(financialSummary)}`,
      config: {
        systemInstruction: "You are a senior financial analyst providing insights for a CFO.",
        thinkingConfig: { thinkingBudget: 0 } 
      }
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate financial insights.";
  }
};

export const generateJobDescription = async (roleTitle: string, department: string): Promise<{ description: string, requirements: string[] }> => {
  if (!apiKey) return { description: "API Key missing", requirements: [] };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Create a job description and list of 5 key requirements for a ${roleTitle} in the ${department} department.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING },
            requirements: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return { description: "Error generating description.", requirements: [] };
  }
};