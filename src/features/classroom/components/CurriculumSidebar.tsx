import React, { useState } from 'react';
import { Course, Lesson } from '@/shared/types';
import { PlayCircle, CheckCircle, Clock, ChevronDown, ChevronUp, X, Play } from 'lucide-react';
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
  onSelectLesson,
}: CurriculumSidebarProps) {
  if (!course) return null;

  // Track expanded chapters (all expanded by default)
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    (course.chapters || []).forEach((ch) => {
      initial[ch.id] = true;
    });
    return initial;
  });

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterId]: !prev[chapterId],
    }));
  };

  const handleExpandAll = () => {
    const allExpanded: Record<string, boolean> = {};
    (course.chapters || []).forEach((ch) => {
      allExpanded[ch.id] = true;
    });
    setExpandedChapters(allExpanded);
  };

  return (
    <aside
      className={`
        bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-4 w-full lg:w-[380px] shrink-0
        ${isOpen ? 'block' : 'hidden lg:block'}
      `}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
          Nội dung khóa học
        </h3>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleExpandAll}
            className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Mở rộng tất cả</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden text-slate-500 hover:text-slate-900"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* CHAPTERS ACCORDION LIST */}
      <div className="space-y-3 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 tactile-scrollbar">
        {course.chapters.map((chapter, chapterIndex) => {
          const isExpanded = expandedChapters[chapter.id] ?? true;
          const completedInChapter = chapter.lessons.filter((l) =>
            completedLessonIds.includes(l.id)
          ).length;

          return (
            <div
              key={chapter.id}
              className="border border-slate-100/90 rounded-xl overflow-hidden bg-slate-50/40"
            >
              {/* Chapter Header */}
              <button
                onClick={() => toggleChapter(chapter.id)}
                className="w-full p-3 flex items-start justify-between gap-3 text-left hover:bg-slate-100/60 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 text-slate-400">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronUp className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 leading-snug">
                      Phần {chapterIndex + 1}: {chapter.title}
                    </h4>
                  </div>
                </div>

                <span className="text-[11px] font-bold text-slate-500 bg-white border border-slate-200/60 px-2 py-0.5 rounded-full shrink-0">
                  {completedInChapter}/{chapter.lessons.length} bài đã hoàn thành
                </span>
              </button>

              {/* Lesson Items */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-white divide-y divide-slate-100">
                  {chapter.lessons.map((lesson, lessonIndex) => {
                    const isActive = lesson.id === activeLessonId;
                    const isCompleted = completedLessonIds.includes(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson.id)}
                        className={`
                          relative p-3 flex items-center justify-between gap-3 transition-all cursor-pointer group
                          ${
                            isActive
                              ? 'bg-blue-50/60 font-bold'
                              : 'hover:bg-slate-50/80'
                          }
                        `}
                      >
                        {/* Active Left Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 rounded-r" />
                        )}

                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* Icon Circle */}
                          {isCompleted ? (
                            <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          ) : isActive ? (
                            <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                            </div>
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center shrink-0">
                              {lessonIndex + 1}
                            </div>
                          )}

                          {/* Title */}
                          <p
                            className={`text-xs leading-snug truncate ${
                              isActive
                                ? 'text-slate-900 font-extrabold'
                                : 'text-slate-700 font-semibold group-hover:text-slate-900'
                            }`}
                          >
                            {lesson.title}
                          </p>
                        </div>

                        {/* Duration */}
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium shrink-0">
                          <Clock className="w-3 h-3" />
                          <span>{lesson.duration || '10:15'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
