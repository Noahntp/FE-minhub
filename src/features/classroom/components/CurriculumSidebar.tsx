import React from 'react';
import { Course, Lesson } from '@/shared/types';
import { PlayCircle, CheckCircle, FileText, HelpCircle, X } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface CurriculumSidebarProps {
  course: Course | null;
  activeLessonId: string;
  completedLessonIds: string[];
  isOpen: boolean;
  onClose: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export function CurriculumSidebar({
  course,
  activeLessonId,
  completedLessonIds,
  isOpen,
  onClose,
  onSelectLesson
}: CurriculumSidebarProps) {
  if (!course) return null;

  const getLessonIcon = (type: Lesson['type']) => {
    switch (type) {
      case 'video': return <PlayCircle className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'assignment': return <FileText className="w-4 h-4" />;
      case 'doc': return <FileText className="w-4 h-4" />;
      default: return <PlayCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className={`
      fixed inset-y-0 right-0 z-40 w-full sm:w-80 bg-background/95 backdrop-blur-md border-l border-border/50 transform transition-transform duration-300 ease-in-out shadow-2xl
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      flex flex-col lg:relative lg:translate-x-0 lg:w-80
    `}>
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/50">
        <h2 className="font-semibold text-base tracking-tight">Nội dung khóa học</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="lg:hidden hover:bg-muted/80 rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        {course.chapters.map((chapter, index) => (
          <div key={chapter.id} className="border-b border-border/40 last:border-b-0">
            <div className="p-4 bg-muted/20 sticky top-0 backdrop-blur-md z-10 border-b border-border/30">
              <h3 className="font-semibold text-sm text-foreground/90">
                Phần {index + 1}: {chapter.title}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs font-medium text-muted-foreground/80 bg-muted/50 px-2 py-0.5 rounded-full">
                  {chapter.lessons.filter(l => completedLessonIds.includes(l.id)).length} / {chapter.lessons.length} bài
                </span>
              </div>
            </div>
            
            <div className="flex flex-col">
              {chapter.lessons.map((lesson, lessonIndex) => {
                const isActive = lesson.id === activeLessonId;
                const isCompleted = completedLessonIds.includes(lesson.id);
                
                return (
                  <button
                    key={lesson.id}
                    onClick={() => onSelectLesson(lesson.id)}
                    className={`
                      w-full text-left p-4 flex items-start gap-3 transition-all duration-200 group relative
                      ${isActive ? 'bg-primary/[0.08]' : 'hover:bg-muted/40'}
                    `}
                  >
                    {isActive && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-r-full shadow-[2px_0_8px_rgba(var(--primary),0.4)]" />
                    )}
                    <div className={`mt-0.5 shrink-0 transition-colors duration-200 ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-500' : 'text-muted-foreground/50 group-hover:text-muted-foreground'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 drop-shadow-sm" />
                      ) : (
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                          isActive ? 'border-primary text-primary bg-primary/10' : 'border-current'
                        }`}>
                          {lessonIndex + 1}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-2">
                      <p className={`text-sm leading-tight mb-1.5 transition-colors duration-200 line-clamp-2 ${
                        isActive ? 'font-semibold text-primary' : 'font-medium text-foreground/80 group-hover:text-foreground'
                      }`}>
                        {lesson.title}
                      </p>
                      <div className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${
                        isActive ? 'text-primary/80' : 'text-muted-foreground/70'
                      }`}>
                        {getLessonIcon(lesson.type)}
                        <span>{lesson.duration}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
