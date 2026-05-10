import { useState, useEffect, useCallback } from "react";

export interface Binance24hStats {
  symbol: string;
  priceChange: number;
  priceChangePercent: number;
  weightedAvgPrice: number;
  prevClosePrice: number;
  lastPrice: number;
  lastQty: number;
  bidPrice: number;
  bidQty: number;
  askPrice: number;
  askQty: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number; // Volume in base asset (BTC)
  quoteAssetVolume: number; // Volume in quote asset (USD)
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

export function useBinance24hStats(symbol: string = "BTCUSDT") {
  const [stats, setStats] = useState<Binance24hStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      const stats: Binance24hStats = {
        symbol: data.symbol,
        priceChange: parseFloat(data.priceChange),
        priceChangePercent: parseFloat(data.priceChangePercent),
        weightedAvgPrice: parseFloat(data.weightedAvgPrice),
        prevClosePrice: parseFloat(data.prevClosePrice),
        lastPrice: parseFloat(data.lastPrice),
        lastQty: parseFloat(data.lastQty),
        bidPrice: parseFloat(data.bidPrice),
        bidQty: parseFloat(data.bidQty),
        askPrice: parseFloat(data.askPrice),
        askQty: parseFloat(data.askQty),
        openPrice: parseFloat(data.openPrice),
        highPrice: parseFloat(data.highPrice),
        lowPrice: parseFloat(data.lowPrice),
        volume: parseFloat(data.volume), // BTC volume
        quoteAssetVolume: parseFloat(data.quoteAssetVolume), // USD volume
        openTime: data.openTime,
        closeTime: data.closeTime,
        firstId: data.firstId,
        lastId: data.lastId,
        count: data.count,
      };

      setStats(stats);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch Binance 24h stats";
      console.error("Binance 24h stats error:", errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchStats();

    // Set up interval for periodic updates (every 60 seconds by default)
    const interval = setInterval(fetchStats, 60000);

    return () => clearInterval(interval);
  }, [fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
}
