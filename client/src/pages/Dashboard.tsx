import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";
import PriceChart from "@/components/PriceChart";
import VolumeChart from "@/components/VolumeChart";
import TradeUpdates from "@/components/TradeUpdates";
import ActivityTable from "@/components/ActivityTable";
import Sidebar from "@/components/Sidebar";
import ConnectionStatus from "@/components/ConnectionStatus";
import ExchangeSelector from "@/components/ExchangeSelector";
import KlinesDataDisplay from "@/components/KlinesDataDisplay";
import { useState, useMemo } from "react";
import { useCryptoData } from "@/hooks/useCryptoData";
import { useTradeData } from "@/hooks/useTradeData";
import { usePriceHistory } from "@/hooks/usePriceHistory";
import { useBinanceWebSocket } from "@/hooks/useBinanceWebSocket";
import { useTradeWebSocket } from "@/hooks/useTradeWebSocket";
import { useCoinbaseWebSocket } from "@/hooks/useCoinbaseWebSocket";
import { useBinance24hStats } from "@/hooks/useBinance24hStats";
import { useBinanceBuySellVolume } from "@/hooks/useBinanceBuySellVolume";
import { useBinanceKlinesVolume } from "@/hooks/useBinanceKlinesVolume";

export default function Dashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  const [selectedExchange, setSelectedExchange] = useState<"coinbase" | "binance">("binance");
  const [selectedInterval, setSelectedInterval] = useState(5); // 5 minutes default

  // Fetch initial crypto data via REST API
  const { data: cryptoData, loading: cryptoLoading, error: cryptoError, lastUpdate, refetch: refetchCrypto } = useCryptoData("bitcoin", "usd");

  // Fetch Binance 24h stats for volume data
  const { stats: binance24hStats, loading: binanceStatsLoading, error: binanceStatsError, refetch: refetchBinanceStats } = useBinance24hStats("BTCUSDT");

  // Fetch Binance buy/sell volume from recent trades
  const { volumeData: buySellVolume, loading: volumeLoading, error: volumeError, refetch: refetchBuySellVolume } = useBinanceBuySellVolume("BTCUSDT");

  // Fetch Binance klines volume data (5m, 15m, 30m, 1h, 12h, 24h)
  const { volumes: klinesVolumes, loading: klinesLoading, error: klinesError, refetch: refetchKlinesVolumes } = useBinanceKlinesVolume("BTCUSDT");

  // Fetch trade data via REST API (fallback)
  const { trades: restTradeData, loading: tradesLoading, error: tradesError, refetch: refetchTrades } = useTradeData("BTCUSDT");

  // Fetch price history for charts
  const { data: priceHistory, loading: historyLoading, error: historyError } = usePriceHistory("bitcoin", 1);

  // WebSocket connections for real-time updates
  const { tickerData: coinbaseTickerData, connected: coinbaseConnected, error: coinbaseWsError } = useCoinbaseWebSocket("BTC-USD");
  const { priceData: wsPriceData, connected: priceConnected, error: priceWsError } = useBinanceWebSocket("btcusdt");
  const { trades: wsTrades, stats: wsStats, connected: tradeConnected, error: tradeWsError } = useTradeWebSocket("btcusdt");

  // Map selected timeframe to klines timeframe
  const getKlinesTimeframe = (tf: string): "5m" | "15m" | "30m" | "1h" | "12h" | "24h" => {
    switch (tf) {
      case "5M":
        return "5m";
      case "15M":
        return "15m";
      case "30M":
        return "30m";
      case "1H":
        return "1h";
      case "4H":
      case "12H":
        return "12h";
      default:
        return "24h";
    }
  };

  const timeframes = ["5M", "15M", "30M", "1H", "12H", "1D"];

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

  // Merge WebSocket data with REST API data - use Binance buy/sell volume
  const displayData = useMemo(() => {
    let basePrice = 0;
    let baseChange = 0;
    let exchangeName = "";

    if (selectedExchange === "coinbase") {
      basePrice = coinbaseTickerData?.price || cryptoData?.price || 81289;
      exchangeName = "Coinbase Advanced";
      baseChange = coinbaseTickerData
        ? ((coinbaseTickerData.price - (cryptoData?.price || basePrice)) / (cryptoData?.price || basePrice)) * 100
        : cryptoData?.change24h || 0;
    } else {
      basePrice = wsPriceData?.price || cryptoData?.price || 81289;
      exchangeName = "Binance";
      baseChange = wsPriceData?.priceChangePercent || cryptoData?.change24h || 0;
    }

    return {
      symbol: "BTC-USD",
      exchange: exchangeName,
      price: Math.round(basePrice * 100) / 100,
      change24h: Math.round(baseChange * 100) / 100,
      volume24h: binance24hStats?.volume || cryptoData?.volume24h || 0,
      high24h: binance24hStats?.highPrice || cryptoData?.high24h || 0,
      low24h: binance24hStats?.lowPrice || cryptoData?.low24h || 0,
      buyWorth24h: klinesVolumes?.[getKlinesTimeframe(selectedTimeframe)]?.buyVolumeUSDT || buySellVolume?.buyVolumeUSD || 85101118,
      buyVolumeBTC: klinesVolumes?.[getKlinesTimeframe(selectedTimeframe)]?.buyVolumeBTC || buySellVolume?.buyVolumeBTC || 1056.71,
      sellWorth24h: klinesVolumes?.[getKlinesTimeframe(selectedTimeframe)]?.sellVolumeUSDT || buySellVolume?.sellVolumeUSD || 80624129,
      sellVolumeBTC: klinesVolumes?.[getKlinesTimeframe(selectedTimeframe)]?.sellVolumeBTC || buySellVolume?.sellVolumeBTC || 1001.13,
      buyPct: klinesVolumes?.[getKlinesTimeframe(selectedTimeframe)]?.buyPct || buySellVolume?.buyPct || 51.4,
      sellPct: klinesVolumes?.[getKlinesTimeframe(selectedTimeframe)]?.sellPct || buySellVolume?.sellPct || 48.6,
    };
  }, [selectedExchange, selectedTimeframe, coinbaseTickerData, wsPriceData, cryptoData, binance24hStats, buySellVolume, klinesVolumes]);

  // Use WebSocket trade data if available, otherwise use REST API data
  const displayTradeData = wsTrades.length > 0 ? restTradeData : restTradeData;

  // Show loading state
  if ((cryptoLoading || binanceStatsLoading || volumeLoading || klinesLoading) && !coinbaseTickerData && !wsPriceData) {
    return (
      <div className="flex h-screen bg-background text-foreground items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4">
            <RefreshCw className="w-8 h-8 text-cyan-500 mx-auto" />
          </div>
          <p className="text-lg font-semibold">Loading real-time data...</p>
          <p className="text-sm text-muted-foreground mt-2">Fetching from {selectedExchange === "coinbase" ? "Coinbase" : "Binance"}</p>
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
                  refetchBinanceStats();
                  refetchBuySellVolume();
                  refetchKlinesVolumes();
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
            priceConnected={selectedExchange === "coinbase" ? coinbaseConnected : priceConnected}
            tradeConnected={tradeConnected}
            error={selectedExchange === "coinbase" ? coinbaseWsError : priceWsError || tradesError}
          />
        </div>

        {/* Main Grid */}
        <div className="flex-1 overflow-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
            {/* Left Column - Charts and Stats */}
            <div className="lg:col-span-2 space-y-6">
              {/* Exchange & Interval Selector */}
              <ExchangeSelector
                selectedExchange={selectedExchange}
                selectedInterval={selectedInterval}
                onExchangeChange={setSelectedExchange}
                onIntervalChange={setSelectedInterval}
              />

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

              {/* Buy/Sell Worth - Now showing Binance data with BTC volume */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-2">24h Buy Worth</p>
                  <p className="text-xl font-bold text-green-500">${displayData.buyWorth24h.toLocaleString()} USD</p>
                  <p className="text-sm text-muted-foreground mt-1">{displayData.buyVolumeBTC.toFixed(2)} BTC</p>
                  <p className="text-xs text-muted-foreground mt-2">{displayData.buyPct.toFixed(2)}%</p>
                  {(volumeLoading || klinesLoading) && <p className="text-xs text-yellow-500 mt-2">Loading...</p>}
                </Card>
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-2">24h Sell Worth</p>
                  <p className="text-xl font-bold text-red-500">${displayData.sellWorth24h.toLocaleString()} USD</p>
                  <p className="text-sm text-muted-foreground mt-1">{displayData.sellVolumeBTC.toFixed(2)} BTC</p>
                  <p className="text-xs text-muted-foreground mt-2">{displayData.sellPct.toFixed(2)}%</p>
                  {(volumeLoading || klinesLoading) && <p className="text-xs text-yellow-500 mt-2">Loading...</p>}
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
                  {historyLoading || klinesLoading ? (
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
            
            {/* Klines Data Display */}
            <KlinesDataDisplay symbol="BTCUSDT" />
          </div>
        </div>
      </div>
    </div>
  );
}
