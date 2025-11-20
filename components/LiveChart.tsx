'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MarketData, CryptoCurrency } from '../types';

interface LiveChartProps {
  data: MarketData;
}

export const LiveChart: React.FC<LiveChartProps> = ({ data }) => {
  const color = data.currency === CryptoCurrency.BTC ? '#f97316' : '#a855f7'; // Orange for BTC, Purple for ETH

  return (
    <div className="h-[400px] w-full rounded-xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="mb-6 flex items-center justify-between px-2">
        <div>
            <h3 className="text-sm font-medium text-slate-400">Live Price Action</h3>
            <p className="text-xs text-slate-500 mt-1">Real-time simulated feed (1s tick)</p>
        </div>
        <div className="flex gap-2">
            {['1H', '4H', '1D', '1W'].map((tf) => (
                <button 
                    key={tf} 
                    className={`rounded px-2 py-1 text-xs font-medium transition-colors ${tf === '1H' ? 'bg-slate-800 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    {tf}
                </button>
            ))}
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data.history}>
          <defs>
            <linearGradient id={`color${data.currency}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
          <XAxis 
            dataKey="formattedTime" 
            stroke="#64748b" 
            tick={{ fontSize: 11 }} 
            tickMargin={10}
            minTickGap={30}
          />
          <YAxis 
            domain={['auto', 'auto']} 
            stroke="#64748b" 
            tick={{ fontSize: 11 }} 
            tickFormatter={(val) => `$${val.toLocaleString()}`}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderColor: '#1e293b',
              borderRadius: '8px',
              color: '#f1f5f9',
            }}
            itemStyle={{ color: '#f1f5f9' }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, 'Price']}
          />
          <Area
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            fill={`url(#color${data.currency})`}
            animationDuration={500}
            isAnimationActive={false} // Disable for smooth ticker effect
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
