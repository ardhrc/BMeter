import { useState, useEffect, useRef, useCallback } from "react";

export interface Trade {
  id: number;
  price: number;
  quantity: number;
  time: number;
  isBuyerMaker: boolean;
  isBestMatch: boolean;
}

export interface TradeStats {
  buyVolume: number;
  sellVolume: number;
  buyCount: number;
  sellCount: number;
  lastTradeTime: number;
}

export function useTradeWebSocket(symbol: string = "btcusdt") {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats>({
    buyVolume: 0,
    sellVolume: 0,
    buyCount: 0,
    sellCount: 0,
    lastTradeTime: 0,
  });
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tradesRef = useRef<Trade[]>([]);
  const statsRef = useRef<TradeStats>({
    buyVolume: 0,
    sellVolume: 0,
    buyCount: 0,
    sellCount: 0,
    lastTradeTime: 0,
  });

  const connect = useCallback(() => {
    try {
      setError(null);

      // Binance WebSocket endpoint for aggregate trades
      const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@aggTrade`;

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`Trade WebSocket connected for ${symbol}`);
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          const newTrade: Trade = {
            id: data.a,
            price: parseFloat(data.p),
            quantity: parseFloat(data.l),
            time: data.T,
            isBuyerMaker: data.m,
            isBestMatch: data.M,
          };

          // Update trades list (keep last 100)
          tradesRef.current = [newTrade, ...tradesRef.current].slice(0, 100);
          setTrades(tradesRef.current);

          // Update statistics
          const currentStats = { ...statsRef.current };
          const tradeValue = newTrade.price * newTrade.quantity;

          if (newTrade.isBuyerMaker) {
            currentStats.sellVolume += tradeValue;
            currentStats.sellCount += 1;
          } else {
            currentStats.buyVolume += tradeValue;
            currentStats.buyCount += 1;
          }

          currentStats.lastTradeTime = newTrade.time;
          statsRef.current = currentStats;
          setStats(currentStats);
        } catch (err) {
          console.error("Error parsing trade message:", err);
        }
      };

      ws.onerror = (event) => {
        console.error("Trade WebSocket error:", event);
        setError("Trade WebSocket connection error");
        setConnected(false);
      };

      ws.onclose = () => {
        console.log("Trade WebSocket disconnected");
        setConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect trade WebSocket...");
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect trade WebSocket";
      setError(errorMessage);
      setConnected(false);
    }
  }, [symbol]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { trades, stats, connected, error };
}
