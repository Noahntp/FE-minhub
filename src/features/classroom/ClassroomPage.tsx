import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Menu } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import { ClassroomSkeleton } from "./components/ClassroomSkeleton";
import { useClassroom } from "./hooks/useClassroom";
import { VideoPlayer } from "./components/VideoPlayer";
import { CurriculumSidebar } from "./components/CurriculumSidebar";
import { ClassroomTabs } from "./components/ClassroomTabs";

export default function ClassroomPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();

  const {
    course,
    activeLesson,
    progress,
    isSidebarOpen,
    activeTab,
    isLoading,
    error,
    toggleSidebar,
    selectLesson,
    markAsCompleted,
    setTab
  } = useClassroom(courseId);

  if (isLoading) {
    return <ClassroomSkeleton />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <EmptyState 
          title="Không tìm thấy khoá học"
          description="Khoá học này không tồn tại hoặc bạn không có quyền truy cập."
          actionLabel="Trở về trang chủ"
          onAction={() => navigate("/")}
        />
      </div>
    );
  }

  // Find next lesson to autoplay or progress
  const handleVideoEnded = () => {
    if (activeLesson) markAsCompleted(activeLesson.id);
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Top Navbar specifically for Classroom (Dark Mode) */}
      <header className="h-14 shrink-0 bg-[#0f172a] text-slate-200 border-b border-slate-800 flex items-center justify-between px-4 z-20 shadow-md">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(`/courses/${course.id}`)}
            className="hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Trở về chi tiết khoá học"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="hidden sm:block">
            <h1 className="font-semibold text-sm truncate max-w-md text-white" title={course.title}>
              {course.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-3 mr-4">
            <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">
              Tiến độ: <span className="text-white ml-1">{progress?.completedLessonIds.length || 0}</span> bài
            </div>
            <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)]" 
                style={{ 
                  width: `${course.chapters.reduce((acc, c) => acc + c.lessons.length, 0) > 0 
                    ? ((progress?.completedLessonIds.length || 0) / course.chapters.reduce((acc, c) => acc + c.lessons.length, 0)) * 100 
                    : 0}%` 
                }}
              />
            </div>
          </div>

          <Button 
            variant="ghost" 
            className="flex items-center gap-2 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            onClick={toggleSidebar}
          >
            <Menu className="w-5 h-5" />
            <span className="hidden sm:inline font-medium">Chương trình</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Side: Video & Content */}
        <div className={`flex-1 flex flex-col overflow-y-auto bg-background transition-all duration-300`}>
          <div className="w-full bg-[#000000] border-b border-border/40 shadow-sm flex justify-center">
            <div className="w-full max-w-[1400px]">
              <VideoPlayer 
                activeLesson={activeLesson}
                onEnded={handleVideoEnded}
              />
            </div>
          </div>
          
          <div className="flex-1 w-full bg-background/50">
            <div className="max-w-[1400px] mx-auto w-full">
              <ClassroomTabs 
                course={course}
                activeLesson={activeLesson}
                activeTab={activeTab}
                onTabChange={setTab}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Sidebar */}
        <CurriculumSidebar 
          course={course}
          activeLessonId={activeLesson?.id || ''}
          completedLessonIds={progress?.completedLessonIds || []}
          isOpen={isSidebarOpen}
          onClose={toggleSidebar}
          onSelectLesson={selectLesson}
        />
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-30" 
            onClick={toggleSidebar}
          />
        )}
      </main>
    </div>
  );
}
