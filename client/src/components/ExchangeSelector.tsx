import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ExchangeSelectorProps {
  selectedExchange: "coinbase" | "binance";
  selectedInterval: number;
  onExchangeChange: (exchange: "coinbase" | "binance") => void;
  onIntervalChange: (interval: number) => void;
}

export default function ExchangeSelector({
  selectedExchange,
  selectedInterval,
  onExchangeChange,
  onIntervalChange,
}: ExchangeSelectorProps) {
  const intervals = [1, 3, 5, 10, 15];

  return (
    <Card className="bg-card border-border p-4">
      <div className="space-y-4">
        {/* Exchange Selector */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Price Ticker Source</p>
          <div className="flex gap-2">
            <Button
              variant={selectedExchange === "coinbase" ? "default" : "outline"}
              size="sm"
              onClick={() => onExchangeChange("coinbase")}
              className="flex-1"
            >
              Coinbase
            </Button>
            <Button
              variant={selectedExchange === "binance" ? "default" : "outline"}
              size="sm"
              onClick={() => onExchangeChange("binance")}
              className="flex-1"
            >
              Binance
            </Button>
          </div>
        </div>

        {/* Interval Selector */}
        <div>
          <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase">Update Interval</p>
          <div className="grid grid-cols-5 gap-2">
            {intervals.map((interval) => (
              <Button
                key={interval}
                variant={selectedInterval === interval ? "default" : "outline"}
                size="sm"
                onClick={() => onIntervalChange(interval)}
                className="text-xs"
              >
                {interval}m
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
