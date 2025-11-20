import { NextResponse } from 'next/server';
import { GoogleGenAI } from "@google/genai";
import { MarketData, AIAnalysisResult, CryptoCurrency } from '../../../types';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const marketData = body as MarketData;

    // Strictly use process.env.API_KEY as per GenAI SDK guidelines
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'API Key not configured on server.' },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({ apiKey });

    const currencyName = marketData.currency === CryptoCurrency.BTC ? 'Bitcoin' : 'Ethereum';
    const currentPriceStr = `$${marketData.currentPrice.toFixed(2)}`;
    const trendStr = marketData.change24hPercent >= 0 ? 'up' : 'down';

    // We cannot use responseMimeType: 'application/json' with googleSearch tool.
    // We must rely on prompt engineering and manual parsing.
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
      
      CRITICAL: Return ONLY a raw JSON object. Do not use Markdown formatting. Do not use code blocks (no \`\`\`json).
      
      Expected JSON Structure:
      {
        "summary": "Concise summary of news and price action...",
        "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL",
        "technicalSignal": "e.g. RSI Divergence, Support Bounce"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // responseMimeType: "application/json" // NOT ALLOWED with googleSearch
      },
    });

    const text = response.text;

    if (!text) {
      return NextResponse.json(
        { error: 'No text response from Gemini.' },
        { status: 502 }
      );
    }

    // Robust Parsing Logic
    let parsedResult: AIAnalysisResult;

    try {
      // 1. Try parsing directly
      parsedResult = JSON.parse(text);
    } catch (e) {
      // 2. If failed, try cleaning Markdown code blocks
      try {
        const cleanedText = text
          .replace(/```json/g, '') // Remove start of code block
          .replace(/```/g, '')     // Remove end of code block
          .trim();                 // Remove whitespace
        parsedResult = JSON.parse(cleanedText);
      } catch (e2) {
         console.error("JSON Parsing Failed:", text);
         return NextResponse.json(
            { error: 'Failed to parse AI response.', rawResponse: text },
            { status: 500 }
         );
      }
    }

    // Normalize result to ensure fields exist
    const safeResult: AIAnalysisResult = {
        summary: parsedResult.summary || "Analysis available, but format was unexpected.",
        sentiment: ["BULLISH", "BEARISH", "NEUTRAL"].includes(parsedResult.sentiment) 
            ? parsedResult.sentiment 
            : "NEUTRAL",
        technicalSignal: parsedResult.technicalSignal || "Market Volatility"
    };

    return NextResponse.json(safeResult);

  } catch (err) {
    console.error('Analyze route error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}