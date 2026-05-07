import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface Trade {
  timeframe: string;
  bought: number;
  sold: number;
  buyUSD: number;
  sellUSD: number;
  buyPct: number;
  sellPct: number;
}

interface TradeUpdatesProps {
  trades: Trade[];
}

export default function TradeUpdates({ trades }: TradeUpdatesProps) {
  return (
    <Card className="bg-card border-border p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <h2 className="text-lg font-semibold">Live Trade Updates</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4">
        {trades.map((trade, idx) => (
          <div key={idx} className="border-b border-border pb-4 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{trade.timeframe}</span>
              <span className="text-xs text-muted-foreground">
                BOUGHT: {trade.bought.toFixed(2)} BTC | SOLD: {trade.sold.toFixed(2)} BTC
              </span>
            </div>

            {/* Buy/Sell Volume Bars */}
            <div className="space-y-2">
              {/* Buy Bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded h-6 overflow-hidden">
                  <div
                    className="bg-green-500 h-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${trade.buyPct}%` }}
                  >
                    <span className="text-xs font-bold text-white">{trade.buyPct.toFixed(1)}%</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-green-500 w-24 text-right">
                  ${(trade.buyUSD / 1e6).toFixed(2)}M
                </span>
              </div>

              {/* Sell Bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-700 rounded h-6 overflow-hidden">
                  <div
                    className="bg-red-500 h-full flex items-center justify-end pr-2 transition-all"
                    style={{ width: `${trade.sellPct}%` }}
                  >
                    <span className="text-xs font-bold text-white">{trade.sellPct.toFixed(1)}%</span>
                  </div>
                </div>
                <span className="text-xs font-mono text-red-500 w-24 text-right">
                  ${(trade.sellUSD / 1e6).toFixed(2)}M
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
