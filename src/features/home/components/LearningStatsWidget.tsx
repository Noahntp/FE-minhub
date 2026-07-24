import React from "react";
import { BookOpen, CheckCircle, Clock, Award } from "lucide-react";

export function LearningStatsWidget() {
  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6">
      <h3 className="font-bold text-base mb-4 flex items-center gap-2">
        <Award className="w-4 h-4 text-primary" />
        Thống kê học tập
      </h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wider">Đang học</span>
          </div>
          <span className="text-xl font-bold">3</span>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Hoàn thành</span>
          </div>
          <span className="text-xl font-bold">12</span>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Giờ học</span>
          </div>
          <span className="text-xl font-bold">48h</span>
        </div>
        
        <div className="bg-muted/30 p-3 rounded-xl border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-semibold uppercase tracking-wider">Chứng chỉ</span>
          </div>
          <span className="text-xl font-bold">2</span>
        </div>
      </div>
    </div>
  );
}
