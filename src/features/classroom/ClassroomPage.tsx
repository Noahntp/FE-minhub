import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Menu,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Award,
  Trophy,
  Sparkles,
  Check,
  RotateCcw,
  X,
  Star,
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { ClassroomSkeleton } from './components/ClassroomSkeleton';
import { useClassroom } from './hooks/useClassroom';
import { VideoPlayer } from './components/VideoPlayer';
import { CurriculumSidebar } from './components/CurriculumSidebar';
import { ClassroomTabs } from './components/ClassroomTabs';
import { toast } from 'sonner';

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
    toggleLessonCompletion,
    setTab,
  } = useClassroom(courseId);

  // State for Course Completion Congratulatory Modal
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [hasShownCompletionModal, setHasShownCompletionModal] = useState(false);

  // State for real-time video playback position
  const [currentVideoTime, setCurrentVideoTime] = useState<number>(0);

  // Flat list of all lessons in order
  const allLessons = useMemo(() => {
    if (!course?.chapters) return [];
    return course.chapters.flatMap((c) => c.lessons);
  }, [course]);

  const currentIndex = useMemo(() => {
    if (!activeLesson || !allLessons.length) return -1;
    return allLessons.findIndex((l) => l.id === activeLesson.id);
  }, [activeLesson, allLessons]);

  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < allLessons.length - 1
      ? allLessons[currentIndex + 1]
      : null;

  const completedCount = progress?.completedLessonIds?.length || 0;

  // Calculate overall course progress percentage
  const progressPercent = useMemo(() => {
    if (!allLessons.length) return 0;
    return Math.min(100, Math.round((completedCount / allLessons.length) * 100));
  }, [allLessons.length, completedCount]);

  const isActiveLessonCompleted = useMemo(() => {
    if (!activeLesson || !progress?.completedLessonIds) return false;
    return progress.completedLessonIds.includes(activeLesson.id);
  }, [activeLesson, progress?.completedLessonIds]);

  // Check if course is 100% completed and trigger modal
  useEffect(() => {
    if (allLessons.length > 0 && completedCount === allLessons.length && !hasShownCompletionModal) {
      setShowCompletionModal(true);
      setHasShownCompletionModal(true);
    }
  }, [allLessons.length, completedCount, hasShownCompletionModal]);

  if (isLoading) {
    return <ClassroomSkeleton />;
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans">
        <EmptyState
          title="Không tìm thấy khoá học"
          description="Khoá học này không tồn tại hoặc bạn không có quyền truy cập."
          actionLabel="Trở về trang chủ"
          onAction={() => navigate('/')}
        />
      </div>
    );
  }

  // 90% video playback auto-completion
  const handleProgress90 = () => {
    if (activeLesson && !isActiveLessonCompleted) {
      markAsCompleted(String(activeLesson.id));
      toast.success('Đã tự động đánh dấu hoàn thành bài học (xem >90%)!');
    }
  };

  const handleVideoEnded = () => {
    if (activeLesson && !isActiveLessonCompleted) {
      markAsCompleted(String(activeLesson.id));
      toast.success('Đã hoàn thành bài học!');
    }
  };

  const handleToggleCurrentLesson = () => {
    if (!activeLesson) return;
    const willBeCompleted = !isActiveLessonCompleted;
    toggleLessonCompletion(String(activeLesson.id));
    if (willBeCompleted) {
      toast.success('Đã đánh dấu bài học hoàn thành!');
    } else {
      toast.info('Đã bỏ đánh dấu hoàn thành bài học.');
    }
  };

  const handleGoNext = () => {
    if (activeLesson && !isActiveLessonCompleted) {
      markAsCompleted(String(activeLesson.id));
    }
    if (nextLesson) {
      selectLesson(String(nextLesson.id));
    } else {
      // Last lesson -> check for completion modal
      if (completedCount + 1 >= allLessons.length) {
        setShowCompletionModal(true);
      }
    }
  };

  const handleGoPrev = () => {
    if (prevLesson) {
      selectLesson(String(prevLesson.id));
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100/60 font-sans text-slate-800 relative">
      
      {/* 1. TOP NAVBAR (DARK THEME) */}
      <header className="h-14 shrink-0 bg-[#0f172a] text-slate-200 border-b border-slate-800 flex items-center justify-between px-4 z-30 shadow-md">
        
        {/* Left Side Navigation & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title="Chuyển đổi menu"
          >
            <Menu className="w-5 h-5" />
          </Button>

          <button
            onClick={() => navigate(`/courses/${course.id}`)}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Trở về chi tiết khóa học"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <h1
            className="text-xs sm:text-sm font-bold text-white truncate max-w-md"
            title={course.title}
          >
            {course.title}
          </h1>
        </div>

        {/* Right Side Progress & Controls */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Progress Indicator matching exact format: TIẾN ĐỘ: 5/12 BÀI — 42% */}
          <div className="hidden md:flex items-center gap-3">
            <span className="text-[11px] font-black text-slate-300 uppercase tracking-wider">
              TIẾN ĐỘ: {completedCount}/{allLessons.length} BÀI — {progressPercent}%
            </span>
            <div className="w-28 sm:w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Toggle Sidebar Button */}
          <button
            onClick={toggleSidebar}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
          >
            <Menu className="w-4 h-4" />
            <span>Chương trình</span>
          </button>

          {/* Quick Review Button in Header */}
          <button
            onClick={() => setTab('reviews')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'reviews'
                ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-black'
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 hover:text-amber-200'
            }`}
            title="Đánh giá khóa học"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="hidden sm:inline">Đánh giá</span>
          </button>

          {/* User Avatar Circle */}
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center border border-indigo-400/40 shadow-sm">
            N
          </div>
        </div>
      </header>

      {/* 2. MAIN 2-COLUMN LEARNING CONTAINER */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* LEFT COLUMN: VIDEO PLAYER + TABS + LESSON NAV BAR */}
          <div className="flex-1 w-full min-w-0 space-y-6">
            
            {/* Video Player */}
            <VideoPlayer
              activeLesson={activeLesson}
              onEnded={handleVideoEnded}
              onProgress90={handleProgress90}
              onTimeUpdate={setCurrentVideoTime}
            />

            {/* Classroom Tabs (Overview, QA, Notes, Resources) */}
            <ClassroomTabs
              course={course}
              activeLesson={activeLesson}
              activeTab={activeTab}
              onTabChange={setTab}
              currentVideoTime={currentVideoTime}
            />

            {/* Bottom Lesson Navigation Bar with Completion Toggle Button */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Prev Button */}
              <button
                onClick={handleGoPrev}
                disabled={!prevLesson}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-extrabold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Bài trước</span>
              </button>

              {/* Lesson Status Center */}
              <div className="text-center space-y-1 max-w-xs sm:max-w-md overflow-hidden px-2">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {activeLesson?.title || 'Bài học hiện tại'}
                </p>

                <div className="flex items-center justify-center gap-2">
                  <div className="w-24 h-1 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-300"
                      style={{
                        width: isActiveLessonCompleted ? '100%' : '0%',
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">
                    {isActiveLessonCompleted ? '100% hoàn thành' : '0% hoàn thành'}
                  </span>
                </div>
              </div>

              {/* Right Action Buttons Group: Mark Completed & Next */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                
                {/* REQUIREMENT 3: Mark Completed Button */}
                <button
                  onClick={handleToggleCurrentLesson}
                  className={`px-4 py-2.5 rounded-xl text-xs font-extrabold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-95 ${
                    isActiveLessonCompleted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800'
                  }`}
                >
                  {isActiveLessonCompleted ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Đã hoàn thành ✓</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-500" />
                      <span>Đánh dấu đã hoàn thành</span>
                    </>
                  )}
                </button>

                {/* Next Button */}
                <button
                  onClick={handleGoNext}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold inline-flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <span>Bài tiếp theo</span>
                  <ChevronRight className="w-4 h-4" />
                </button>

              </div>

            </div>

          </div>

          {/* RIGHT COLUMN: CURRICULUM SIDEBAR */}
          <CurriculumSidebar
            course={course}
            activeLessonId={String(activeLesson?.id || '')}
            completedLessonIds={(progress?.completedLessonIds || []).map(String)}
            isOpen={isSidebarOpen}
            onClose={toggleSidebar}
            onSelectLesson={selectLesson}
          />

        </div>
      </main>

      {/* REQUIREMENT 8: COURSE COMPLETION CONGRATULATORY MODAL */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200/90 max-w-md w-full p-6 text-center space-y-6 shadow-2xl relative overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setShowCompletionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Trophy Illustration Circle */}
            <div className="w-20 h-20 rounded-full bg-amber-100 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-md relative">
              <Trophy className="w-10 h-10" />
              <Sparkles className="w-5 h-5 text-amber-400 absolute -top-1 -right-1 animate-bounce" />
            </div>

            {/* Title & Message */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                🎉 Chúc mừng bạn đã hoàn thành khóa học!
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                Bạn đã xuất sắc hoàn tất 100% bài học trong khóa học{' '}
                <span className="font-bold text-slate-900">"{course.title}"</span>.
              </p>
            </div>

            {/* Stats Badge */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200/70 flex items-center justify-between text-xs font-bold text-emerald-900">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Tiến độ khóa học
              </span>
              <span className="text-emerald-700 font-black text-sm">100% Hoàn thành</span>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-2.5 pt-2">
              <button
                onClick={() => {
                  setShowCompletionModal(false);
                  setTab('reviews');
                }}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shadow-md shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Star className="w-4 h-4 fill-slate-950 text-slate-950" />
                <span>Đánh giá khóa học ngay</span>
              </button>

              <div className="flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={() => setShowCompletionModal(false)}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-extrabold transition-colors cursor-pointer"
                >
                  Xem lại bài học
                </button>

                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    navigate('/courses');
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Khám phá khóa khác</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
