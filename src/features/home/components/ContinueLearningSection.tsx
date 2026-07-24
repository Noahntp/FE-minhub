import React from "react";
import { Play, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";

export function ContinueLearningSection() {
  // Dummy data representing the course the user is currently learning
  const currentCourse = {
    id: "101",
    title: "Master Node.js & Express JS",
    lastChapter: "Chương 4: Xây dựng RESTful API",
    lastLesson: "Bài 12: Middleware trong Express",
    progress: 45, // percentage
    thumbnail: "https://images.unsplash.com/photo-1627398225058-f4c0bd34d16c?w=800&q=80",
  };

  return (
    <section className="py-8 bg-muted/20 border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Tiếp tục học tập</h2>
          <Link to="/my-courses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Xem khóa học của tôi &rarr;
          </Link>
        </div>

        <div className="bg-card border rounded-xl p-4 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow">
          <div className="w-full md:w-64 aspect-video rounded-lg overflow-hidden shrink-0 relative group">
            <img 
              src={currentCourse.thumbnail} 
              alt={currentCourse.title} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <Play className="h-6 w-6 ml-1" />
              </div>
            </div>
          </div>

          <div className="flex-1 w-full">
            <h3 className="font-bold text-lg mb-1 line-clamp-1">{currentCourse.title}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              <span className="font-medium text-foreground">{currentCourse.lastChapter}</span> • {currentCourse.lastLesson}
            </p>
            
            <div className="flex items-center gap-4 mb-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${currentCourse.progress}%` }}
                />
              </div>
              <span className="text-sm font-bold w-12 text-right">{currentCourse.progress}%</span>
            </div>
          </div>

          <div className="w-full md:w-auto shrink-0 flex flex-col justify-center">
             <Button className="w-full md:w-auto font-bold rounded-full px-8">
               Học tiếp
               <Play className="ml-2 h-4 w-4" />
             </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
