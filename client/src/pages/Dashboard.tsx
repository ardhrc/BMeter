import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, TrendingUp, TrendingDown, Activity, BarChart3, RefreshCw, AlertCircle, Zap } from "lucide-react";
import PriceChart from "@/components/PriceChart";
import VolumeChart from "@/components/VolumeChart";
import TradeUpdates from "@/components/TradeUpdates";
import ActivityTable from "@/components/ActivityTable";
import Sidebar from "@/components/Sidebar";
import ConnectionStatus from "@/components/ConnectionStatus";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useTradeData } from "@/hooks/useTradeData";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";
import { useTradeWebSocket } from "@/hooks/useTradeWebSocket";
import { useCoinbaseTradeData } from "@/hooks/useCoinbaseTradeData";
import { useCoinbaseWebSocket } from "@/hooks/useCoinbaseWebSocket";

export default function Dashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  
  // Fetch initial crypto data via REST API
  const { data: cryptoData, loading: cryptoLoading, error: cryptoError, lastUpdate, refetch: refetchCrypto } = useCryptoData("bitcoin", "usd");
  
  // Fetch Coinbase trade data for accurate buy/sell volumes
  const { stats: coinbaseStats, loading: coinbaseLoading, error: coinbaseError, refetch: refetchCoinbaseStats } = useCoinbaseTradeData("BTC-USD");
  
  // Fetch trade data via REST API (fallback)
  const { trades: restTradeData, loading: tradesLoading, error: tradesError, refetch: refetchTrades } = useTradeData("BTCUSDT");
  
  // Fetch price history for charts
  const { data: priceHistory, loading: historyLoading, error: historyError } = usePriceHistory("bitcoin", 1);

  // WebSocket connections for real-time updates
  const { tickerData: coinbaseTickerData, connected: coinbaseConnected, error: coinbaseWsError } = useCoinbaseWebSocket("BTC-USD");
  const { priceData: wsPriceData, connected: priceConnected, error: priceWsError } = useBinanceWebSocket("btcusdt");
  const { trades: wsTrades, stats: wsStats, connected: tradeConnected, error: tradeWsError } = useTradeWebSocket("btcusdt");

  const timeframes = ["1M", "5M", "15M", "30M", "1H", "4H", "1D"];

  // Mock large activity data
  const largeActivityData = [
    { quantity: 366.680, total: 39344815, side: "BUY" as const, exchange: "Kraken", date: "03 Nov 2025" },
    { quantity: 201.779, total: 14124556, side: "SELL" as const, exchange: "OKX", date: "05 Feb 2026" },
    { quantity: 171.521, total: 11707471, side: "SELL" as const, exchange: "Coinbase Advanced", date: "03 Mar 2026" },
    { quantity: 166.480, total: 15416068, side: "BUY" as const, exchange: "OKX", date: "19 Jan 2026" },
    { quantity: 161.669, total: 17961398, side: "BUY" as const, exchange: "Coinbase Advanced", date: "16 Oct 2025" },
    { quantity: 156.589, total: 10859417, side: "BUY" as const, exchange: "Coinbase Advanced", date: "10 Mar 2026" },
    { quantity: 150.000, total: 13050000, side: "SELL" as const, exchange: "Kraken", date: "20 Nov 2025" },
    { quantity: 148.463, total: 12850228, side: "BUY" as const, exchange: "Coinbase Advanced", date: "16 Dec 2025" },
  ];

  // Merge WebSocket data with REST API data - prioritize Coinbase data for volumes
  const displayData = useMemo(() => {
    const basePrice = coinbaseTickerData?.price || wsPriceData?.price || cryptoData?.price || 81289;
    const baseChange = coinbaseTickerData ? 
      ((coinbaseTickerData.price - (cryptoData?.price || basePrice)) / (cryptoData?.price || basePrice)) * 100 
      : (wsPriceData?.priceChangePercent || cryptoData?.change24h || 3.10);

    return {
      symbol: "BTC-USD",
      exchange: "Coinbase Advanced",
      price: Math.round(basePrice * 100) / 100,
      change24h: Math.round(baseChange * 100) / 100,
      volume24h: coinbaseStats?.totalVolume24h || cryptoData?.volume24h || 770152504,
      high24h: cryptoData?.high24h || 81932,
      low24h: cryptoData?.low24h || 78491,
      buyWorth24h: coinbaseStats?.buyWorth24h || 102810253,
      sellWorth24h: coinbaseStats?.sellWorth24h || 109599142,
      buyPct: coinbaseStats?.buyPct || 48.39,
      sellPct: coinbaseStats?.sellPct || 51.61,
    };
  }, [coinbaseTickerData, wsPriceData, cryptoData, coinbaseStats]);

  // Use WebSocket trade data if available, otherwise use REST API data
  const displayTradeData = wsTrades.length > 0 ? restTradeData : restTradeData;

  // Show loading state
  if ((cryptoLoading || coinbaseLoading) && !coinbaseTickerData && !wsPriceData) {
    return (
      <div className="flex h-screen bg-background text-foreground items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <RefreshCw className="w-8 h-8 text-cyan-500 mx-auto" />
          </div>
          <p className="text-lg font-semibold">Loading real-time data...</p>
          <p className="text-sm text-muted-foreground mt-2">Connecting to Coinbase API</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (cryptoError && !cryptoData && !coinbaseTickerData && !wsPriceData) {
    return (
      <div className="flex h-screen bg-background text-foreground items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-lg font-semibold mb-2">Failed to Load Data</p>
          <p className="text-sm text-muted-foreground mb-4">{cryptoError}</p>
          <Button onClick={refetchCrypto} variant="default">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-3xl font-bold">${displayData.price.toLocaleString()}</h1>
              <p className="text-sm text-muted-foreground">{displayData.symbol} ({displayData.exchange})</p>
              {lastUpdate && (
                <p className="text-xs text-muted-foreground mt-1">
                  Updated: {lastUpdate.toLocaleTimeString()}
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-lg font-semibold ${displayData.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                {displayData.change24h >= 0 ? "+" : ""}{displayData.change24h.toFixed(2)}%
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  refetchCrypto();
                  refetchCoinbaseStats();
                }}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Connection Status */}
          <ConnectionStatus 
            priceConnected={coinbaseConnected || priceConnected} 
            tradeConnected={tradeConnected}
            error={coinbaseWsError || priceWsError || tradesError}
          />
        </div>

        {/* Main Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Charts and Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-1">24h Change</p>
                  <p className={`text-lg font-bold ${displayData.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {displayData.change24h >= 0 ? "+" : ""}{displayData.change24h.toFixed(2)}%
                  </p>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
                  <p className="text-lg font-bold">${(displayData.volume24h / 1e9).toFixed(2)}B</p>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-1">24h High</p>
                  <p className="text-lg font-bold">${displayData.high24h.toLocaleString()}</p>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-1">24h Low</p>
                  <p className="text-lg font-bold">${displayData.low24h.toLocaleString()}</p>
                </Card>
              </div>

              {/* Buy/Sell Worth - Now showing Coinbase data */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-2">24h Buy Worth</p>
                  <p className="text-xl font-bold text-green-500">${(displayData.buyWorth24h / 1e6).toFixed(0)}M</p>
                  <p className="text-xs text-muted-foreground mt-1">{displayData.buyPct.toFixed(2)}%</p>
                  {coinbaseLoading && <p className="text-xs text-yellow-500 mt-2">Loading Coinbase data...</p>}
                </Card>
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-2">24h Sell Worth</p>
                  <p className="text-xl font-bold text-red-500">${(displayData.sellWorth24h / 1e6).toFixed(0)}M</p>
                  <p className="text-xs text-muted-foreground mt-1">{displayData.sellPct.toFixed(2)}%</p>
                  {coinbaseLoading && <p className="text-xs text-yellow-500 mt-2">Loading Coinbase data...</p>}
                </Card>
              </div>

              {/* Charts */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Price & Volume</h2>
                    <div className="flex gap-2">
                      {timeframes.map((tf) => (
                        <Button
                          key={tf}
                          variant={selectedTimeframe === tf ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedTimeframe(tf)}
                        >
                          {tf}
                        </Button>
                      ))}
                    </div>
                  </div>
                  {historyLoading ? (
                    <Card className="p-8 bg-card border-border text-center">
                      <p className="text-muted-foreground">Loading chart data...</p>
                    </Card>
                  ) : historyError ? (
                    <Card className="p-8 bg-card border-border text-center">
                      <p className="text-red-500 text-sm">{historyError}</p>
                    </Card>
                  ) : (
                    <PriceChart timeframe={selectedTimeframe} data={priceHistory} />
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Net Volume</h2>
                  {historyLoading ? (
                    <Card className="p-8 bg-card border-border text-center">
                      <p className="text-muted-foreground">Loading volume data...</p>
                    </Card>
                  ) : (
                    <VolumeChart timeframe={selectedTimeframe} data={priceHistory} />
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Live Trades */}
            <div>
              {tradesLoading && displayTradeData.length === 0 ? (
                <Card className="bg-card border-border p-4 h-full flex items-center justify-center">
                  <p className="text-muted-foreground">Loading trade data...</p>
                </Card>
              ) : tradesError && displayTradeData.length === 0 ? (
                <Card className="bg-card border-border p-4">
                  <p className="text-red-500 text-sm">{tradesError}</p>
                </Card>
              ) : (
                <TradeUpdates trades={displayTradeData} wsActive={tradeConnected} />
              )}
            </div>
          </div>

          {/* Activity Tables */}
          <div className="px-6 pb-6 space-y-6">
            <ActivityTable title="Large Activity" subtitle="Filtered by potentially whale trades" data={largeActivityData} />
          </div>
        </div>
      </div>
    </div>
  );
}
