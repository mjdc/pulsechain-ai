'use client';

import React from 'react';
import { Header } from '../components/Header';
import { MetricCard } from '../components/MetricCard';
import { LiveChart } from '../components/LiveChart';
import { AIAnalyst } from '../components/AIAnalyst';
import { CryptoCurrency } from '../types';
import { useMarketStore } from '../store/marketStore';
import { useWallet } from '../hooks/useWallet';
import { useMarketStream } from '../hooks/useMarketStream';

export default function Dashboard() {
  // Initialize data streams (Background logic)
  useMarketStream();
  
  // Access Global State
  const { 
    selectedCurrency, 
    setSelectedCurrency, 
    btcData, 
    ethData, 
    isLoading, 
    usingFallback 
  } = useMarketStore();

  const { chainId, connected } = useWallet();

  // Derived State
  const activeData = selectedCurrency === CryptoCurrency.BTC ? btcData : ethData;

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent"></div>
                <p className="text-slate-400 font-mono text-sm animate-pulse">INITIALIZING_DASHBOARD...</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen pb-20 selection:bg-cyan-500/30">
      <Header />

      <main className="container mx-auto mt-8 px-4">
        {/* Market Status Banner */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-lg border border-slate-800 bg-slate-900/50 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
                <span className={`flex h-2 w-2 rounded-full ${usingFallback ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></span>
                <span className="text-sm font-medium text-slate-300">
                    Data Source: <span className={`${usingFallback ? 'text-yellow-400' : 'text-green-400'} font-bold`}>
                        {usingFallback ? 'SIMULATED (API LIMIT)' : 'BINANCE LIVE FEED'}
                    </span>
                </span>
            </div>
            <div className="flex gap-4 text-xs text-slate-500 font-mono">
                <span>GAS: <span className="text-slate-300">15 Gwei</span></span>
                <span>
                    {chainId === '0x169' ? 'PULSECHAIN' : chainId === '0x1' ? 'ETHEREUM' : 'NETWORK'} 
                    <span className="text-slate-300 ml-1">
                        {connected ? 'CONNECTED' : 'DISCONNECTED'}
                    </span>
                </span>
            </div>
        </div>

        {/* Top Cards */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          <MetricCard 
            data={btcData} 
            active={selectedCurrency === CryptoCurrency.BTC} 
            onClick={() => setSelectedCurrency(CryptoCurrency.BTC)} 
          />
          <MetricCard 
            data={ethData} 
            active={selectedCurrency === CryptoCurrency.ETH} 
            onClick={() => setSelectedCurrency(CryptoCurrency.ETH)} 
          />
        </div>

        {/* Main Content Area */}
        <div className="grid gap-6 lg:grid-cols-3 h-auto lg:h-[500px]">
          
          {/* Chart Section */}
          <div className="lg:col-span-2 h-full">
             <LiveChart data={activeData} />
          </div>

          {/* AI Analysis Section */}
          <div className="h-full">
            <AIAnalyst data={activeData} />
          </div>
        </div>

        {/* Recent Transactions Table (Live based on active price) */}
        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                 <h3 className="text-lg font-bold text-white">Recent Order Book Activity</h3>
                 <span className="text-xs text-slate-500 font-mono uppercase">Live {selectedCurrency} Executions</span>
            </div>
           
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-400">
                    <thead className="border-b border-slate-800 text-xs uppercase text-slate-500">
                        <tr>
                            <th className="px-4 py-3 font-medium">Time</th>
                            <th className="px-4 py-3 font-medium">Type</th>
                            <th className="px-4 py-3 font-medium">Price</th>
                            <th className="px-4 py-3 font-medium">Amount ({selectedCurrency})</th>
                            <th className="px-4 py-3 font-medium text-right">Total (USDT)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {[1, 2, 3, 4, 5].map((i) => {
                             // Generate pseudo-random trades close to the ACTUAL current price
                             // In a real app, this would also come from the WebSocket stream
                             const isBuy = Math.random() > 0.5;
                             const tradePrice = activeData.currentPrice + (Math.random() - 0.5) * (activeData.currentPrice * 0.0005);
                             const amount = Math.random() * (selectedCurrency === 'BTC' ? 0.5 : 5);
                             return (
                            <tr key={i} className="hover:bg-slate-800/30 transition-colors animate-in fade-in duration-500">
                                <td className="px-4 py-3 font-mono text-slate-500">
                                    {new Date(Date.now() - i * 2000).toLocaleTimeString([], {hour12: false})}
                                </td>
                                <td className={`px-4 py-3 font-bold ${isBuy ? 'text-green-500' : 'text-red-500'}`}>
                                    {isBuy ? 'BUY' : 'SELL'}
                                </td>
                                <td className="px-4 py-3 text-slate-300">
                                    ${tradePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-4 py-3 text-slate-300">
                                    {amount.toFixed(4)}
                                </td>
                                <td className="px-4 py-3 text-right text-slate-300">
                                    ${(tradePrice * amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                            </tr>
                        )})}
                    </tbody>
                </table>
            </div>
        </div>
      </main>
    </div>
  );
}
