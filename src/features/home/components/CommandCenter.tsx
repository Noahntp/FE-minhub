import React from "react";
import { Flame, Target, Zap, Play } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Link } from "react-router-dom";
import { useApp } from "@/app/AppContext";

export function CommandCenter() {
  const { currentUser, isLoggedIn } = useApp();
  const displayName = currentUser?.name?.split(' ')[0] || "bạn";

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Top Section: Greeting & Gamification Stats */}
      <div className="bg-card rounded-2xl border border-border/50 shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="p-6 md:p-8 flex-1">
            <h1 className="text-2xl font-bold tracking-tight mb-2">Chào buổi sáng, {displayName}! 👋</h1>
            <p className="text-muted-foreground">Bạn có 1 bài học chưa hoàn thành. Hãy giữ vững phong độ nhé!</p>
          </div>
          
          <div className="flex bg-muted/30 p-6 md:p-8 gap-6 md:border-l border-border/50">
            <Link to="/achievements" className="flex flex-col items-center justify-center group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <div className="flex items-center text-amber-500 mb-1">
                <Flame className="w-5 h-5 fill-current mr-1 group-hover:scale-110 transition-transform" />
                <span className="text-xl font-bold">5</span>
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold group-hover:text-amber-500 transition-colors">Ngày Streak</span>
            </Link>
            
            <div className="w-px bg-border/50 hidden md:block"></div>
            
            <Link to="/achievements" className="flex flex-col items-center justify-center group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors">
              <div className="flex items-center text-blue-500 mb-1">
                <Zap className="w-5 h-5 fill-current mr-1 group-hover:scale-110 transition-transform" />
                <span className="text-xl font-bold">450</span>
              </div>
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold group-hover:text-blue-500 transition-colors">XP Tuần này</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Section: Continue Learning CTA */}
      <div className="bg-gradient-to-r from-card to-primary/5 rounded-2xl border border-border/50 shadow-sm overflow-hidden p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <Link to="/course/1" className="w-full md:w-48 aspect-video rounded-xl overflow-hidden shrink-0 relative group cursor-pointer border border-border block">
            <img 
              src="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80" 
              alt="Course Thumbnail" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                <Play className="h-5 w-5 ml-1" />
              </div>
            </div>
          </Link>
          
          <div className="flex-1 w-full">
            <div className="flex justify-between items-center mb-2">
              <Link to="/roadmaps/frontend" className="text-xs font-bold text-primary uppercase tracking-wider hover:underline">Đang học • React Roadmap</Link>
              <span className="text-xs font-bold text-muted-foreground">68%</span>
            </div>
            <Link to="/course/1" className="hover:underline block">
              <h3 className="text-lg font-bold mb-1">Lập trình React JS Cơ bản đến Nâng cao</h3>
            </Link>
            <p className="text-sm text-foreground font-medium mb-4">Bài 12: Sử dụng useEffect trong thực tế</p>
            
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-4">
              <div className="h-full bg-primary rounded-full" style={{ width: '68%' }}></div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button asChild className="w-full md:w-auto rounded-full font-bold px-8">
                <Link to="/course/1/learn">
                  Tiếp tục bài học
                  <Play className="w-3.5 h-3.5 ml-2" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="rounded-full text-muted-foreground hover:text-foreground hidden md:flex">
                <Link to="/course/1">Xem đề cương</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
