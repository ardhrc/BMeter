import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { RefreshCw, AlertCircle } from "lucide-react";

interface KlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volumeBTC: string;
  volumeUSDT: string;
  trades: number;
  buyVolumeBTC: string;
  buyVolumeUSDT: string;
}

interface AggregatedVolume {
  buyVolumeBTC: number;
  buyVolumeUSDT: number;
  sellVolumeBTC: number;
  sellVolumeUSDT: number;
}

export default function KlinesDataDisplay({ symbol = "BTCUSDT" }) {
  const [klines, setKlines] = useState<KlineData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchKlines = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await fetch(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=5m&limit=288`
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
        volumeBTC: kline[7],
        volumeUSDT: kline[7],
        trades: kline[8],
        buyVolumeBTC: kline[9],
        buyVolumeUSDT: kline[10],
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
  }, [symbol]);

  // Calculate aggregated volumes
  const calculateAggregates = (): Record<string, AggregatedVolume> | null => {
    if (klines.length === 0) return null;

    const calculateVolume = (candles: KlineData[]): AggregatedVolume => {
      let buyVolumeBTC = 0;
      let buyVolumeUSDT = 0;
      let sellVolumeBTC = 0;
      let sellVolumeUSDT = 0;

      candles.forEach((k) => {
        const totalVolumeUSDT = parseFloat(k.volumeUSDT);
        const buyBTC = parseFloat(k.buyVolumeBTC);
        const buyUSDT = parseFloat(k.buyVolumeUSDT);

        buyVolumeBTC += buyBTC;
        buyVolumeUSDT += buyUSDT;
        sellVolumeBTC += parseFloat(k.volumeBTC) - buyBTC;
        sellVolumeUSDT += totalVolumeUSDT - buyUSDT;
      });

      return {
        buyVolumeBTC: Math.round(buyVolumeBTC * 100) / 100,
        buyVolumeUSDT: Math.round(buyVolumeUSDT),
        sellVolumeBTC: Math.round(sellVolumeBTC * 100) / 100,
        sellVolumeUSDT: Math.round(sellVolumeUSDT),
      };
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Klines Data & Aggregated Volumes</h2>
        <button
          onClick={fetchKlines}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Refresh data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Error State */}
      {error && (
        <Card className="p-6 bg-red-950 border-red-800">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-200">Error Loading Klines</p>
              <p className="text-sm text-red-300 mt-1">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Aggregated Volumes Summary */}
      {aggregates && !loading && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Aggregated Volumes (All Timeframes)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="p-3 text-left font-semibold">Timeframe</th>
                  <th className="p-3 text-right font-semibold text-green-500">Buy Volume (BTC)</th>
                  <th className="p-3 text-right font-semibold text-green-500">Buy Volume (USD)</th>
                  <th className="p-3 text-right font-semibold text-red-500">Sell Volume (BTC)</th>
                  <th className="p-3 text-right font-semibold text-red-500">Sell Volume (USD)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(aggregates).map(([timeframe, volumes]) => (
                  <tr key={timeframe} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3 font-semibold uppercase">{timeframe}</td>
                    <td className="p-3 text-right text-green-500 font-semibold">
                      {volumes.buyVolumeBTC.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-green-500 font-semibold">
                      ${volumes.buyVolumeUSDT.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </td>
                    <td className="p-3 text-right text-red-500 font-semibold">
                      {volumes.sellVolumeBTC.toLocaleString("en-US", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="p-3 text-right text-red-500 font-semibold">
                      ${volumes.sellVolumeUSDT.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Klines Data Table */}
      {!loading && !error && klines.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Raw Klines Data (288 Candles)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-muted border-b border-border">
                  <th className="p-2 text-left font-semibold">#</th>
                  <th className="p-2 text-left font-semibold">Open Time</th>
                  <th className="p-2 text-right font-semibold">Open</th>
                  <th className="p-2 text-right font-semibold">High</th>
                  <th className="p-2 text-right font-semibold">Low</th>
                  <th className="p-2 text-right font-semibold">Close</th>
                  <th className="p-2 text-right font-semibold">Volume (BTC)</th>
                  <th className="p-2 text-right font-semibold">Volume (USD)</th>
                  <th className="p-2 text-right font-semibold">Trades</th>
                  <th className="p-2 text-right font-semibold text-green-500">Buy Vol (BTC)</th>
                  <th className="p-2 text-right font-semibold text-green-500">Buy Vol (USD)</th>
                  <th className="p-2 text-right font-semibold text-red-500">Sell Vol (BTC)</th>
                  <th className="p-2 text-right font-semibold text-red-500">Sell Vol (USD)</th>
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
                    <tr key={index} className="border-b border-border hover:bg-muted/50">
                      <td className="p-2">{index + 1}</td>
                      <td className="p-2 text-muted-foreground">
                        {new Date(kline.openTime).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="p-2 text-right">${parseFloat(kline.open).toFixed(2)}</td>
                      <td className="p-2 text-right">${parseFloat(kline.high).toFixed(2)}</td>
                      <td className="p-2 text-right">${parseFloat(kline.low).toFixed(2)}</td>
                      <td className="p-2 text-right font-semibold">${parseFloat(kline.close).toFixed(2)}</td>
                      <td className="p-2 text-right text-muted-foreground">{totalVolBTC.toFixed(2)}</td>
                      <td className="p-2 text-right text-muted-foreground">
                        ${totalVolUSDT.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-2 text-right text-muted-foreground">{kline.trades}</td>
                      <td className="p-2 text-right text-green-500 font-semibold">{buyVolBTC.toFixed(2)}</td>
                      <td className="p-2 text-right text-green-500 font-semibold">
                        ${buyVolUSDT.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                      <td className="p-2 text-right text-red-500 font-semibold">{sellVolBTC.toFixed(2)}</td>
                      <td className="p-2 text-right text-red-500 font-semibold">
                        ${sellVolUSDT.toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
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
    </div>
  );
}
