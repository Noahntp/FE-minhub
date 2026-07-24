import React from "react";
import { Award, Trophy, Zap, Flame } from "lucide-react";
import { Link } from "react-router-dom";

export function RecentBadges() {
  return (
    <div className="mb-6 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
      <Link to="/achievements" className="text-sm font-bold tracking-tight uppercase flex items-center gap-2 mb-4 hover:text-primary transition-colors hover:underline">
        <Trophy className="w-4 h-4 text-amber-500" />
        Huy hiệu nổi bật
      </Link>

      <div className="flex justify-between items-center px-2">
        {/* Badge 1 */}
        <Link to="/achievements" className="flex flex-col items-center gap-2 group cursor-pointer w-1/3 block">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Zap className="w-6 h-6 text-amber-500" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground text-center group-hover:text-primary transition-colors">Fast Learner</span>
        </Link>
        
        {/* Badge 2 */}
        <Link to="/achievements" className="flex flex-col items-center gap-2 group cursor-pointer w-1/3 block">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Flame className="w-6 h-6 text-rose-500" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground text-center group-hover:text-primary transition-colors">7 Day Streak</span>
        </Link>

        {/* See all */}
        <Link to="/achievements" className="flex flex-col items-center gap-2 group cursor-pointer w-1/3 block">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-dashed border-border group-hover:border-primary transition-colors">
            <span className="text-xl opacity-50">+</span>
          </div>
          <span className="text-xs font-medium text-center text-muted-foreground group-hover:text-primary transition-colors hover:underline">Xem tất cả</span>
        </Link>
      </div>
    </div>
  );
}
