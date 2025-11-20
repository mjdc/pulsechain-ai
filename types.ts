export enum CryptoCurrency {
  BTC = 'BTC',
  ETH = 'ETH'
}

export interface PricePoint {
  timestamp: number;
  price: number;
  formattedTime: string;
}

export interface MarketData {
  currency: CryptoCurrency;
  currentPrice: number;
  change24h: number;
  change24hPercent: number;
  high24h: number;
  low24h: number;
  volume: string;
  history: PricePoint[];
}

export interface AIAnalysisResult {
  summary: string;
  sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  technicalSignal: string;
}

// Window interface for EIP-1193 providers (MetaMask, Rabby, etc.)
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: (request: { method: string; params?: Array<any> }) => Promise<any>;
      on: (eventName: string, callback: (...args: any[]) => void) => void;
      removeListener: (eventName: string, callback: (...args: any[]) => void) => void;
    };
  }
}