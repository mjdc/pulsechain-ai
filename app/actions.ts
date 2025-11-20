import { GoogleGenAI, Type, Schema } from "@google/genai";
import { CryptoCurrency, MarketData, AIAnalysisResult } from "../types";

// NOTE: In a real Next.js production build, you would use 'use server' here.
// For this client-side preview, we execute directly in the browser.

const apiKey = process.env.API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || 'dummy-key' });

export async function generateMarketAnalysis(
  marketData: MarketData
): Promise<AIAnalysisResult> {
  if (!apiKey) {
    console.warn("Gemini API Key is missing.");
    return {
      summary: "API Key missing. Please configure process.env.API_KEY to enable AI analysis.",
      sentiment: "NEUTRAL",
      technicalSignal: "Configuration Error"
    };
  }

  const currencyName = marketData.currency === CryptoCurrency.BTC ? 'Bitcoin' : 'Ethereum';
  const currentPriceStr = `$${marketData.currentPrice.toFixed(2)}`;
  const trendStr = marketData.change24hPercent >= 0 ? 'up' : 'down';
  
  const prompt = `
    Perform a live market analysis for ${currencyName} (${marketData.currency}).
    
    Current Technical Data:
    - Price: ${currentPriceStr}
    - 24h Change: ${marketData.change24hPercent.toFixed(2)}% (${trendStr})
    - 24h High: $${marketData.high24h.toFixed(2)}
    - 24h Low: $${marketData.low24h.toFixed(2)}
    
    Task:
    1. Use Google Search to find the absolute latest news headlines for ${currencyName} from the last 24 hours.
    2. Combine the news with the provided technical data to generate a short trading signal.
    3. Determine if the sentiment is BULLISH, BEARISH, or NEUTRAL.
    
    Return the response in JSON format.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      summary: {
        type: Type.STRING,
        description: "A concise 2-3 sentence summary of the market situation merging news and price action.",
      },
      sentiment: {
        type: Type.STRING,
        enum: ["BULLISH", "BEARISH", "NEUTRAL"],
        description: "The overall market sentiment.",
      },
      technicalSignal: {
        type: Type.STRING,
        description: "A specialized technical indicator phrase (e.g., 'RSI Divergence', 'Support Re-test').",
      }
    },
    required: ["summary", "sentiment", "technicalSignal"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    const result = JSON.parse(text) as AIAnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    return {
      summary: "Unable to fetch live AI analysis at this moment. Market shows standard volatility.",
      sentiment: "NEUTRAL",
      technicalSignal: "Data Unavailable"
    };
  }
}