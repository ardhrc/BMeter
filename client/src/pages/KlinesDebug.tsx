import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volumeBTC: string;
  closeTime: number;
  volumeUSDT: string;
  trades: number;
  buyVolumeBTC: string;
  buyVolumeUSDT: string;
  ignore: string;
}

export default function KlinesDebug() {
  const [klines, setKlines] = useState<KlineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [, setLocation] = useLocation();

  const fetchKlines = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(
        "https://api.binance.com/api/v3/klines?symbol=BTCUSDT&interval=5m&limit=288"
      );

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();

      const formattedKlines: KlineData[] = data.map((kline: any[]) => ({
        openTime: kline[0],
        open: kline[1],
        high: kline[2],
        low: kline[3],
        close: kline[4],
        volumeBTC: kline[7], // Index 7: Quote asset volume (USDT)
        closeTime: kline[6],
        volumeUSDT: kline[7], // Index 7: Quote asset volume (USDT)
        trades: kline[8],
        buyVolumeBTC: kline[9], // Index 9: Taker buy base asset volume
        buyVolumeUSDT: kline[10], // Index 10: Taker buy quote asset volume
        ignore: kline[11],
      }));

      setKlines(formattedKlines);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch klines";
      console.error("Klines fetch error:", errorMessage);
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKlines();
  }, []);

  // Calculate aggregated volumes
  const calculateAggregates = () => {
    if (klines.length === 0) return null;

    const calculateVolume = (candles: KlineData[]) => {
      let buyVolumeBTC = 0;
      let buyVolumeUSDT = 0;
      let sellVolumeBTC = 0;
      let sellVolumeUSDT = 0;

      candles.forEach((k) => {
        const totalVolumeBTC = parseFloat(k.volumeBTC);
        const totalVolumeUSDT = parseFloat(k.volumeUSDT);
        const buyBTC = parseFloat(k.buyVolumeBTC);
        const buyUSDT = parseFloat(k.buyVolumeUSDT);

        buyVolumeBTC += buyBTC;
        buyVolumeUSDT += buyUSDT;
        sellVolumeBTC += totalVolumeBTC - buyBTC;
        sellVolumeUSDT += totalVolumeUSDT - buyUSDT;
      });

      return { buyVolumeBTC, buyVolumeUSDT, sellVolumeBTC, sellVolumeUSDT };
    };

    return {
      "5m": calculateVolume(klines.slice(-1)),
      "15m": calculateVolume(klines.slice(-3)),
      "30m": calculateVolume(klines.slice(-6)),
      "1h": calculateVolume(klines.slice(-12)),
      "12h": calculateVolume(klines.slice(-144)),
      "24h": calculateVolume(klines),
    };
  };

  const aggregates = calculateAggregates();

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation("/")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold">Klines Debug Data</h1>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchKlines}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
        </div>

        {/* Aggregates Summary */}
        {aggregates && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Volume Aggregates</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(aggregates).map(([timeframe, volumes]) => (
                <Card key={timeframe} className="p-4 bg-card border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">
                    {timeframe}
                  </p>
                  <div className="space-y-1 text-xs">
                    <p className="text-green-500">
                      Buy: ${Math.round(volumes.buyVolumeUSDT).toLocaleString()}
                    </p>
                    <p className="text-green-400">
                      {volumes.buyVolumeBTC.toFixed(2)} BTC
                    </p>
                    <p className="text-red-500">
                      Sell: ${Math.round(volumes.sellVolumeUSDT).toLocaleString()}
                    </p>
                    <p className="text-red-400">
                      {volumes.sellVolumeBTC.toFixed(2)} BTC
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="p-6 bg-red-950 border-red-800 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-red-200">Error Loading Klines</p>
                <p className="text-sm text-red-300 mt-1">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card className="p-8 bg-card border-border text-center">
            <div className="animate-spin mb-4">
              <RefreshCw className="w-8 h-8 text-cyan-500 mx-auto" />
            </div>
            <p className="text-lg font-semibold">Loading klines data...</p>
          </Card>
        )}

        {/* Klines Table */}
        {!loading && !error && klines.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-card border-b border-border">
                  <th className="p-2 text-left font-semibold text-muted-foreground">
                    #
                  </th>
                  <th className="p-2 text-left font-semibold text-muted-foreground">
                    Open Time
                  </th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">
                    Open
                  </th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">
                    High
                  </th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">
                    Low
                  </th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">
                    Close
                  </th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">
                    Volume BTC [7]
                  </th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">
                    Volume USDT [7]
                  </th>
                  <th className="p-2 text-right font-semibold text-muted-foreground">
                    Trades [8]
                  </th>
                  <th className="p-2 text-right font-semibold text-muted-foreground text-green-500">
                    Buy Vol BTC [9]
                  </th>
                  <th className="p-2 text-right font-semibold text-muted-foreground text-green-500">
                    Buy Vol USDT [10]
                  </th>
                  <th className="p-2 text-right font-semibold text-muted-foreground text-red-500">
                    Sell Vol BTC
                  </th>
                  <th className="p-2 text-right font-semibold text-muted-foreground text-red-500">
                    Sell Vol USDT
                  </th>
                </tr>
              </thead>
              <tbody>
                {klines.map((kline, index) => {
                  const totalVolBTC = parseFloat(kline.volumeBTC);
                  const totalVolUSDT = parseFloat(kline.volumeUSDT);
                  const buyVolBTC = parseFloat(kline.buyVolumeBTC);
                  const buyVolUSDT = parseFloat(kline.buyVolumeUSDT);
                  const sellVolBTC = totalVolBTC - buyVolBTC;
                  const sellVolUSDT = totalVolUSDT - buyVolUSDT;

                  return (
                    <tr
                      key={index}
                      className="border-b border-border hover:bg-card/50 transition-colors"
                    >
                      <td className="p-2 text-muted-foreground">{index + 1}</td>
                      <td className="p-2 text-muted-foreground">
                        {new Date(kline.openTime).toLocaleString()}
                      </td>
                      <td className="p-2 text-right">${parseFloat(kline.open).toFixed(2)}</td>
                      <td className="p-2 text-right">${parseFloat(kline.high).toFixed(2)}</td>
                      <td className="p-2 text-right">${parseFloat(kline.low).toFixed(2)}</td>
                      <td className="p-2 text-right font-semibold">
                        ${parseFloat(kline.close).toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        {totalVolBTC.toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-muted-foreground">
                        ${totalVolUSDT.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-2 text-right text-muted-foreground">{kline.trades}</td>
                      <td className="p-2 text-right text-green-500 font-semibold">
                        {buyVolBTC.toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-green-500 font-semibold">
                        ${buyVolUSDT.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-2 text-right text-red-500 font-semibold">
                        {sellVolBTC.toFixed(2)}
                      </td>
                      <td className="p-2 text-right text-red-500 font-semibold">
                        ${sellVolUSDT.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && klines.length === 0 && (
          <Card className="p-8 bg-card border-border text-center">
            <p className="text-muted-foreground">No klines data available</p>
          </Card>
        )}
      </div>
    </div>
  );
}
