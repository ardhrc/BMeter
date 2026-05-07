import { Card } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface ActivityItem {
  quantity: number;
  total: number;
  side: "BUY" | "SELL";
  exchange: string;
  date: string;
}

interface ActivityTableProps {
  title: string;
  subtitle: string;
  data: ActivityItem[];
}

export default function ActivityTable({ title, subtitle, data }: ActivityTableProps) {
  return (
    <Card className="bg-card border-border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-1">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Quantity</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Total</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Side</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Exchange</th>
              <th className="text-left py-3 px-4 font-semibold text-muted-foreground">Date/Time</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, idx) => (
              <tr key={idx} className="border-b border-border hover:bg-gray-900/50 transition-colors">
                <td className="py-3 px-4 font-mono">{item.quantity.toFixed(3)} BTC</td>
                <td className="py-3 px-4 font-mono">${(item.total / 1e6).toFixed(2)}M</td>
                <td className="py-3 px-4">
                  <div
                    className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full font-semibold ${
                      item.side === "BUY"
                        ? "bg-green-500/20 text-green-400"
                        : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {item.side === "BUY" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4" />
                    )}
                    {item.side}
                  </div>
                </td>
                <td className="py-3 px-4 text-muted-foreground">{item.exchange}</td>
                <td className="py-3 px-4 text-muted-foreground">{item.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
