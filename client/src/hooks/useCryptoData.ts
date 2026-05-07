import { useState, useEffect, useCallback } from "react";

export interface CryptoData {
  symbol: string;
  exchange: string;
  price: number;
  change24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  marketCap: number;
  circulatingSupply: number;
  totalSupply: number;
  allTimeHigh: number;
  downFromATH: number;
  oneHourChange: number;
  sevenDayChange: number;
  thirtyDayChange: number;
  buyWorth24h: number;
  sellWorth24h: number;
  buyPct: number;
  sellPct: number;
}

export function useCryptoData(coinId: string = "bitcoin", vsCurrency: string = "usd") {
  const [data, setData] = useState<CryptoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchCryptoData = useCallback(async () => {
    try {
      setError(null);
      
      // Fetch data from CoinGecko API
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}?vs_currency=${vsCurrency}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const apiData = await response.json();

      // Transform API data to our format
      const price = apiData.market_data?.current_price?.[vsCurrency] || 0;
      const change24h = apiData.market_data?.price_change_percentage_24h || 0;
      const volume24h = apiData.market_data?.total_volume?.[vsCurrency] || 0;
      const high24h = apiData.market_data?.high_24h?.[vsCurrency] || 0;
      const low24h = apiData.market_data?.low_24h?.[vsCurrency] || 0;
      const marketCap = apiData.market_data?.market_cap?.[vsCurrency] || 0;
      const circulatingSupply = apiData.market_data?.circulating_supply || 0;
      const totalSupply = apiData.market_data?.total_supply || 0;
      const allTimeHigh = apiData.market_data?.ath?.[vsCurrency] || 0;
      const oneHourChange = apiData.market_data?.price_change_percentage_1h_in_currency?.[vsCurrency] || 0;
      const sevenDayChange = apiData.market_data?.price_change_percentage_7d || 0;
      const thirtyDayChange = apiData.market_data?.price_change_percentage_30d || 0;

      // Calculate ATH difference
      const downFromATH = allTimeHigh > 0 ? ((allTimeHigh - price) / allTimeHigh) * 100 : 0;

      // Generate realistic buy/sell distribution (simulated based on market momentum)
      const buyPct = 50 + (change24h * 2); // More buys when price is up
      const sellPct = 100 - buyPct;
      const buyWorth24h = (volume24h * (buyPct / 100)) * 0.6; // 60% of volume is buy worth
      const sellWorth24h = (volume24h * (sellPct / 100)) * 0.4; // 40% of volume is sell worth

      const transformedData: CryptoData = {
        symbol: `${apiData.symbol?.toUpperCase() || "BTC"}-${vsCurrency.toUpperCase()}`,
        exchange: "Multiple Exchanges",
        price: Math.round(price * 100) / 100,
        change24h: Math.round(change24h * 100) / 100,
        volume24h: Math.round(volume24h),
        high24h: Math.round(high24h * 100) / 100,
        low24h: Math.round(low24h * 100) / 100,
        marketCap: Math.round(marketCap),
        circulatingSupply: Math.round(circulatingSupply),
        totalSupply: Math.round(totalSupply),
        allTimeHigh: Math.round(allTimeHigh * 100) / 100,
        downFromATH: Math.round(downFromATH * 100) / 100,
        oneHourChange: Math.round(oneHourChange * 100) / 100,
        sevenDayChange: Math.round(sevenDayChange * 100) / 100,
        thirtyDayChange: Math.round(thirtyDayChange * 100) / 100,
        buyWorth24h: Math.round(buyWorth24h),
        sellWorth24h: Math.round(sellWorth24h),
        buyPct: Math.round(buyPct * 100) / 100,
        sellPct: Math.round(sellPct * 100) / 100,
      };

      setData(transformedData);
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch crypto data";
      setError(errorMessage);
      setLoading(false);
    }
  }, [coinId, vsCurrency]);

  useEffect(() => {
    // Initial fetch
    fetchCryptoData();

    // Set up interval for periodic updates (every 30 seconds)
    const interval = setInterval(fetchCryptoData, 30000);

    return () => clearInterval(interval);
  }, [fetchCryptoData]);

  return { data, loading, error, lastUpdate, refetch: fetchCryptoData };
}
