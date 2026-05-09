import { useState, useEffect, useCallback } from "react";

export interface CoinbaseTradeStats {
  buyWorth24h: number;
  sellWorth24h: number;
  buyPct: number;
  sellPct: number;
  buyVolume24h: number;
  sellVolume24h: number;
  totalVolume24h: number;
}

export function useCoinbaseTradeData(productId: string = "BTC-USD") {
  const [stats, setStats] = useState<CoinbaseTradeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTradeStats = useCallback(async () => {
    try {
      setError(null);

      // Fetch recent trades from Coinbase API
      // Note: Coinbase API has a limit of 300 trades per request
      const response = await fetch(
        `https://api.exchange.coinbase.com/products/${productId}/trades?limit=300`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const trades = await response.json();

      // Calculate buy/sell volumes from trade data
      let buyVolume = 0;
      let sellVolume = 0;
      let buyWorth = 0;
      let sellWorth = 0;

      trades.forEach((trade: any) => {
        const tradeValue = parseFloat(trade.price) * parseFloat(trade.size);

        // In Coinbase API, side is "buy" or "sell"
        // "buy" means the taker was buying (aggressive buyer)
        // "sell" means the taker was selling (aggressive seller)
        if (trade.side === "buy") {
          buyVolume += parseFloat(trade.size);
          buyWorth += tradeValue;
        } else {
          sellVolume += parseFloat(trade.size);
          sellWorth += tradeValue;
        }
      });

      const totalVolume = buyVolume + sellVolume;
      const totalWorth = buyWorth + sellWorth;

      const tradeStats: CoinbaseTradeStats = {
        buyWorth24h: Math.round(buyWorth),
        sellWorth24h: Math.round(sellWorth),
        buyPct: totalWorth > 0 ? (buyWorth / totalWorth) * 100 : 50,
        sellPct: totalWorth > 0 ? (sellWorth / totalWorth) * 100 : 50,
        buyVolume24h: buyVolume,
        sellVolume24h: sellVolume,
        totalVolume24h: totalVolume,
      };

      setStats(tradeStats);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch Coinbase trade data";
      console.error("Coinbase trade data error:", errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchTradeStats();

    // Set up interval for periodic updates (every 60 seconds for trade data)
    const interval = setInterval(fetchTradeStats, 60000);

    return () => clearInterval(interval);
  }, [fetchTradeStats]);

  return { stats, loading, error, refetch: fetchTradeStats };
}
