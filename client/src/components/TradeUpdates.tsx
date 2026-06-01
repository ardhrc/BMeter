import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Zap } from "lucide-react";

interface KlineVolume {
  timeframe: "5m" | "15m" | "30m" | "1h" | "12h" | "24h";
  buyVolumeBTC: number;
  buyVolumeUSDT: number;
  sellVolumeBTC: number;
  sellVolumeUSDT: number;
  buyPct: number;
  sellPct: number;
}

interface TradeUpdatesProps {
  volumes: KlineVolume[];
  wsActive?: boolean;
}

export default function TradeUpdates({ volumes, wsActive = false }: TradeUpdatesProps) {
  return (
    <Card className="bg-card border-border p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-2 h-2 rounded-full ${wsActive ? "bg-green-500 animate-pulse" : "bg-yellow-500 animate-pulse"}`}></div>
        <h2 className="text-lg font-semibold">Live Trade Updates</h2>
        {wsActive && (
          <div className="ml-auto" title="WebSocket Active">
            <Zap className="w-4 h-4 text-cyan-500" />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {volumes.map((volume, idx) => (
          <div key={idx} className="border-b border-border pb-4 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium uppercase">{volume.timeframe}</span>
              <span className="text-xs text-muted-foreground">
                BUY: {volume.buyVolumeBTC.toFixed(2)} BTC | SELL: {volume.sellVolumeBTC.toFixed(2)} BTC
              </span>
            </div>

            {/* Buy/Sell Volume Bars */}
            <div className="space-y-2">
              {/* Buy Bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded h-6 overflow-hidden">
                  <div
                    className="bg-green-500 h-full flex items-center justify-end pr-2 transition-all duration-300"
                    style={{ width: `${volume.buyPct}%` }}
                  >
                    <span className="text-xs font-bold text-white">{volume.buyPct.toFixed(1)}%</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-green-500 w-24 text-right">
                  ${(volume.buyVolumeUSDT / 1e6).toFixed(2)}M
                </span>
              </div>

              {/* Sell Bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded h-6 overflow-hidden">
                  <div
                    className="bg-red-500 h-full flex items-center justify-end pr-2 transition-all duration-300"
                    style={{ width: `${volume.sellPct}%` }}
                  >
                    <span className="text-xs font-bold text-white">{volume.sellPct.toFixed(1)}%</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-red-500 w-24 text-right">
                  ${(volume.sellVolumeUSDT / 1e6).toFixed(2)}M
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
