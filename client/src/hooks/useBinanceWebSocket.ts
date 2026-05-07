import { useState, useEffect, useRef, useCallback } from "react";

export interface PriceUpdate {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteAssetVolume: number;
  timestamp: number;
}

export function useBinanceWebSocket(symbol: string = "btcusdt") {
  const [priceData, setPriceData] = useState<PriceUpdate | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = useCallback(() => {
    try {
      setError(null);
      
      // Binance WebSocket endpoint for 24hr ticker
      const wsUrl = `wss://stream.binance.com:9443/ws/${symbol.toLowerCase()}@ticker`;
      
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log(`WebSocket connected for ${symbol}`);
        setConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Extract relevant data from Binance ticker stream
          const update: PriceUpdate = {
            symbol: data.s,
            price: parseFloat(data.c), // Current price
            priceChange: parseFloat(data.p), // Price change
            priceChangePercent: parseFloat(data.P), // Price change percent
            highPrice: parseFloat(data.h), // 24h high
            lowPrice: parseFloat(data.l), // 24h low
            volume: parseFloat(data.v), // 24h volume in base asset
            quoteAssetVolume: parseFloat(data.q), // 24h volume in quote asset
            timestamp: data.E, // Event time
          };

          setPriceData(update);
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (event) => {
        console.error("WebSocket error:", event);
        setError("WebSocket connection error");
        setConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setConnected(false);
        
        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log("Attempting to reconnect...");
          connect();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect WebSocket";
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

  return { priceData, connected, error };
}
