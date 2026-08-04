import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Share2,
  Users,
  BookOpen,
  Clock,
  Award,
  Layers,
  Star,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Code2,
  FileText,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';

// Detailed data for roadmap detail view
const ROADMAP_DATA = {
  frontend: {
    title: 'Frontend Developer',
    description:
      'Lộ trình học Frontend từ cơ bản đến nâng cao, giúp bạn xây dựng giao diện web chuyên nghiệp và sẵn sàng đi làm.',
    stats: {
      stagesCount: 5,
      coursesCount: 12,
      lessonsCount: 168,
      totalHours: '120 giờ',
      level: 'Beginner → Advanced',
    },
    overallProgress: 42,
    progressDetails: {
      completedCourses: '3/12',
      completedStages: '2/5',
      completedLessons: '71/168',
      totalTimeSpent: '60 giờ 30 phút',
      lastStudied: '30/05/2024',
    },
    nextCourse: {
      id: 'css3-styling',
      title: 'CSS3 Styling',
      currentLesson: 'Bài 19: Flexbox cơ bản',
      iconBg: 'bg-blue-600',
    },
    stages: [
      {
        id: 1,
        title: 'Kiến thức nền tảng',
        description: 'Tìm hiểu về Web, Internet và các công nghệ nền tảng.',
        completedCount: 2,
        totalCount: 2,
        progressPercent: 100,
        courses: [
          {
            id: 'web-basics',
            title: 'Internet & Web Basics',
            duration: '2 giờ 30 phút',
            lessons: 15,
            level: 'Beginner',
            status: 'completed',
            rating: 4.7,
            students: '12.4K',
            badgeBg: 'bg-purple-100 text-purple-600',
            badgeText: 'WWW',
          },
          {
            id: 'html5-fundamentals',
            title: 'HTML5 Fundamentals',
            duration: '6 giờ 45 phút',
            lessons: 32,
            level: 'Beginner',
            status: 'completed',
            rating: 4.8,
            students: '18.6K',
            badgeBg: 'bg-orange-500 text-white font-black text-xs',
            badgeText: 'HTML 5',
          },
        ],
      },
      {
        id: 2,
        title: 'HTML, CSS và JavaScript',
        description: 'Xây dựng nền tảng vững chắc với HTML, CSS và JavaScript.',
        completedCount: 1,
        totalCount: 3,
        progressPercent: 40,
        courses: [
          {
            id: 'css3-styling',
            title: 'CSS3 Styling',
            duration: '8 giờ 15 phút',
            lessons: 36,
            level: 'Beginner',
            status: 'in-progress',
            progressPercent: 60,
            rating: 4.9,
            students: '22.1K',
            badgeBg: 'bg-blue-600 text-white font-black text-xs',
            badgeText: 'CSS 3',
          },
          {
            id: 'js-basic-advanced',
            title: 'JavaScript Basic to Advanced',
            duration: '12 giờ 40 phút',
            lessons: 68,
            level: 'Beginner',
            status: 'start',
            rating: 4.8,
            students: '25.3K',
            badgeBg: 'bg-amber-400 text-slate-900 font-black text-xs',
            badgeText: 'JS',
          },
          {
            id: 'dom-bom',
            title: 'DOM & BOM',
            duration: '4 giờ 30 phút',
            lessons: 18,
            level: 'Intermediate',
            status: 'start',
            rating: 4.6,
            students: '9.8K',
            badgeBg: 'bg-indigo-600 text-white font-bold text-[10px]',
            badgeText: 'DOM',
          },
        ],
      },
      {
        id: 3,
        title: 'Frontend Framework',
        description: 'Làm chủ các framework hiện đại như React.',
        completedCount: 0,
        totalCount: 3,
        progressPercent: 0,
        courses: [
          {
            id: 'react-zero-hero',
            title: 'React.js From Zero to Hero',
            duration: '18 giờ 20 phút',
            lessons: 82,
            level: 'Intermediate',
            status: 'not-started',
            rating: 4.9,
            students: '31.2K',
            badgeBg: 'bg-sky-500 text-white font-bold text-[10px]',
            badgeText: 'REACT',
          },
        ],
      },
      {
        id: 4,
        title: 'Quản lý State & API',
        description: 'Tương tác với REST API, GraphQL và quản lý state tập trung.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'redux-zustand',
            title: 'State Management with Redux Toolkit',
            duration: '9 giờ 15 phút',
            lessons: 40,
            level: 'Advanced',
            status: 'not-started',
            rating: 4.8,
            students: '15.4K',
            badgeBg: 'bg-purple-600 text-white font-bold text-[10px]',
            badgeText: 'REDUX',
          },
        ],
      },
      {
        id: 5,
        title: 'Testing & Deployment',
        description: 'Viết Unit Test, E2E Test và triển khai sản phẩm thực tế.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'testing-deployment',
            title: 'Vitest & CI/CD Deployment',
            duration: '7 giờ 30 phút',
            lessons: 30,
            level: 'Advanced',
            status: 'not-started',
            rating: 4.7,
            students: '8.2K',
            badgeBg: 'bg-emerald-600 text-white font-bold text-[10px]',
            badgeText: 'TEST',
          },
        ],
      },
    ],
  },
};

export default function RoadmapDetailPage() {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const roadmap =
    ROADMAP_DATA[roadmapId as keyof typeof ROADMAP_DATA] || ROADMAP_DATA.frontend;

  // Track expanded accordion stages
  const [openStages, setOpenStages] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: false,
    5: false,
  });

  const toggleStage = (stageId: number) => {
    setOpenStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Đã chép liên kết lộ trình vào bộ nhớ tạm!');
  };

  return (
    <PageTransition>
      <div className="w-full bg-slate-50/60 min-h-screen py-6 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
        
        {/* CENTERED CONTAINER */}
        <div className="max-w-7xl mx-auto space-y-6">

          {/* 1. BREADCRUMB */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/roadmaps" className="hover:text-primary transition-colors">
              Lộ trình
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">{roadmap.title}</span>
          </nav>

          {/* 2. HERO HEADER BANNER CARD */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm relative overflow-hidden">
            {/* Background subtle mesh grid / decorative light blob */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl -z-0 pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
              
              {/* Left Column: Information & Actions */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                    <Code2 className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                      {roadmap.title}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
                      {roadmap.description}
                    </p>
                  </div>
                </div>

                {/* Badges Row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
                    <Users className="w-3.5 h-3.5 text-slate-500" />
                    <span>{roadmap.stats.stagesCount} Chặng học</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>{roadmap.stats.coursesCount} Khóa học</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>{roadmap.stats.lessonsCount} Bài học</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>{roadmap.stats.totalHours} Thời lượng</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{roadmap.stats.level} Cấp độ</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={() => navigate('/courses/css3-styling')}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <PlayCircle className="w-4 h-4 fill-white text-emerald-500" />
                    <span>Tiếp tục học</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-slate-500" />
                    <span>Chia sẻ lộ trình</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Illustration Mockup */}
              <div className="lg:col-span-5 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-4 shadow-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
                  
                  {/* Floating badges overlay matching image design */}
                  <div className="absolute top-3 left-3 bg-orange-500 text-white font-black text-[11px] px-2.5 py-1 rounded-md shadow-md animate-bounce">
                    HTML
                  </div>
                  <div className="absolute top-12 left-2 bg-blue-500 text-white font-black text-[11px] px-2.5 py-1 rounded-md shadow-md">
                    CSS
                  </div>
                  <div className="absolute top-20 left-4 bg-amber-400 text-slate-900 font-black text-[11px] px-2.5 py-1 rounded-md shadow-md">
                    JS
                  </div>

                  {/* Window Controls Topbar */}
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-slate-400 font-mono ml-2">app.tsx — MindHub</span>
                  </div>

                  {/* Laptop Mock Code Content */}
                  <div className="font-mono text-[11px] space-y-1.5 text-slate-300 py-3 px-2">
                    <div className="flex gap-2">
                      <span className="text-slate-600">1</span>
                      <span><span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> <span className="text-emerald-300">'react'</span>;</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-slate-600">2</span>
                      <span><span className="text-blue-400">function</span> <span className="text-yellow-300">FrontendDev</span>() &#123;</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-slate-600">3</span>
                      <span className="pl-4 text-slate-400">// Build modern web interfaces</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-slate-600">4</span>
                      <span className="pl-4"><span className="text-purple-400">return</span> &lt;<span className="text-pink-400">Roadmap</span> status=<span className="text-emerald-300">"ready"</span> /&gt;;</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-slate-600">5</span>
                      <span>&#125;</span>
                    </div>
                  </div>

                  {/* Bottom Bar */}
                  <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 px-1">
                    <span className="flex items-center gap-1 text-emerald-400"><Sparkles className="w-3 h-3" /> Ready for job</span>
                    <span>100% React + TS</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 3. TWO-COLUMN MAIN CONTENT (LEFT: TIMELINE STAGES, RIGHT: SIDEBAR SUMMARY) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: Các chặng trong lộ trình */}
            <div className="lg:col-span-8 space-y-6">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Các chặng trong lộ trình
              </h2>

              {/* Accordion List */}
              <div className="space-y-4">
                {roadmap.stages.map((stage) => {
                  const isOpen = !!openStages[stage.id];

                  return (
                    <div
                      key={stage.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
                    >
                      {/* Accordion Header */}
                      <div
                        onClick={() => toggleStage(stage.id)}
                        className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Number Badge */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${
                            stage.progressPercent === 100
                              ? 'bg-emerald-500 text-white'
                              : stage.progressPercent > 0
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {stage.id}
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-base font-extrabold text-slate-900">
                              {stage.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                              {stage.description}
                            </p>
                          </div>
                        </div>

                        {/* Right side status progress & toggle icon */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <span className="text-xs font-bold text-slate-600">
                              {stage.completedCount}/{stage.totalCount} khóa học • {stage.progressPercent}%
                            </span>
                            <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  stage.progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${stage.progressPercent}%` }}
                              />
                            </div>
                          </div>

                          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Accordion Body: Course List */}
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3">
                          {stage.courses.map((course) => (
                            <div
                              key={course.id}
                              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-start gap-3.5">
                                {/* Course Badge Icon */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${course.badgeBg}`}>
                                  {course.badgeText}
                                </div>

                                <div className="space-y-1">
                                  <h4 className="text-sm font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer" onClick={() => navigate(`/courses/${course.id}`)}>
                                    {course.title}
                                  </h4>
                                  
                                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                                    <span>{course.duration}</span>
                                    <span>•</span>
                                    <span>{course.lessons} bài học</span>
                                    <span>•</span>
                                    <span>{course.level}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Course Right Action & Rating */}
                              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                                
                                {/* Status Pill / Button */}
                                {course.status === 'completed' && (
                                  <span className="px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-bold border border-emerald-200/80">
                                    Hoàn thành
                                  </span>
                                )}

                                {course.status === 'in-progress' && (
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                      Đang học
                                    </span>
                                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-600 rounded-full"
                                        style={{ width: `${course.progressPercent || 50}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{course.progressPercent}%</span>
                                  </div>
                                )}

                                {course.status === 'start' && (
                                  <button
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                    className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Bắt đầu học
                                  </button>
                                )}

                                {course.status === 'not-started' && (
                                  <button
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                    className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Chưa bắt đầu
                                  </button>
                                )}

                                {/* Rating & Students */}
                                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                                  <span className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                    {course.rating}
                                  </span>
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <Users className="w-3.5 h-3.5" />
                                    {course.students}
                                  </span>
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: SIDEBAR SUMMARY (CANH GIỮA & DỄ NHÌN) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
              
              {/* CARD 1: TỔNG QUAN LỘ TRÌNH */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Tổng quan lộ trình
                </h3>

                {/* Circular Progress Gauge */}
                <div className="flex items-center gap-4 py-2">
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500"
                        strokeDasharray={`${roadmap.overallProgress}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-base font-black text-slate-900">
                      {roadmap.overallProgress}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">Tiến độ hoàn thành</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Cố gắng lên! Bạn đang học rất tốt.
                    </p>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <div className="text-xs sm:text-sm font-black text-slate-900">
                      {roadmap.progressDetails.completedCourses}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                      Khóa học hoàn thành
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl">
                    <div className="text-xs sm:text-sm font-black text-slate-900">
                      {roadmap.progressDetails.completedStages}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                      Chặng học hoàn thành
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl">
                    <div className="text-xs sm:text-sm font-black text-slate-900">
                      {roadmap.progressDetails.completedLessons}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                      Bài học đã hoàn thành
                    </div>
                  </div>
                </div>

                {/* Time & Last Studied Footer */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
                  <div>
                    <div className="font-extrabold text-slate-900">
                      {roadmap.progressDetails.totalTimeSpent}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Tổng thời gian học</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-slate-900">
                      {roadmap.progressDetails.lastStudied}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Học gần nhất</div>
                  </div>
                </div>

              </div>

              {/* CARD 2: KHÓA HỌC TIẾP THEO */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Khóa học tiếp theo
                </h3>

                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                    CSS3
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">
                      {roadmap.nextCourse.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {roadmap.nextCourse.currentLesson}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/courses/css3-styling')}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-blue-600 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Tiếp tục học</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* CARD 3: DANH SÁCH CHẶNG */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Danh sách chặng
                </h3>

                <div className="space-y-2.5 text-xs font-semibold">
                  {roadmap.stages.map((stg) => (
                    <div
                      key={stg.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            stg.progressPercent === 100
                              ? 'bg-emerald-500 text-white'
                              : stg.progressPercent > 0
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {stg.id}
                        </span>
                        <span className="text-slate-700 font-bold truncate">{stg.title}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold ${
                          stg.progressPercent === 100
                            ? 'text-emerald-600'
                            : stg.progressPercent > 0
                            ? 'text-blue-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {stg.progressPercent}%
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const el = document.querySelector('h2');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center transition-colors cursor-pointer mt-2"
                >
                  Xem toàn bộ lộ trình
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </PageTransition>
  );
}

