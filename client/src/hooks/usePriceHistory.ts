import { useState, useEffect, useCallback } from "react";

export interface PricePoint {
  time: string;
  price: number;
  volume: number;
}

export function usePriceHistory(coinId: string = "bitcoin", days: number = 1) {
  const [data, setData] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPriceHistory = useCallback(async () => {
    try {
      setError(null);

      // Fetch historical data from CoinGecko
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=hourly`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const apiData = await response.json();
      const prices = apiData.prices || [];
      const volumes = apiData.total_volumes || [];

      // Transform data to chart format
      const chartData: PricePoint[] = prices.map((pricePoint: [number, number], idx: number) => {
        const date = new Date(pricePoint[0]);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const timeStr = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

        return {
          time: timeStr,
          price: Math.round(pricePoint[1] * 100) / 100,
          volume: volumes[idx] ? Math.round(volumes[idx][1]) : 0,
        };
      });

      // Limit to last 24 points for better chart readability
      const limitedData = chartData.slice(-24);
      setData(limitedData);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch price history";
      setError(errorMessage);
      setLoading(false);
    }
  }, [coinId, days]);

  useEffect(() => {
    fetchPriceHistory();
  }, [fetchPriceHistory]);

  return { data, loading, error, refetch: fetchPriceHistory };
}
