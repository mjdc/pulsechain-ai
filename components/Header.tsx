'use client';

import React from 'react';
import { Wallet, Hexagon, Loader2 } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';

export const Header: React.FC = () => {
  const { connected, address, isConnecting, connectWallet } = useWallet();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Hexagon className="h-8 w-8 text-cyan-500 fill-cyan-500/20" />
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-none tracking-tight text-white">
              PulseChain <span className="text-cyan-500">AI</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              WEB3_LIVE_DASHBOARD_V2
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-slate-800 px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">Mainnet Live</span>
          </div>

          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all ${
              connected
                ? 'bg-slate-800 text-cyan-400 border border-cyan-500/30'
                : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)]'
            }`}
          >
            {isConnecting ? (
               <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
               <Wallet className="h-4 w-4" />
            )}
            
            {connected ? (
              <span className="font-mono">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </span>
            ) : (
              isConnecting ? "Connecting..." : "Connect Wallet"
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
