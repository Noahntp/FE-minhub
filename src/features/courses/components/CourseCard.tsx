import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Clock, BookOpen, BarChart } from "lucide-react";
import { Link } from "react-router-dom";

export interface CourseData {
  id: string;
  title: string;
  instructor: string;
  thumbnail: string;
  duration: string;
  difficulty?: "Beginner" | "Intermediate" | "Advanced";
  progress?: number; // 0-100, if enrolled
  status?: "enrolled" | "completed" | "not_enrolled";
}

import { toast } from 'sonner';

export const CourseCard = React.memo(({ course }: { course: CourseData }) => {
  const isEnrolled = course.status === "enrolled" || course.progress !== undefined;
  const isCompleted = course.status === "completed" || course.progress === 100;
  
  const difficultyColors = {
    Beginner: "text-green-500 bg-green-500/10",
    Intermediate: "text-amber-500 bg-amber-500/10",
    Advanced: "text-rose-500 bg-rose-500/10",
  };

  const difficulty = course.difficulty || "Beginner";

  const handleAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isCompleted) {
      toast.info('Xem lại khóa học', { description: `Bạn đang mở lại khóa học ${course.title}` });
    } else if (isEnrolled) {
      toast.success('Tiếp tục học', { description: `Đang tải bài học tiếp theo của ${course.title}` });
    } else {
      toast.info('Khám phá khóa học', { description: `Bạn đang xem chi tiết ${course.title}` });
    }
  };

  return (
    <Card className="group overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full bg-card">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {isEnrolled && !isCompleted && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/50">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${course.progress || 0}%` }}
            />
          </div>
        )}
      </div>
      
      <CardHeader className="p-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${difficultyColors[difficulty]}`}>
            {difficulty}
          </span>
          {isCompleted && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              Đã hoàn thành
            </span>
          )}
        </div>
        <Link to={`/courses/${course.id}`} className="hover:underline">
          <h3 className="font-bold text-base line-clamp-2 leading-tight group-hover:text-primary transition-colors">
            {course.title}
          </h3>
        </Link>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 mt-auto">
        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
          <div className="flex items-center">
            <Clock className="w-3.5 h-3.5 mr-1.5" />
            {course.duration}
          </div>
          <div className="flex items-center">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" />
            24 Bài học
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/40 mt-2">
        <div className="flex items-center text-xs text-muted-foreground">
          <BarChart className="w-3.5 h-3.5 mr-1.5" />
          <span>Có chứng chỉ</span>
        </div>
        
        <Button onClick={handleAction} size="sm" variant={isEnrolled ? "default" : "secondary"} className="rounded-full text-xs h-8 px-4 font-bold">
          {isCompleted ? "Xem lại" : isEnrolled ? "Học tiếp" : "Xem lộ trình"}
        </Button>
      </CardFooter>
    </Card>
  );
});

CourseCard.displayName = "CourseCard";
