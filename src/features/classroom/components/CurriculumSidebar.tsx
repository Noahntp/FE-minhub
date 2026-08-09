import React, { useState } from 'react';
import { Course, Lesson } from '@/shared/types';
import { PlayCircle, CheckCircle, Clock, ChevronDown, ChevronUp, X, Play, Award, Trophy, BookOpen } from 'lucide-react';
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

  // Check if all chapters are currently expanded
  const isAllExpanded = (course.chapters || []).every(
    (ch) => expandedChapters[ch.id] ?? true
  );

  const handleToggleExpandAll = () => {
    const nextState = !isAllExpanded;
    const newState: Record<string, boolean> = {};
    (course.chapters || []).forEach((ch) => {
      newState[ch.id] = nextState;
    });
    setExpandedChapters(newState);
  };

  const totalLessons = (course.chapters || []).flatMap((c) => c.lessons).length;
  const completedCount = completedLessonIds.length;
  const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  return (
    <aside
      className={`
        bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col w-full lg:w-[380px] shrink-0 sticky top-20 max-h-[calc(100vh-100px)]
        ${isOpen ? 'block' : 'hidden lg:flex'}
      `}
    >
      {/* SIDEBAR HEADER */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
            Nội dung khóa học
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleExpandAll}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer hover:bg-emerald-50 px-2 py-1 rounded-md transition-colors"
          >
            <span>{isAllExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
            {isAllExpanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
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

      {/* CHAPTERS ACCORDION LIST (SCROLLABLE) */}
      <div className="space-y-3 flex-1 overflow-y-auto my-3 pr-1 tactile-scrollbar">
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

                <span className="text-[10px] font-bold text-slate-500 bg-white border border-slate-200/60 px-2 py-0.5 rounded-full shrink-0">
                  {completedInChapter}/{chapter.lessons.length}
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
                              ? 'bg-emerald-50/70 font-bold'
                              : 'hover:bg-slate-50/80'
                          }
                        `}
                      >
                        {/* Active Left Indicator */}
                        {isActive && (
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-600 rounded-r" />
                        )}

                        <div className="flex items-center gap-3 overflow-hidden">
                          {/* Icon Circle */}
                          {isCompleted ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                              <CheckCircle className="w-3.5 h-3.5" />
                            </div>
                          ) : isActive ? (
                            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                              <Play className="w-3 h-3 fill-white ml-0.5" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-[11px] flex items-center justify-center shrink-0">
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

      {/* BOTTOM SIDEBAR WIDGET: COURSE PROGRESS BANNER */}
      <div className="pt-3 border-t border-slate-100 shrink-0 space-y-3">
        <div className="bg-slate-50/90 border border-slate-200/80 p-3.5 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" />
              Tiến độ khóa học
            </span>
            <span className="font-black text-emerald-600">{percent}%</span>
          </div>

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500 rounded-full"
              style={{ width: `${percent}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-500 font-medium leading-tight pt-0.5">
            Hoàn thành tất cả bài học để làm chủ hoàn toàn kiến thức khóa học.
          </p>
        </div>
      </div>

    </aside>
  );
}

