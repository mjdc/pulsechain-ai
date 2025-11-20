'use client';

import React, { useState } from 'react';
import { Sparkles, RefreshCw, AlertCircle, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MarketData, AIAnalysisResult } from '../types';
import { generateMarketAnalysis } from '../app/actions';

interface AIAnalystProps {
  data: MarketData;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await generateMarketAnalysis(data);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-slate-800 bg-gradient-to-b from-slate-900 to-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white">Gemini AI Analyst</h2>
        </div>
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-cyan-500/10 px-3 py-1.5 text-xs font-bold text-cyan-400 transition-colors hover:bg-cyan-500/20 disabled:opacity-50"
        >
          {loading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
          {loading ? 'Analyzing Market...' : 'Generate Insight'}
        </button>
      </div>

      {!analysis && !loading && (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center text-slate-500">
            <div className="rounded-full bg-slate-800 p-4">
                <Sparkles className="h-8 w-8 text-slate-600" />
            </div>
          <p className="text-sm max-w-[250px]">
            Click generate to fetch real-time news and perform technical analysis on {data.currency} using Gemini 2.5 Flash.
          </p>
        </div>
      )}

      {loading && (
        <div className="flex flex-1 items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                 <div className="relative h-12 w-12">
                    <div className="absolute inset-0 animate-ping rounded-full bg-cyan-500/20"></div>
                    <div className="absolute inset-0 m-auto h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent"></div>
                 </div>
                 <p className="text-xs font-mono text-cyan-400 animate-pulse">PROCESSING_MARKET_DATA...</p>
            </div>
        </div>
      )}

      {analysis && !loading && (
        <div className="flex flex-1 flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="rounded-lg border border-slate-800 bg-slate-800/30 p-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sentiment</span>
                <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                    analysis.sentiment === 'BULLISH' ? 'bg-green-500/20 text-green-400' :
                    analysis.sentiment === 'BEARISH' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-500/20 text-slate-400'
                }`}>
                    {analysis.sentiment === 'BULLISH' && <TrendingUp className="h-3 w-3" />}
                    {analysis.sentiment === 'BEARISH' && <TrendingDown className="h-3 w-3" />}
                    {analysis.sentiment === 'NEUTRAL' && <Minus className="h-3 w-3" />}
                    {analysis.sentiment}
                </span>
            </div>
            <div className="mb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signal</span>
                <p className="text-sm font-mono text-white mt-1">{analysis.technicalSignal}</p>
            </div>
             <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Summary</span>
                <p className="text-sm leading-relaxed text-slate-300 mt-1">
                {analysis.summary}
                </p>
             </div>
          </div>

          <div className="mt-auto rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-yellow-200/70">
                AI Analysis is experimental and for informational purposes only. Not financial advice.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
