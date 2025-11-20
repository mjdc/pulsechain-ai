'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity } from 'lucide-react';
import { MarketData } from '../types';

interface MetricCardProps {
  data: MarketData;
  active: boolean;
  onClick: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({ data, active, onClick }) => {
  const isPositive = data.change24hPercent >= 0;

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer overflow-hidden rounded-xl border p-6 transition-all duration-300 ${
        active
          ? 'border-cyan-500 bg-slate-800/80 shadow-[0_0_20px_rgba(6,182,212,0.15)]'
          : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/50'
      }`}
    >
      {active && (
        <div className="absolute top-0 right-0 -mt-2 -mr-2 h-24 w-24 rounded-full bg-cyan-500/10 blur-2xl" />
      )}
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            data.currency === 'BTC' ? 'bg-orange-500/20 text-orange-500' : 'bg-purple-500/20 text-purple-500'
          }`}>
            {data.currency === 'BTC' ? <DollarSign className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{data.currency}</h3>
            <p className="text-xs text-slate-400 font-mono">USDT PERPETUAL</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold ${
          isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(data.change24hPercent).toFixed(2)}%
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-3xl font-bold tracking-tight text-white font-mono">
          ${data.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
        <div className="flex items-center justify-between text-xs text-slate-400 mt-2">
          <span>Vol: <span className="text-slate-300">{data.volume}</span></span>
          <span>H: {data.high24h.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};
