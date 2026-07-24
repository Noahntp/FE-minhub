import React from "react";
import { Calendar as CalendarIcon, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

export function ActivityCalendar() {
  const weekDays = [
    { day: "T2", status: "completed" },
    { day: "T3", status: "completed" },
    { day: "T4", status: "missed" },
    { day: "T5", status: "completed" },
    { day: "T6", status: "today" },
    { day: "T7", status: "upcoming" },
    { day: "CN", status: "upcoming" },
  ];

  return (
    <div className="mb-6 bg-card p-5 rounded-2xl border border-border/50 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <Link to="/achievements" className="text-sm font-bold tracking-tight uppercase flex items-center gap-2 hover:text-primary transition-colors hover:underline">
          <CalendarIcon className="w-4 h-4" />
          Lịch hoạt động
        </Link>
        <span className="text-xs font-semibold text-muted-foreground">Tháng 7</span>
      </div>

      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center text-[10px] font-bold text-muted-foreground uppercase mb-2">
        <div>T2</div><div>T3</div><div>T4</div><div>T5</div><div>T6</div><div>T7</div><div>CN</div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-4">
        {Array.from({ length: 30 }).map((_, i) => (
          <div 
            key={i} 
            className={`aspect-square rounded-sm ${i % 7 === 0 ? 'bg-primary/20' : i % 5 === 0 ? 'bg-primary/40' : i % 3 === 0 ? 'bg-primary/60' : i === 29 ? 'bg-primary border border-primary-foreground' : 'bg-muted'} cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all`}
            title={i === 29 ? 'Hôm nay' : `Ngày ${i + 1}`}
          />
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t border-border/50">
        <p className="text-sm font-medium">Nhiệm vụ hôm nay:</p>
        <Link to="/my-courses" className="flex items-start gap-3 mt-2 group cursor-pointer block">
          <div className="w-5 h-5 rounded-full border-2 border-muted-foreground flex-shrink-0 mt-0.5 group-hover:border-primary transition-colors"></div>
          <div>
            <p className="text-sm font-medium group-hover:text-primary transition-colors leading-tight hover:underline">Hoàn thành 2 bài học React</p>
            <p className="text-xs text-muted-foreground mt-0.5">+50 XP</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
