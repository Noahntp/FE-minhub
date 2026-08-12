import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { apiFetch } from '@/shared/lib/api-client';
import { useApp } from '@/app/AppContext';
import {
  BookOpen,
  Trophy,
  Target,
  Clock,
  PlayCircle,
  Bookmark,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  Rocket,
  X,
  CheckCircle2,
  Sparkles,
  Loader2,
} from 'lucide-react';

const INITIAL_COURSES_DATA = [
  {
    id: 'react-19-nextjs-15',
    title: 'Chinh Phục React 19 & Next.js 15: Từ Cơ Bản Đến Cao Cấp',
    category: 'Lập trình',
    status: 'learning',
    badgeText: 'Đang học',
    badgeType: 'learning',
    instructorName: 'Dr. Lê Quốc Khánh',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    progress: 78,
    lessonsCount: 68,
    duration: '18h 30m',
    buttonText: 'Tiếp tục học',
    buttonBg: 'bg-[#0f172a] text-white hover:bg-slate-800',
    hasPlayIcon: true,
  },
  {
    id: 'ui-ux-design-full',
    title: 'UI/UX Design Toàn Diện Từ Cơ Bản Đến Nâng Cao',
    category: 'Thiết kế',
    status: 'learning',
    badgeText: 'Đang học',
    badgeType: 'learning',
    instructorName: 'Trần Minh Anh',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80',
    progress: 45,
    progressColor: 'bg-[#6366f1]',
    lessonsCount: 52,
    duration: '12h 10m',
    buttonText: 'Tiếp tục học',
    buttonBg: 'bg-[#6366f1] text-white hover:bg-indigo-600',
    hasPlayIcon: true,
  },
  {
    id: 'python-basic-beginner',
    title: 'Python Cơ Bản Cho Người Mới Bắt Đầu',
    category: 'Lập trình',
    status: 'completed',
    badgeText: 'Hoàn thành',
    badgeType: 'completed',
    instructorName: 'Phạm Hoàng Nam',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    progress: 100,
    lessonsCount: 40,
    duration: '10h 05m',
    buttonText: 'Xem lại khóa học',
    buttonBg: 'bg-[#10b981] text-white hover:bg-emerald-600',
    hasPlayIcon: false,
  },
  {
    id: 'graphic-design-ai-figma',
    title: 'Thiết Kế Đồ Họa Đột Phá với AI & Figma',
    category: 'Thiết kế',
    status: 'saved',
    badgeText: 'Đã lưu',
    badgeType: 'saved',
    instructorName: 'Sarah Nguyễn',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    progress: null,
    lessonsCount: 36,
    duration: '9h 20m',
    buttonText: 'Xem chi tiết',
    buttonBg: 'bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50',
    hasPlayIcon: false,
    isArrowButton: true,
  },
];

export default function MyCoursesPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'learning' | 'completed' | 'saved'>('learning');
  const [sortBy, setSortBy] = useState('updated');
  const [showGoalBanner, setShowGoalBanner] = useState(true);

  const [coursesData, setCoursesData] = useState<any[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(true);

  const { enrolledCourseIds = [], courses: globalCourses = [] } = useApp();

  // Fetch real enrolled courses from Backend API (/api/me/courses)
  useEffect(() => {
    const fetchCourses = async () => {
      setIsLoadingApi(true);
      let apiCourses: any[] = [];
      let isApiSuccess = false;

      const token = localStorage.getItem('mindhub_api_token');

      if (token) {
        try {
          const res = await apiFetch<any>('/me/courses');
          const rawList = Array.isArray(res) ? res : (res?.data || []);

          if (Array.isArray(rawList)) {
            isApiSuccess = true;
            apiCourses = rawList.map((item: any) => {
              const c = item.course || item;
              const progress = item.progress_percent !== null && item.progress_percent !== undefined
                ? Math.round(Number(item.progress_percent))
                : 0;
              const isCompleted = progress === 100 || item.status === 'completed';
              const courseId = String(c.id || c.slug || item.id);

              return {
                id: courseId,
                title: c.title || 'Khóa học đã đăng ký',
                category: c.category?.name || c.category || 'Lập trình',
                status: isCompleted ? 'completed' : 'learning',
                badgeText: isCompleted ? 'Hoàn thành' : 'Đang học',
                badgeType: isCompleted ? 'completed' : 'learning',
                instructorName: c.instructor?.full_name || c.instructor_name || 'Giảng viên MindHub',
                instructorAvatar: c.instructor?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
                thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
                progress: progress,
                lessonsCount: c.lessons_count || (c.total_duration_seconds ? Math.max(12, Math.round(c.total_duration_seconds / 900)) : 40),
                duration: c.total_duration_seconds
                  ? `${Math.floor(c.total_duration_seconds / 3600)}h ${Math.round((c.total_duration_seconds % 3600) / 60)}m`
                  : '12h 30m',
                buttonText: isCompleted ? 'Xem lại khóa học' : 'Tiếp tục học',
                buttonBg: isCompleted ? 'bg-[#10b981] text-white hover:bg-emerald-600' : 'bg-[#0f172a] text-white hover:bg-slate-800',
                hasPlayIcon: !isCompleted,
              };
            });
          }
        } catch (e) {
          console.warn('Backend courses API error:', e);
        }
      }

      if (isApiSuccess) {
        // Authenticated API user: Show strictly real database enrolled courses
        setCoursesData(apiCourses);
      } else {
        // Guest / Demo Mode fallback: read local storage demo data
        let localPurchasedCourses: any[] = [];
        try {
          const stored = localStorage.getItem('mindhub_purchased_courses_data');
          if (stored) localPurchasedCourses = JSON.parse(stored);
        } catch (err) {}

        let localEnrolledIds: string[] = [];
        try {
          const stored = localStorage.getItem('mindhub_enrolled_courses');
          if (stored) localEnrolledIds = JSON.parse(stored);
        } catch (err) {}

        const existingIds = new Set(apiCourses.map((c) => String(c.id)));
        const fallbackList: any[] = [];

        localPurchasedCourses.forEach((c) => {
          if (c && c.id && !existingIds.has(String(c.id))) {
            existingIds.add(String(c.id));
            fallbackList.push(c);
          }
        });

        const combined = [...apiCourses, ...fallbackList];
        setCoursesData(combined);
      }

      setIsLoadingApi(false);
    };

    fetchCourses();
  }, [enrolledCourseIds, globalCourses]);

  // Compute metrics
  const learningCount = useMemo(() => coursesData.filter((c) => c.status === 'learning').length, [coursesData]);
  const completedCount = useMemo(() => coursesData.filter((c) => c.status === 'completed').length, [coursesData]);
  const savedCount = useMemo(() => coursesData.filter((c) => c.status === 'saved').length, [coursesData]);

  // Filter list based on active tab
  const filteredCourses = useMemo(() => {
    if (activeTab === 'learning') {
      return coursesData.filter((c) => c.status === 'learning');
    }
    if (activeTab === 'completed') {
      return coursesData.filter((c) => c.status === 'completed');
    }
    if (activeTab === 'saved') {
      return coursesData.filter((c) => c.status === 'saved');
    }
    return coursesData;
  }, [activeTab, coursesData]);

  const displayedCourses = filteredCourses;

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* 1. Ultra-Premium Dark Hero Banner with Brand Emerald Theme & Integrated Live Stats */}
          <div className="relative bg-gradient-to-br from-[#022822] via-[#043e34] to-[#022822] text-white p-6 sm:p-8 lg:p-10 rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30">
            {/* Ambient Mesh Glows */}
            <div className="absolute -top-24 -left-24 w-80 h-80 bg-emerald-500/25 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-teal-400/25 rounded-full blur-[90px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
              
              {/* Left Column: Title & Description */}
              <div className="lg:col-span-7 space-y-4 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-md backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>HÀNH TRÌNH HỌC TẬP CỦA BẠN</span>
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    Khóa Học Của Tôi
                  </h1>
                  <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed max-w-xl">
                    Theo dõi tiến độ, tiếp tục các bài giảng dang dở và gặt hái chứng nhận hoàn thành tại MindHub.
                  </p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
                  >
                    <Rocket className="w-4 h-4" />
                    <span>Khám phá thêm khóa học mới</span>
                  </Link>
                </div>
              </div>

              {/* Right Column: Integrated Live Stats Widget */}
              <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left space-y-1 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Đang học</span>
                  </div>
                  <div className="text-2xl font-black text-white pt-1">{learningCount}</div>
                  <p className="text-[11px] text-slate-300 font-medium truncate">Khóa học active</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left space-y-1 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">Đã xong</span>
                  </div>
                  <div className="text-2xl font-black text-white pt-1">{completedCount}</div>
                  <p className="text-[11px] text-slate-300 font-medium truncate">Cấp chứng nhận</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left space-y-1 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-purple-500/20 text-purple-300">
                      <Target className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">Điểm XP</span>
                  </div>
                  <div className="text-2xl font-black text-white pt-1">{completedCount * 100 + learningCount * 25}</div>
                  <p className="text-[11px] text-slate-300 font-medium truncate">Học tập tích cực</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-left space-y-1 shadow-inner">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-xl bg-sky-500/20 text-sky-300">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300">Tổng giờ</span>
                  </div>
                  <div className="text-2xl font-black text-white pt-1">{learningCount * 15 + completedCount * 25}h</div>
                  <p className="text-[11px] text-slate-300 font-medium truncate">Thời gian học tập</p>
                </div>
              </div>

            </div>
          </div>

          {/* 3. Filter Tabs & Sort Control Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
            
            {/* Pill Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveTab('learning')}
                className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeTab === 'learning'
                    ? 'bg-[#0f172a] text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <PlayCircle className="w-4 h-4" />
                <span>Đang học ({learningCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('completed')}
                className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeTab === 'completed'
                    ? 'bg-[#0f172a] text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span>Đã hoàn thành ({completedCount})</span>
              </button>

              <button
                onClick={() => setActiveTab('saved')}
                className={`px-4 py-2 rounded-full text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeTab === 'saved'
                    ? 'bg-[#0f172a] text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Bookmark className="w-4 h-4" />
                <span>Đã lưu ({savedCount})</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0 ml-auto sm:ml-0">
              <button className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 hover:bg-slate-50 transition-colors">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <span>Mới cập nhật</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoadingApi && (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Đang tải danh sách khóa học của bạn...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoadingApi && displayedCourses.length === 0 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg">Chưa có khóa học nào</h3>
              <p className="text-xs text-slate-500 mt-1 mb-6 leading-relaxed">
                {activeTab === 'learning'
                  ? 'Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học chất lượng trên MindHub để nâng cao kỹ năng ngay hôm nay!'
                  : activeTab === 'completed'
                  ? 'Bạn chưa hoàn thành khóa học nào.'
                  : 'Bạn chưa lưu khóa học nào vào danh sách yêu thích.'}
              </p>
              <Link
                to="/courses"
                className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Khám phá khóa học ngay
              </Link>
            </div>
          )}

          {/* 4. Course Cards Grid (4 Columns Layout) */}
          {!isLoadingApi && displayedCourses.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {displayedCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow group text-left"
              >
                <div>
                  {/* Thumbnail & Top Badge */}
                  <div className="relative aspect-video overflow-hidden bg-slate-100">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge Pill Top-Left */}
                    <div className="absolute top-2.5 left-2.5">
                      {course.badgeType === 'learning' && (
                        <span className="px-2.5 py-1 rounded-full bg-white/95 text-slate-900 text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          {course.badgeText}
                        </span>
                      )}

                      {course.badgeType === 'completed' && (
                        <span className="px-2.5 py-1 rounded-full bg-white/95 text-emerald-700 text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          {course.badgeText}
                        </span>
                      )}

                      {course.badgeType === 'saved' && (
                        <span className="px-2.5 py-1 rounded-full bg-[#312e81] text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-sm">
                          <Bookmark className="w-3 h-3 text-white" />
                          {course.badgeText}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 space-y-3">
                    
                    {/* Category Tag Pill */}
                    <div>
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                        {course.category}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="font-extrabold text-slate-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
                      {course.title}
                    </h3>

                    {/* Instructor Info */}
                    <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                      <img
                        src={course.instructorAvatar}
                        alt={course.instructorName}
                        className="w-5 h-5 rounded-full object-cover border border-slate-200"
                      />
                      <span className="truncate">Giảng viên: <strong className="text-slate-700">{course.instructorName}</strong></span>
                    </div>

                    {/* Progress Bar (Learning & Completed) */}
                    {course.progress !== null && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between items-center text-[11px] font-extrabold">
                          <span className="text-slate-400">
                            {course.progress === 100 ? 'Đã hoàn thành' : 'Tiến độ'}
                          </span>
                          <span className={course.progress === 100 ? 'text-emerald-600' : 'text-slate-900'}>
                            {course.progress}%
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              course.progressColor || (course.progress === 100 ? 'bg-emerald-500' : 'bg-[#0f172a]')
                            }`}
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Card Footer (Meta + Action CTA) */}
                <div className="p-4 pt-0 space-y-3">
                  
                  {/* Meta stats */}
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      {course.lessonsCount} bài học
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {course.duration}
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => navigate(course.status === 'saved' ? `/courses/${course.id}` : `/learn/${course.id}`)}
                    className={`w-full py-2.5 rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs ${course.buttonBg}`}
                  >
                    <span>{course.buttonText}</span>
                    {course.hasPlayIcon && <PlayCircle className="w-3.5 h-3.5 fill-current" />}
                    {course.isArrowButton && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>

                </div>

              </div>
            ))}
          </div>
          )}

          {/* 5. Bottom Goal Setting Rocket Banner */}
          {showGoalBanner && (
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-left relative">
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0 text-2xl">
                  🚀
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                    Đặt mục tiêu – Giữ động lực – Học mỗi ngày!
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Thiết lập mục tiêu học tập để theo dõi tiến độ và nhận thêm phần thưởng hấp dẫn.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 ml-auto sm:ml-0">
                <button
                  onClick={() => navigate('/profile')}
                  className="px-5 py-2.5 rounded-2xl bg-[#0f172a] hover:bg-slate-800 text-white font-extrabold text-xs inline-flex items-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>Thiết lập mục tiêu</span>
                </button>

                <button
                  onClick={() => setShowGoalBanner(false)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </PageTransition>
  );
}
