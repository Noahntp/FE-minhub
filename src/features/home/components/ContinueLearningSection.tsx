import React, { useState, useEffect } from "react";
import { Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { apiFetch } from "@/shared/lib/api-client";
import { resolveMediaUrl } from "@/shared/utils/format";

export function ContinueLearningSection() {
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState<{
    id: string;
    title: string;
    lastChapter: string;
    lastLesson: string;
    progress: number;
    thumbnail: string;
  } | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLatestCourse = async () => {
      // 1. Try Backend /api/learn/resume
      try {
        const resumeRes = await apiFetch<any>('/learn/resume');
        const resume = resumeRes?.data || resumeRes;
        if (resume && resume.course) {
          if (isMounted) {
            setCourseData({
              id: String(resume.course.id || resume.course.slug),
              title: resume.course.title || 'Khóa học đang học',
              lastChapter: resume.section?.title || 'Bài học gần nhất',
              lastLesson: resume.lesson?.title || 'Tiếp tục bài giảng',
              progress: Math.min(100, Math.round(Number(resume.progress?.progress_percent || resume.course.progress_percent || 30))),
              thumbnail: resolveMediaUrl(resume.course.thumbnail_url) || 'https://images.unsplash.com/photo-1627398225058-f4c0bd34d16c?w=800&q=80',
            });
            return;
          }
        }
      } catch (e) {}

      // 2. Fallback: /api/me/courses
      try {
        const myCoursesRes = await apiFetch<any>('/me/courses');
        const list = Array.isArray(myCoursesRes) ? myCoursesRes : (myCoursesRes?.data || []);
        if (Array.isArray(list) && list.length > 0) {
          const first = list[0]?.course || list[0];
          const progressVal = Math.min(100, Math.round(Number(list[0]?.progress_percent || 15)));
          if (isMounted) {
            setCourseData({
              id: String(first.id || first.slug),
              title: first.title || 'Khóa học của tôi',
              lastChapter: first.category?.name || 'Tiếp tục lộ trình',
              lastLesson: 'Bài học tiếp theo',
              progress: progressVal,
              thumbnail: resolveMediaUrl(first.thumbnail_url) || 'https://images.unsplash.com/photo-1627398225058-f4c0bd34d16c?w=800&q=80',
            });
            return;
          }
        }
      } catch (e) {}
    };

    fetchLatestCourse();
    return () => {
      isMounted = false;
    };
  }, []);

  // Fallback default course if no login/enrolled courses yet
  const currentCourse = courseData || {
    id: "1",
    title: "Lập trình Web Frontend với React.js",
    lastChapter: "Chương 2: Components & State",
    lastLesson: "Bài 4: Quản lý trạng thái với useState",
    progress: 35,
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80",
  };

  const handleResume = () => {
    navigate(`/learn/${currentCourse.id}`);
  };

  return (
    <section className="py-8 bg-muted/20 border-b border-border/40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight text-slate-900">Tiếp tục học tập</h2>
          <Link to="/my-courses" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Xem khóa học của tôi &rarr;
          </Link>
        </div>

        <div className="bg-card border rounded-xl p-4 flex flex-col md:flex-row gap-6 items-center shadow-sm hover:shadow-md transition-shadow">
          <div 
            onClick={handleResume}
            className="w-full md:w-64 aspect-video rounded-lg overflow-hidden shrink-0 relative group cursor-pointer"
          >
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

          <div className="flex-1 w-full text-left">
            <h3 
              onClick={handleResume}
              className="font-bold text-lg mb-1 line-clamp-1 hover:text-primary cursor-pointer transition-colors"
            >
              {currentCourse.title}
            </h3>
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
             <Button 
               onClick={handleResume}
               className="w-full md:w-auto font-bold rounded-full px-8 cursor-pointer"
             >
               Học tiếp
               <Play className="ml-2 h-4 w-4" />
             </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
