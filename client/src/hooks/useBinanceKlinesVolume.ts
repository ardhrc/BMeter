import { useState, useEffect, useCallback } from "react";

export interface KlineVolumeData {
  timeframe: "5m" | "15m" | "30m" | "1h" | "12h" | "24h";
  buyVolumeBTC: number;
  buyVolumeUSDT: number;
  sellVolumeBTC: number;
  sellVolumeUSDT: number;
  buyPct: number;
  sellPct: number;
}

export interface AllKlineVolumes {
  "5m": KlineVolumeData;
  "15m": KlineVolumeData;
  "30m": KlineVolumeData;
  "1h": KlineVolumeData;
  "12h": KlineVolumeData;
  "24h": KlineVolumeData;
}

export function useBinanceKlinesVolume(symbol: string = "BTCUSDT") {
  const [volumes, setVolumes] = useState<AllKlineVolumes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKlinesVolume = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch 288 candles of 5m interval (24 hours)
      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=288`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const klines = await response.json();

      // Helper function to calculate volumes for a given number of candles
      const calculateVolumes = (candles: any[]): KlineVolumeData => {
        let buyVolumeBTC = 0;
        let buyVolumeUSDT = 0;
        let sellVolumeBTC = 0;
        let sellVolumeUSDT = 0;

        candles.forEach((kline: any[]) => {
          // Correct indices according to Binance klines format:
          // [5] = Base asset volume (BTC)
          // [7] = Quote asset volume (USDT)
          // [9] = Taker buy base asset volume (BTC)
          // [10] = Taker buy quote asset volume (USDT)

          const totalVolumeBTC = parseFloat(kline[7]); // index 7 is quote asset volume
          const totalVolumeUSDT = parseFloat(kline[7]); // index 7 is quote asset volume
          const buyVolumeBTCKline = parseFloat(kline[9]); // index 9 is taker buy base volume
          const buyVolumeUSDTKline = parseFloat(kline[10]); // index 10 is taker buy quote volume

          // Calculate sell volumes
          const sellVolumeBTCKline = totalVolumeBTC - buyVolumeBTCKline;
          const sellVolumeUSDTKline = totalVolumeUSDT - buyVolumeUSDTKline;

          buyVolumeBTC += buyVolumeBTCKline;
          buyVolumeUSDT += buyVolumeUSDTKline;
          sellVolumeBTC += sellVolumeBTCKline;
          sellVolumeUSDT += sellVolumeUSDTKline;
        });

        const totalUSDT = buyVolumeUSDT + sellVolumeUSDT;
        const buyPct = totalUSDT > 0 ? (buyVolumeUSDT / totalUSDT) * 100 : 50;
        const sellPct = totalUSDT > 0 ? (sellVolumeUSDT / totalUSDT) * 100 : 50;

        return {
          timeframe: "24h",
          buyVolumeBTC: Math.round(buyVolumeBTC * 100) / 100,
          buyVolumeUSDT: Math.round(buyVolumeUSDT),
          sellVolumeBTC: Math.round(sellVolumeBTC * 100) / 100,
          sellVolumeUSDT: Math.round(sellVolumeUSDT),
          buyPct,
          sellPct,
        };
      };

      // Calculate volumes for each timeframe
      const allVolumes: AllKlineVolumes = {
        "5m": {
          ...calculateVolumes(klines.slice(-1)),
          timeframe: "5m",
        },
        "15m": {
          ...calculateVolumes(klines.slice(-3)),
          timeframe: "15m",
        },
        "30m": {
          ...calculateVolumes(klines.slice(-6)),
          timeframe: "30m",
        },
        "1h": {
          ...calculateVolumes(klines.slice(-12)),
          timeframe: "1h",
        },
        "12h": {
          ...calculateVolumes(klines.slice(-144)),
          timeframe: "12h",
        },
        "24h": {
          ...calculateVolumes(klines),
          timeframe: "24h",
        },
      };

      setVolumes(allVolumes);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch klines volume";
      console.error("Klines volume error:", errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchKlinesVolume();

    // Set up interval for periodic updates (every 5 minutes to match candle interval)
    const interval = setInterval(fetchKlinesVolume, 300000);

    return () => clearInterval(interval);
  }, [fetchKlinesVolume]);

  return { volumes, loading, error, refetch: fetchKlinesVolume };
}
