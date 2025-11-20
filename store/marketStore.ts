import { create } from 'zustand';
import { CryptoCurrency, MarketData } from '../types';

interface MarketState {
  selectedCurrency: CryptoCurrency;
  btcData: MarketData;
  ethData: MarketData;
  isLoading: boolean;
  usingFallback: boolean;

  // Actions
  setSelectedCurrency: (currency: CryptoCurrency) => void;
  setBtcData: (data: MarketData | ((prev: MarketData) => MarketData)) => void;
  setEthData: (data: MarketData | ((prev: MarketData) => MarketData)) => void;
  setIsLoading: (loading: boolean) => void;
  setUsingFallback: (fallback: boolean) => void;
}

// Initial Empty Data Helper
const initialData = (currency: CryptoCurrency): MarketData => ({
  currency,
  currentPrice: 0,
  change24h: 0,
  change24hPercent: 0,
  high24h: 0,
  low24h: 0,
  volume: "---",
  history: []
});

export const useMarketStore = create<MarketState>((set) => ({
  selectedCurrency: CryptoCurrency.BTC,
  btcData: initialData(CryptoCurrency.BTC),
  ethData: initialData(CryptoCurrency.ETH),
  isLoading: true,
  usingFallback: false,

  setSelectedCurrency: (currency) => set({ selectedCurrency: currency }),
  
  setBtcData: (updater) => set((state) => ({
    btcData: typeof updater === 'function' ? updater(state.btcData) : updater
  })),

  setEthData: (updater) => set((state) => ({
    ethData: typeof updater === 'function' ? updater(state.ethData) : updater
  })),

  setIsLoading: (isLoading) => set({ isLoading }),
  setUsingFallback: (usingFallback) => set({ usingFallback }),
}));
