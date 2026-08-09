import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { CountUpNumber } from '@/shared/components/ui/CountUpNumber';
import { roadmapsApi } from './api';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import {
  Map,
  Code2,
  Server,
  Database,
  Smartphone,
  Palette,
  Layers,
  Users,
  TrendingUp,
  ArrowRight,
  Bookmark,
  ChevronDown,
  LayoutGrid,
  Target,
  BookOpen,
  Trophy,
  Rocket,
  MessageSquare,
  Compass,
  Zap,
} from 'lucide-react';

export default function RoadmapsPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [bookmarkedIds, setBookmarkedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('mindhub_bookmarked_roadmaps');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  const toggleBookmark = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    setBookmarkedIds((prev) => {
      const updated = { ...prev, [id]: !prev[id] };
      try {
        localStorage.setItem('mindhub_bookmarked_roadmaps', JSON.stringify(updated));
      } catch (err) {}
      return updated;
    });
  };

  const [catalogCourses, setCatalogCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchApiData = async () => {
      try {
        const [courses, statsData] = await Promise.all([
          roadmapsApi.getCatalogCourses(),
          roadmapsApi.getStats(),
        ]);
        if (Array.isArray(courses) && courses.length > 0) {
          setCatalogCourses(courses);
        }
        if (statsData) {
          setStats(statsData);
        }
      } catch (e) {
        console.warn('Could not load catalog courses/stats for RoadmapsPage:', e);
      }
    };
    fetchApiData();
  }, []);

  const roadmapsList = [
    {
      id: 'frontend',
      title: 'Frontend Developer',
      category: 'frontend',
      description: 'Trở thành lập trình viên Frontend với React, Vue và các công nghệ web hiện đại.',
      icon: <Code2 className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-100 text-blue-600',
      themeBg: 'bg-blue-50/50 border-blue-100 hover:border-blue-200',
      lineColor: 'bg-blue-500',
      dotColor: 'bg-blue-500',
      linkColor: 'text-blue-600 hover:text-blue-700',
      coursesCount: '12 khóa học',
      duration: '6 tháng',
      level: 'Cơ bản đến nâng cao',
    },
    {
      id: 'backend',
      title: 'Backend Developer',
      category: 'backend',
      description: 'Xây dựng hệ thống backend mạnh mẽ với Node.js, Java, Microservices và System Design.',
      icon: <Server className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-100 text-emerald-600',
      themeBg: 'bg-emerald-50/50 border-emerald-100 hover:border-emerald-200',
      lineColor: 'bg-emerald-500',
      dotColor: 'bg-emerald-500',
      linkColor: 'text-emerald-600 hover:text-emerald-700',
      coursesCount: '15 khóa học',
      duration: '8 tháng',
      level: 'Cơ bản đến nâng cao',
    },
    {
      id: 'data',
      title: 'Data Engineering',
      category: 'data',
      description: 'Xử lý dữ liệu lớn, xây dựng Data Pipeline với Python, SQL và Spark.',
      icon: <Database className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-100 text-purple-600',
      themeBg: 'bg-purple-50/50 border-purple-100 hover:border-purple-200',
      lineColor: 'bg-purple-500',
      dotColor: 'bg-purple-500',
      linkColor: 'text-purple-600 hover:text-purple-700',
      coursesCount: '10 khóa học',
      duration: '5 tháng',
      level: 'Cơ bản đến nâng cao',
    },
    {
      id: 'mobile',
      title: 'Mobile Developer',
      category: 'mobile',
      description: 'Phát triển ứng dụng di động đa nền tảng với React Native và Flutter.',
      icon: <Smartphone className="w-5 h-5 text-orange-600" />,
      iconBg: 'bg-orange-100 text-orange-600',
      themeBg: 'bg-orange-50/50 border-orange-100 hover:border-orange-200',
      lineColor: 'bg-orange-500',
      dotColor: 'bg-orange-500',
      linkColor: 'text-orange-600 hover:text-orange-700',
      coursesCount: '8 khóa học',
      duration: '4 tháng',
      level: 'Cơ bản đến nâng cao',
    },
    {
      id: 'uiux',
      title: 'UI/UX Designer',
      category: 'uiux',
      description: 'Thiết kế trải nghiệm người dùng ấn tượng với Figma, Design System và User Research.',
      icon: <Palette className="w-5 h-5 text-teal-600" />,
      iconBg: 'bg-teal-100 text-teal-600',
      themeBg: 'bg-teal-50/50 border-teal-100 hover:border-teal-200',
      lineColor: 'bg-teal-500',
      dotColor: 'bg-teal-500',
      linkColor: 'text-teal-600 hover:text-teal-700',
      coursesCount: '9 khóa học',
      duration: '4 tháng',
      level: 'Cơ bản đến nâng cao',
    },
    {
      id: 'fullstack',
      title: 'Fullstack Developer',
      category: 'fullstack',
      description: 'Làm chủ cả Frontend và Backend để trở thành Fullstack Developer toàn diện.',
      icon: <Layers className="w-5 h-5 text-rose-600" />,
      iconBg: 'bg-rose-100 text-rose-600',
      themeBg: 'bg-rose-50/50 border-rose-100 hover:border-rose-200',
      lineColor: 'bg-rose-500',
      dotColor: 'bg-rose-500',
      linkColor: 'text-rose-600 hover:text-rose-700',
      coursesCount: '20 khóa học',
      duration: '10 tháng',
      level: 'Cơ bản đến nâng cao',
    },
  ];

  const dynamicRoadmapsList = useMemo(() => {
    return roadmapsList.map((item) => {
      const realMatches = catalogCourses.filter((c: any) => {
        const catName = String(c.category?.name || c.category || c.category_slug || '').toLowerCase();
        const titleStr = String(c.title || '').toLowerCase();
        return catName.includes(item.category) || titleStr.includes(item.category) || catName.includes(item.id);
      });

      const count = realMatches.length > 0 ? realMatches.length : parseInt(item.coursesCount);
      return {
        ...item,
        coursesCount: `${count} khóa học`,
      };
    });
  }, [catalogCourses]);

  const filteredRoadmaps =
    activeCategory === 'all'
      ? dynamicRoadmapsList
      : dynamicRoadmapsList.filter((item) => item.category === activeCategory);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
          
          {/* 1. Hero Section & Path Illustration Background */}
          <div className="relative rounded-3xl p-6 sm:p-10 border border-slate-800 bg-slate-950 text-white shadow-2xl overflow-hidden text-left">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl pointer-events-none -z-0" />
            <div className="absolute bottom-0 right-10 w-80 h-80 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-0" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              
              {/* Left Content (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs font-bold shadow-sm">
                  <Compass className="w-4 h-4 text-blue-400 animate-spin-slow" />
                  <span>LỘ TRÌNH CHUẨN DOANH NGHIỆP 2026</span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-white">
                    Lộ trình học tập{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-300">
                      chuyên nghiệp
                    </span>
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-xl font-normal">
                    Các lộ trình được thiết kế bởi chuyên gia hàng đầu, giúp bạn đi từ con số 0 tới thành thạo và sẵn sàng cho công việc mơ ước.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <button
                    onClick={() => {
                      const el = document.getElementById('roadmaps-grid');
                      el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
                  >
                    <span>Khám phá lộ trình</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => navigate('/contact')}
                    className="px-5 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-blue-300 font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 active:scale-95 transition-all shadow-inner"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                    <span>Tư vấn chọn lộ trình</span>
                  </button>
                </div>

                {/* Metrics Stats Badge Bar */}
                <div className="pt-5 border-t border-slate-800/80 grid grid-cols-3 gap-3 text-left max-w-lg">
                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-inner">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                      <Map className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-black text-white">
                        {stats?.total_roadmaps || stats?.total_courses || '12'}+
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Lộ trình học tập</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-inner">
                    <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-black text-emerald-400">
                        <CountUpNumber target={stats?.total_students || 25000} suffix="+" />
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Học viên tham gia</div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3 shadow-inner">
                    <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-base sm:text-lg font-black text-cyan-400">
                        {stats?.completion_rate ? `${stats.completion_rate}%` : '92%'}
                      </div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium">Tỷ lệ hoàn thành</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Winding Path Graphic (5 cols) */}
              <div className="lg:col-span-5 hidden lg:flex justify-center relative">
                <div className="relative w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-5 border border-slate-800 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-mono font-bold text-blue-300">CareerPath.roadmap</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">VERIFIED</span>
                  </div>

                  <div className="space-y-2.5 relative">
                    {/* Winding Connection Line aligned with circle centers */}
                    <div className="absolute left-[23.5px] top-6 bottom-6 -translate-x-1/2 w-0.5 bg-gradient-to-b from-blue-500 via-indigo-500 to-emerald-500 opacity-60 z-0 pointer-events-none" />

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 relative z-10">
                      <span className="w-7 h-7 rounded-full bg-slate-950 text-blue-400 text-xs font-bold flex items-center justify-center border border-blue-500/60 shrink-0 shadow-md">1</span>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-bold text-white">Nền tảng & Tư duy Lập trình</p>
                        <p className="text-[11px] text-slate-400">HTML5, CSS3, JavaScript ES6+, Git</p>
                      </div>
                      <Code2 className="w-4 h-4 text-blue-400 shrink-0" />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 relative z-10">
                      <span className="w-7 h-7 rounded-full bg-slate-950 text-indigo-400 text-xs font-bold flex items-center justify-center border border-indigo-500/60 shrink-0 shadow-md">2</span>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-bold text-white">Chuyên sâu Frontend / Backend</p>
                        <p className="text-[11px] text-slate-400">React.js, Next.js, Node.js / Laravel</p>
                      </div>
                      <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3 relative z-10">
                      <span className="w-7 h-7 rounded-full bg-slate-950 text-cyan-400 text-xs font-bold flex items-center justify-center border border-cyan-500/60 shrink-0 shadow-md">3</span>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-bold text-white">Dự án Doanh nghiệp Capstone</p>
                        <p className="text-[11px] text-slate-400">Xây dựng ứng dụng hoàn chỉnh ghi CV</p>
                      </div>
                      <Rocket className="w-4 h-4 text-cyan-400 shrink-0" />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/50 flex items-center gap-3 relative z-10 shadow-lg shadow-emerald-500/10">
                      <span className="w-7 h-7 rounded-full bg-slate-950 text-emerald-400 text-xs font-bold flex items-center justify-center border border-emerald-500/80 shrink-0 shadow-md">4</span>
                      <div className="flex-1 text-left">
                        <p className="text-xs font-bold text-emerald-300">Nhận việc & Tốt nghiệp</p>
                        <p className="text-[11px] text-slate-400">Phỏng vấn thử & Nhận hỗ trợ việc làm</p>
                      </div>
                      <Trophy className="w-4 h-4 text-emerald-400 shrink-0 animate-bounce" />
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 2. Filter Category Tabs & Sort Control Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            
            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeCategory === 'all'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Tất cả</span>
              </button>

              <button
                onClick={() => setActiveCategory('frontend')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeCategory === 'frontend'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Frontend</span>
              </button>

              <button
                onClick={() => setActiveCategory('backend')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeCategory === 'backend'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                <span>Backend</span>
              </button>

              <button
                onClick={() => setActiveCategory('data')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeCategory === 'data'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Database className="w-3.5 h-3.5" />
                <span>Data</span>
              </button>

              <button
                onClick={() => setActiveCategory('mobile')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeCategory === 'mobile'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Mobile</span>
              </button>

              <button
                onClick={() => setActiveCategory('uiux')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all ${
                  activeCategory === 'uiux'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                <span>UI/UX</span>
              </button>
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0 ml-auto sm:ml-0 flex items-center gap-2 text-xs font-bold text-slate-500">
              <span>Sắp xếp:</span>
              <button className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-extrabold text-slate-800 flex items-center gap-2 hover:bg-slate-50 transition-colors">
                <span>Phổ biến nhất</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

          </div>

          {/* 3. Roadmap Cards Grid (3 Columns Layout) */}
          <div id="roadmaps-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredRoadmaps.map((item) => {
              const isBookmarked = !!bookmarkedIds[item.id];
              return (
                <Link
                  key={item.id}
                  to={`/roadmaps/${item.id}`}
                  className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col justify-between space-y-6 group relative ${item.themeBg}`}
                >
                  <div className="space-y-4">
                    
                    {/* Header Row: Icon & Bookmark */}
                    <div className="flex items-center justify-between">
                      <div className={`p-3 rounded-2xl ${item.iconBg} shrink-0`}>
                        {item.icon}
                      </div>

                      <button
                        onClick={(e) => toggleBookmark(e, item.id)}
                        className={`p-2 rounded-xl transition-colors ${
                          isBookmarked ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-300 hover:text-slate-500 hover:bg-white/80'
                        }`}
                      >
                        <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed font-medium mt-1.5 line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    {/* Badges / Tags Bar */}
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-extrabold text-slate-600">
                      <span className="px-2.5 py-1 bg-white/90 rounded-full border border-slate-200/60 shadow-2xs">
                        {item.coursesCount}
                      </span>
                      <span className="px-2.5 py-1 bg-white/90 rounded-full border border-slate-200/60 shadow-2xs">
                        {item.duration}
                      </span>
                      <span className="px-2.5 py-1 bg-white/90 rounded-full border border-slate-200/60 shadow-2xs">
                        {item.level}
                      </span>
                    </div>

                    {/* Step Milestone Timeline Graphic */}
                    <div className="pt-2">
                      <div className="relative flex items-center justify-between text-[10px] font-extrabold text-slate-400 px-1">
                        
                        {/* Connecting Line */}
                        <div className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-0.5 bg-slate-200">
                          <div className={`h-full w-full ${item.lineColor}`}></div>
                        </div>

                        {/* Step 1: Nền tảng */}
                        <div className="relative z-10 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-700 shadow-2xs">
                          <span className={`w-2 h-2 rounded-full ${item.dotColor}`}></span>
                          <span>Nền tảng</span>
                        </div>

                        {/* Step 2: Dự án */}
                        <div className="relative z-10 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-700 shadow-2xs">
                          <span className={`w-2 h-2 rounded-full ${item.dotColor}`}></span>
                          <span>Dự án</span>
                        </div>

                        {/* Step 3: Nâng cao */}
                        <div className="relative z-10 flex items-center gap-1 bg-white px-2 py-0.5 rounded-full border border-slate-200 text-slate-700 shadow-2xs">
                          <span className={`w-2 h-2 rounded-full ${item.dotColor}`}></span>
                          <span>Nâng cao</span>
                        </div>

                      </div>
                    </div>

                  </div>

                  {/* Bottom Action Link */}
                  <div className="pt-2 border-t border-slate-200/50">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-extrabold transition-colors ${item.linkColor}`}>
                      <span>Xem lộ trình</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>

                </Link>
              );
            })}
          </div>

          {/* 4. Cách hoạt động (3 Step Cards) */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 text-center">
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Cách hoạt động
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left relative">
              
              {/* Step 1 */}
              <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
                  <Target className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-blue-600 bg-blue-100/80 px-2 py-0.5 rounded-full">1</span>
                    <h3 className="font-extrabold text-slate-900 text-sm">Chọn mục tiêu</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Chọn lộ trình phù hợp với mục tiêu và trình độ hiện tại của bạn.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="bg-emerald-50/60 p-5 rounded-2xl border border-emerald-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-emerald-600 bg-emerald-100/80 px-2 py-0.5 rounded-full">2</span>
                    <h3 className="font-extrabold text-slate-900 text-sm">Học theo roadmap</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Học theo từng giai đoạn, hoàn thành bài tập và dự án thực tế.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="bg-amber-50/60 p-5 rounded-2xl border border-amber-100 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black text-sm shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-amber-600 bg-amber-100/80 px-2 py-0.5 rounded-full">3</span>
                    <h3 className="font-extrabold text-slate-900 text-sm">Hoàn thành dự án</h3>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">
                    Xây dựng dự án cuối khóa để củng cố kiến thức và tạo portfolio.
                  </p>
                </div>
              </div>

            </div>

          </div>

          {/* 5. Bottom CTA Banner */}
          <div className="bg-[#0b132b] text-white p-8 sm:p-10 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 text-left relative overflow-hidden">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Sẵn sàng bắt đầu hành trình của bạn?
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                Tham gia cùng hàng ngàn học viên và chinh phục kỹ năng mới mỗi ngày.
              </p>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById('roadmaps-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs sm:text-sm whitespace-nowrap shadow-md active:scale-95 transition-all shrink-0 inline-flex items-center gap-2"
            >
              <span>Bắt đầu học ngay</span>
              <Rocket className="w-4 h-4 text-blue-600" />
            </button>
          </div>

        </div>
      </div>
    </PageTransition>
  );
}
