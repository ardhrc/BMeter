import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui/card";

interface VolumeChartProps {
  timeframe: string;
}

export default function VolumeChart({ timeframe }: VolumeChartProps) {
  // Mock data for volume
  const chartData = [
    { time: "06:00 AM", volume: 15000 },
    { time: "09:00 AM", volume: 22000 },
    { time: "12:00 PM", volume: 28000 },
    { time: "03:00 PM", volume: 31000 },
    { time: "06:00 PM", volume: 25000 },
    { time: "09:00 PM", volume: 18000 },
    { time: "12:00 AM", volume: 12000 },
  ];

  return (
    <Card className="bg-card border-border p-4">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#444" />
          <XAxis dataKey="time" stroke="#888" style={{ fontSize: "12px" }} />
          <YAxis stroke="#888" style={{ fontSize: "12px" }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #444",
              borderRadius: "8px",
              color: "#fff",
            }}
            formatter={(value: number) => `${value.toLocaleString()} BTC`}
          />
          <Bar dataKey="volume" fill="#10b981" radius={[8, 8, 0, 0]} isAnimationActive={true} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
