import React from "react";
import { Link } from "react-router-dom";
import { Server, Layout, PenTool, Cloud, ArrowRight } from "lucide-react";

export function RecommendedCategoriesWidget() {
  const CATEGORIES = [
    { name: "Frontend", icon: <Layout className="w-4 h-4 text-blue-500" />, path: "/categories/frontend", count: 24 },
    { name: "Backend", icon: <Server className="w-4 h-4 text-green-500" />, path: "/categories/backend", count: 18 },
    { name: "UI/UX Design", icon: <PenTool className="w-4 h-4 text-purple-500" />, path: "/categories/design", count: 12 },
    { name: "DevOps", icon: <Cloud className="w-4 h-4 text-orange-500" />, path: "/categories/devops", count: 8 },
  ];

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-base">Danh mục gợi ý</h3>
      </div>

      <div className="space-y-2">
        {CATEGORIES.map((cat, index) => (
          <Link
            key={index}
            to={cat.path}
            className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 rounded-md bg-muted/50 group-hover:bg-background transition-colors">
                {cat.icon}
              </div>
              <span className="font-medium text-sm text-foreground/90 group-hover:text-primary transition-colors">{cat.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{cat.count}</span>
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
