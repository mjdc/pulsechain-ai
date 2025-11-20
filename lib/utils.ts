import { PricePoint } from '../types';

/**
 * Generates simulated market history for fallback scenarios or demos.
 * Creates a random walk from a starting price.
 */
export const generateMockHistory = (startPrice: number, count: number = 50): PricePoint[] => {
  const history: PricePoint[] = [];
  let price = startPrice;
  const now = Date.now();
  
  for (let i = count; i >= 0; i--) {
    // Random walk with mean reversion tendency
    const volatility = startPrice * 0.002; // 0.2% volatility
    const change = (Math.random() - 0.5) * volatility;
    price = price + change;
    
    history.push({
      timestamp: now - i * 1000,
      price: price,
      formattedTime: new Date(now - i * 1000).toLocaleTimeString('en-US', { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    });
  }
  return history;
};

/**
 * Formats a generic timestamp into a readable time string for charts.
 */
export const formatChartTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};
