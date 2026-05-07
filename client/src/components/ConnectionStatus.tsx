import { Wifi, WifiOff, AlertCircle } from "lucide-react";

interface ConnectionStatusProps {
  priceConnected: boolean;
  tradeConnected: boolean;
  error?: string | null;
}

export default function ConnectionStatus({
  priceConnected,
  tradeConnected,
  error,
}: ConnectionStatusProps) {
  const allConnected = priceConnected && tradeConnected;

  return (
    <div className="flex items-center gap-3 px-3 py-2 bg-card border border-border rounded-lg text-sm">
      {error ? (
        <>
          <AlertCircle className="w-4 h-4 text-red-500" />
          <span className="text-red-500">Connection Error</span>
        </>
      ) : allConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500 animate-pulse" />
          <span className="text-green-500">Live • Connected</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-yellow-500 animate-pulse" />
          <span className="text-yellow-500">Connecting...</span>
        </>
      )}
      <div className="flex gap-2 ml-2 text-xs">
        <span className={priceConnected ? "text-green-500" : "text-gray-500"}>
          Price {priceConnected ? "✓" : "✗"}
        </span>
        <span className={tradeConnected ? "text-green-500" : "text-gray-500"}>
          Trade {tradeConnected ? "✓" : "✗"}
        </span>
      </div>
    </div>
  );
}
