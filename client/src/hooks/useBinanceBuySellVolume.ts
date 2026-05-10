import { useState, useEffect, useCallback } from "react";

export interface BuySellVolumeData {
  buyVolumeBTC: number;
  buyVolumeUSD: number;
  sellVolumeBTC: number;
  sellVolumeUSD: number;
  buyPct: number;
  sellPct: number;
  totalVolumeBTC: number;
  totalVolumeUSD: number;
}

export function useBinanceBuySellVolume(symbol: string = "BTCUSDT") {
  const [volumeData, setVolumeData] = useState<BuySellVolumeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuySellVolume = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);

      // Fetch recent trades from Binance (limit 1000 for better accuracy)
      const response = await fetch(
        `https://api.binance.com/api/v3/trades?symbol=${symbol}&limit=1000`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const trades = await response.json();

      let buyVolumeBTC = 0;
      let buyVolumeUSD = 0;
      let sellVolumeBTC = 0;
      let sellVolumeUSD = 0;

      trades.forEach((trade: any) => {
        const qty = parseFloat(trade.qty);
        const price = parseFloat(trade.price);
        const tradeValue = qty * price;

        // In Binance API, isBuyerMaker indicates if the buyer was the maker
        // If isBuyerMaker is true, the seller was the taker (aggressive seller)
        // If isBuyerMaker is false, the buyer was the taker (aggressive buyer)
        if (trade.isBuyerMaker) {
          // Seller was aggressive
          sellVolumeBTC += qty;
          sellVolumeUSD += tradeValue;
        } else {
          // Buyer was aggressive
          buyVolumeBTC += qty;
          buyVolumeUSD += tradeValue;
        }
      });

      const totalVolumeBTC = buyVolumeBTC + sellVolumeBTC;
      const totalVolumeUSD = buyVolumeUSD + sellVolumeUSD;

      const data: BuySellVolumeData = {
        buyVolumeBTC,
        buyVolumeUSD: Math.round(buyVolumeUSD),
        sellVolumeBTC,
        sellVolumeUSD: Math.round(sellVolumeUSD),
        buyPct: totalVolumeUSD > 0 ? (buyVolumeUSD / totalVolumeUSD) * 100 : 50,
        sellPct: totalVolumeUSD > 0 ? (sellVolumeUSD / totalVolumeUSD) * 100 : 50,
        totalVolumeBTC,
        totalVolumeUSD: Math.round(totalVolumeUSD),
      };

      setVolumeData(data);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch buy/sell volume";
      console.error("Buy/sell volume error:", errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    fetchBuySellVolume();

    // Set up interval for periodic updates (every 60 seconds)
    const interval = setInterval(fetchBuySellVolume, 60000);

    return () => clearInterval(interval);
  }, [fetchBuySellVolume]);

  return { volumeData, loading, error, refetch: fetchBuySellVolume };
}
