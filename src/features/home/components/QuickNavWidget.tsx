import React from "react";
import { Compass, Heart, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";

export function QuickNavWidget() {
  const NAV_ITEMS = [
    { icon: <Compass className="w-4 h-4" />, label: "Khám phá", path: "/courses" },
    { icon: <Heart className="w-4 h-4 text-rose-500" />, label: "Đã lưu", path: "/favorites" },
    { icon: <User className="w-4 h-4" />, label: "Hồ sơ cá nhân", path: "/profile" },
    { icon: <Settings className="w-4 h-4" />, label: "Cài đặt", path: "/settings" },
  ];

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6">
      <h3 className="font-bold text-base mb-4">Lối tắt</h3>

      <div className="space-y-1">
        {NAV_ITEMS.map((item, index) => (
          <Link
            key={index}
            to={item.path}
            className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/50 transition-colors group font-medium text-sm text-foreground/80 hover:text-foreground"
          >
            <div className="text-muted-foreground group-hover:text-primary transition-colors">
              {item.icon}
            </div>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
