import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";
import { PricePoint } from "@/hooks/usePriceHistory";

interface PriceChartProps {
  timeframe: string;
  data?: PricePoint[];
}

export default function PriceChart({ timeframe, data }: PriceChartProps) {
  // Default mock data if no real data provided
  const chartData = data || [
    { time: "06:00 AM", price: 78500, volume: 45000 },
    { time: "09:00 AM", price: 79200, volume: 52000 },
    { time: "12:00 PM", price: 80100, volume: 58000 },
    { time: "03:00 PM", price: 80800, volume: 61000 },
    { time: "06:00 PM", price: 81200, volume: 55000 },
    { time: "09:00 PM", price: 81500, volume: 48000 },
    { time: "12:00 AM", price: 81289, volume: 42000 },
  ];

  return (
    <Card className="bg-card border-border p-4">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="time" stroke="#888" style={{ fontSize: "12px" }} />
          <YAxis stroke="#888" style={{ fontSize: "12px" }} domain={["dataMin - 1000", "dataMax + 1000"]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #444",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value: number) => `$${value.toLocaleString()}`}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#06b6d4"
            dot={false}
            strokeWidth={2}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
