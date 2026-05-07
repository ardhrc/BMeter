import { BarChart3, TrendingUp, Activity, Settings, Home, Bell, Zap, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const navItems = [
    { icon: Home, label: "Dashboard", active: true },
    { icon: TrendingUp, label: "Whale Trades" },
    { icon: Activity, label: "Liquidations" },
    { icon: BarChart3, label: "Volume Flow" },
    { icon: Zap, label: "Rapid Movers" },
    { icon: Eye, label: "Heatmap" },
    { icon: Bell, label: "Set Alerts" },
  ];

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">₿</span>
          </div>
          <span className="text-xl font-bold">CryptoMeter</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => (
          <Button
            key={item.label}
            variant={item.active ? "default" : "ghost"}
            className="w-full justify-start gap-3"
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button variant="outline" className="w-full justify-start gap-3">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}
