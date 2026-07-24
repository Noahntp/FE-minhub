import React from "react";
import { Link } from "react-router-dom";
import { History, PlayCircle } from "lucide-react";

export function RecentlyViewedWidget() {
  const RECENT_COURSES = [
    {
      id: "2",
      title: "Mastering TypeScript 2024",
      progress: 35,
      thumbnail: "https://images.unsplash.com/photo-1555099962-4199c345e5dd?w=800&q=80"
    },
    {
      id: "3",
      title: "UI/UX Design cho Người mới bắt đầu",
      progress: 0,
      thumbnail: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80"
    }
  ];

  return (
    <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-base flex items-center gap-2">
          <History className="w-4 h-4 text-primary" />
          Xem gần đây
        </h3>
      </div>

      <div className="space-y-3">
        {RECENT_COURSES.map((course) => (
          <Link
            key={course.id}
            to={`/course/${course.id}`}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted/50 transition-colors group"
          >
            <div className="w-16 h-12 rounded-lg overflow-hidden shrink-0 relative">
              <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                <PlayCircle className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-semibold text-foreground/90 group-hover:text-primary transition-colors line-clamp-2 leading-tight mb-1">
                {course.title}
              </h4>
              {course.progress > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${course.progress}%` }}></div>
                  </div>
                  <span className="text-[10px] font-medium text-muted-foreground">{course.progress}%</span>
                </div>
              ) : (
                <span className="text-[10px] font-medium text-muted-foreground">Chưa bắt đầu</span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
