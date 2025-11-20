import { useEffect, useRef } from 'react';
import { useMarketStore } from '../store/marketStore';
import { CryptoCurrency, PricePoint } from '../types';
import { generateMockHistory, formatChartTime } from '../lib/utils';

// --- Internal Types for APIs ---
interface CoinGeckoChartResponse {
  prices: [number, number][]; // [timestamp, price]
}

interface BinanceTradeStream {
  data: {
    s: string; // Symbol
    p: string; // Price
    q: string; // Quantity
    T: number; // Time
  }
}

export const useMarketStream = () => {
  const { 
    setBtcData, 
    setEthData, 
    setIsLoading, 
    setUsingFallback, 
    usingFallback 
  } = useMarketStore();

  // Refs for throttling
  const lastUpdateRef = useRef<number>(0);
  const THROTTLE_MS = 1000;

  // 1. Initial Data Fetch (CoinGecko)
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const [btcRes, ethRes] = await Promise.all([
          fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1'),
          fetch('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=1')
        ]);

        if (!btcRes.ok || !ethRes.ok) throw new Error("Rate Limit or API Error");

        const btcJson: CoinGeckoChartResponse = await btcRes.json();
        const ethJson: CoinGeckoChartResponse = await ethRes.json();

        const processHistory = (data: [number, number][]): any => {
          const fullHistory = data.map(([timestamp, price]) => ({
            timestamp,
            price,
            formattedTime: new Date(timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
          }));

          const zoomedHistory = fullHistory.slice(-50); // Keep last 50 points for zoom
          const currentPrice = fullHistory[fullHistory.length - 1].price;
          const prices = fullHistory.map(p => p.price);

          return {
            currentPrice,
            change24h: currentPrice - fullHistory[0].price,
            change24hPercent: ((currentPrice - fullHistory[0].price) / fullHistory[0].price) * 100,
            high24h: Math.max(...prices),
            low24h: Math.min(...prices),
            volume: "Real-time",
            history: zoomedHistory
          };
        };

        setBtcData(prev => ({ ...prev, ...processHistory(btcJson.prices) }));
        setEthData(prev => ({ ...prev, ...processHistory(ethJson.prices) }));
        setIsLoading(false);

      } catch (error) {
        console.warn("API Failed, using fallback data:", error);
        setUsingFallback(true);
        
        // Initialize with Mock Data
        setBtcData(prev => ({
          ...prev,
          currentPrice: 64000,
          change24h: 120,
          change24hPercent: 0.5,
          history: generateMockHistory(64000),
          volume: "Simulated"
        }));
        setEthData(prev => ({
          ...prev,
          currentPrice: 3400,
          change24h: -20,
          change24hPercent: -0.2,
          history: generateMockHistory(3400),
          volume: "Simulated"
        }));
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [setBtcData, setEthData, setIsLoading, setUsingFallback]);

  // 2. WebSocket Stream (Binance)
  useEffect(() => {
    if (usingFallback) return;

    const ws = new WebSocket('wss://stream.binance.com:9443/stream?streams=btcusdt@trade/ethusdt@trade');

    ws.onmessage = (event) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < THROTTLE_MS) return;
      lastUpdateRef.current = now;

      const message: BinanceTradeStream = JSON.parse(event.data);
      const { s: symbol, p: priceStr, T: time } = message.data;
      const price = parseFloat(priceStr);
      const formattedTime = formatChartTime(time);

      const updateMarketState = (prev: any) => {
        const newHistory = [...prev.history];
        if (newHistory.length >= 50) newHistory.shift();
        newHistory.push({ timestamp: time, price, formattedTime });
        
        return {
          ...prev,
          currentPrice: price,
          history: newHistory
        };
      };

      if (symbol === 'BTCUSDT') {
        setBtcData(updateMarketState);
      } else if (symbol === 'ETHUSDT') {
        setEthData(updateMarketState);
      }
    };

    return () => {
      ws.close();
    };
  }, [usingFallback, setBtcData, setEthData]);
};
