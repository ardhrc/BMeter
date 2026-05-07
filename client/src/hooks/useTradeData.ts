import { useState, useEffect, useCallback } from "react";

export interface TradeData {
  timeframe: string;
  bought: number;
  sold: number;
  buyUSD: number;
  sellUSD: number;
  buyPct: number;
  sellPct: number;
}

export function useTradeData(symbol: string = "BTCUSDT") {
  const [trades, setTrades] = useState<TradeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTradeData = useCallback(async () => {
    try {
      setError(null);

      // Fetch recent trades from Binance API
      const response = await fetch(
        `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=100`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const trades = await response.json();

      // Process trades into timeframe buckets
      const now = Date.now();
      const timeframes = [
        { label: "1 Minute", ms: 60 * 1000 },
        { label: "5 Minute", ms: 5 * 60 * 1000 },
        { label: "15 Minutes", ms: 15 * 60 * 1000 },
        { label: "30 Minute", ms: 30 * 60 * 1000 },
        { label: "1 Hour", ms: 60 * 60 * 1000 },
        { label: "24 Hour", ms: 24 * 60 * 60 * 1000 },
      ];

      const processedTrades: TradeData[] = timeframes.map((tf) => {
        const relevantTrades = trades.filter(
          (t: any) => now - t.time < tf.ms
        );

        const buyTrades = relevantTrades.filter((t: any) => t.isBuyerMaker === false);
        const sellTrades = relevantTrades.filter((t: any) => t.isBuyerMaker === true);

        const buyQty = buyTrades.reduce((sum: number, t: any) => sum + parseFloat(t.qty), 0);
        const sellQty = sellTrades.reduce((sum: number, t: any) => sum + parseFloat(t.qty), 0);

        const buyUSD = buyTrades.reduce(
          (sum: number, t: any) => sum + parseFloat(t.qty) * parseFloat(t.price),
          0
        );
        const sellUSD = sellTrades.reduce(
          (sum: number, t: any) => sum + parseFloat(t.qty) * parseFloat(t.price),
          0
        );

        const totalQty = buyQty + sellQty;
        const totalUSD = buyUSD + sellUSD;

        return {
          timeframe: tf.label,
          bought: buyQty,
          sold: sellQty,
          buyUSD,
          sellUSD,
          buyPct: totalQty > 0 ? (buyQty / totalQty) * 100 : 50,
          sellPct: totalQty > 0 ? (sellQty / totalQty) * 100 : 50,
        };
      });

      setTrades(processedTrades.reverse()); // Show 24h first
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch trade data";
      setError(errorMessage);
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    // Initial fetch
    fetchTradeData();

    // Set up interval for periodic updates (every 10 seconds)
    const interval = setInterval(fetchTradeData, 10000);

    return () => clearInterval(interval);
  }, [fetchTradeData]);

  return { trades, loading, error, refetch: fetchTradeData };
}
