import { BarChart3, TrendingUp, Activity, Settings, Home, Bell, Zap, Eye, Bug } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const navItems = [
    { icon: Home, label: "Dashboard", active: location === "/" },
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
            onClick={() => item.label === "Dashboard" && setLocation("/")}
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </Button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border space-y-2">
        <Button variant="outline" className="w-full justify-start gap-3">
          <Settings className="w-4 h-4" />
          Settings
        </Button>
        <Button
          variant={location === "/debug/klines" ? "default" : "outline"}
          className="w-full justify-start gap-3 text-xs"
          onClick={() => setLocation("/debug/klines")}
        >
          <Bug className="w-4 h-4" />
          Debug Klines
        </Button>
      </div>
    </div>
  );
}
