import { useState, useEffect, useRef, useCallback } from "react";

export interface CoinbaseTickerData {
  productId: string;
  price: number;
  time: string;
  trade_id: number;
  last_size: number;
  best_bid: number;
  best_ask: number;
  side: string;
  high24h?: number;
  low24h?: number;
  volume24h?: number;
}

export function useCoinbaseWebSocket(productId: string = "BTC-USD") {
  const [tickerData, setTickerData] = useState<CoinbaseTickerData | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      setError(null);

      // Coinbase WebSocket endpoint
      const wsUrl = "wss://ws-feed.exchange.coinbase.com";

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`Coinbase WebSocket connected for ${productId}`);
        setConnected(true);

        // Subscribe to ticker channel for the product
        const subscribeMessage = {
          type: "subscribe",
          product_ids: [productId],
          channels: ["ticker"],
        };

        ws.send(JSON.stringify(subscribeMessage));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Only process ticker messages
          if (data.type === "ticker") {
            const ticker: CoinbaseTickerData = {
              productId: data.product_id,
              price: parseFloat(data.price),
              time: data.time,
              trade_id: data.trade_id,
              last_size: parseFloat(data.last_size),
              best_bid: parseFloat(data.best_bid),
              best_ask: parseFloat(data.best_ask),
              side: data.side,
              high24h: data.high_24h ? parseFloat(data.high_24h) : undefined,
              low24h: data.low_24h ? parseFloat(data.low_24h) : undefined,
              volume24h: data.volume_24h ? parseFloat(data.volume_24h) : undefined,
            };

            setTickerData(ticker);
          }
        } catch (err) {
          console.error("Error parsing Coinbase WebSocket message:", err);
        }
      };

      ws.onerror = (event) => {
        console.error("Coinbase WebSocket error:", event);
        setError("Coinbase WebSocket connection error");
        setConnected(false);
      };

      ws.onclose = () => {
        console.log("Coinbase WebSocket disconnected");
        setConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect Coinbase WebSocket...");
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect Coinbase WebSocket";
      setError(errorMessage);
      setConnected(false);
    }
  }, [productId]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      // Unsubscribe before closing
      try {
        const unsubscribeMessage = {
          type: "unsubscribe",
          product_ids: [productId],
          channels: ["ticker"],
        };
        wsRef.current.send(JSON.stringify(unsubscribeMessage));
      } catch (err) {
        console.error("Error unsubscribing:", err);
      }

      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    setConnected(false);
  }, [productId]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { tickerData, connected, error };
}
