import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, TrendingUp, TrendingDown, Activity, BarChart3 } from "lucide-react";
import PriceChart from "@/components/PriceChart";
import VolumeChart from "@/components/VolumeChart";
import TradeUpdates from "@/components/TradeUpdates";
import ActivityTable from "@/components/ActivityTable";
import Sidebar from "@/components/Sidebar";

export default function Dashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState("1D");
  
  // Mock data for BTC/USD
  const cryptoData = {
    symbol: "BTC-USD",
    exchange: "Coinbase Advanced",
    price: 81289,
    change24h: 3.10,
    volume24h: 770152504,
    high24h: 81932,
    low24h: 78491,
    buyWorth24h: 453952030,
    sellWorth24h: 311289752,
    buyVolume24h: 5653.33,
    sellVolume24h: 3882.94,
    buyPct: 59.28,
    sellPct: 40.72,
    marketBuy: 65.00,
    marketSell: 29.18,
    totalSupply: "21M",
    circulatingSupply: "20M",
    allTimeHigh: 126296,
    downFromATH: 35.64,
    oneHourChange: 0.35,
    sevenDayChange: 6.54,
    thirtyDayChange: 17.83,
  };

  const timeframes = ["1M", "5M", "15M", "30M", "1H", "4H", "1D"];

  const tradeData = [
    { timeframe: "24 Hour", bought: 5653.33, sold: 3882.94, buyUSD: 453952030, sellUSD: 311289752, buyPct: 59.28, sellPct: 40.72 },
    { timeframe: "1 Hour", bought: 225.88, sold: 180.18, buyUSD: 18341420, sellUSD: 14633695, buyPct: 55.63, sellPct: 44.37 },
    { timeframe: "30 Minute", bought: 117.33, sold: 127.43, buyUSD: 9535849, sellUSD: 10354734, buyPct: 47.94, sellPct: 52.06 },
    { timeframe: "15 Minutes", bought: 56.02, sold: 23.74, buyUSD: 4553507, sellUSD: 1929741, buyPct: 70.24, sellPct: 29.76 },
    { timeframe: "5 Minute", bought: 9.25, sold: 3.72, buyUSD: 751978.89, sellUSD: 302424.85, buyPct: 71.32, sellPct: 28.68 },
    { timeframe: "1 Minute", bought: 0.19, sold: 0.46, buyUSD: 15504.89, sellUSD: 37789.73, buyPct: 29.09, sellPct: 70.91 },
  ];

  const largeActivityData: Array<{ quantity: number; total: number; side: "BUY" | "SELL"; exchange: string; date: string }> = [
    { quantity: 366.680, total: 39344815, side: "BUY", exchange: "Kraken", date: "03 Nov 2025" },
    { quantity: 201.779, total: 14124556, side: "SELL", exchange: "OKX", date: "05 Feb 2026" },
    { quantity: 171.521, total: 11707471, side: "SELL", exchange: "Coinbase Advanced", date: "03 Mar 2026" },
    { quantity: 166.480, total: 15416068, side: "BUY", exchange: "OKX", date: "19 Jan 2026" },
    { quantity: 161.669, total: 17961398, side: "BUY", exchange: "Coinbase Advanced", date: "16 Oct 2025" },
    { quantity: 156.589, total: 10859417, side: "BUY", exchange: "Coinbase Advanced", date: "10 Mar 2026" },
    { quantity: 150.000, total: 13050000, side: "SELL", exchange: "Kraken", date: "20 Nov 2025" },
    { quantity: 148.463, total: 12850228, side: "BUY", exchange: "Coinbase Advanced", date: "16 Dec 2025" },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{cryptoData.price.toLocaleString()}</h1>
              <p className="text-sm text-muted-foreground">{cryptoData.symbol} ({cryptoData.exchange})</p>
            </div>
            <div className="flex items-center gap-4">
              <div className={`text-lg font-semibold ${cryptoData.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                {cryptoData.change24h >= 0 ? "+" : ""}{cryptoData.change24h.toFixed(2)}%
              </div>
              <Button variant="outline" size="sm">Live Order Book</Button>
            </div>
          </div>
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
                  <p className={`text-lg font-bold ${cryptoData.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                    {cryptoData.change24h >= 0 ? "+" : ""}{cryptoData.change24h.toFixed(2)}%
                  </p>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-1">24h Volume</p>
                  <p className="text-lg font-bold">${(cryptoData.volume24h / 1e9).toFixed(2)}B</p>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-1">24h High</p>
                  <p className="text-lg font-bold">${cryptoData.high24h.toLocaleString()}</p>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-1">24h Low</p>
                  <p className="text-lg font-bold">${cryptoData.low24h.toLocaleString()}</p>
                </Card>
              </div>

              {/* Buy/Sell Worth */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-2">24h Buy Worth</p>
                  <p className="text-xl font-bold text-green-500">${(cryptoData.buyWorth24h / 1e6).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground mt-1">{cryptoData.buyPct}%</p>
                </Card>
                <Card className="p-4 bg-card border-border">
                  <p className="text-xs text-muted-foreground mb-2">24h Sell Worth</p>
                  <p className="text-xl font-bold text-red-500">${(cryptoData.sellWorth24h / 1e6).toFixed(1)}M</p>
                  <p className="text-xs text-muted-foreground mt-1">{cryptoData.sellPct}%</p>
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
                  <PriceChart timeframe={selectedTimeframe} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold mb-4">Net Volume</h2>
                  <VolumeChart timeframe={selectedTimeframe} />
                </div>
              </div>
            </div>

            {/* Right Column - Live Trades */}
            <div>
              <TradeUpdates trades={tradeData} />
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
