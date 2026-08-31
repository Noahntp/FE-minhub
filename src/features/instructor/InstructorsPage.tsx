import React, { useState, useEffect, useLayoutEffect, useMemo } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, Users, BookOpen, CheckCircle2, Sparkles, ChevronLeft, ChevronRight, Filter, Award, ShieldCheck, UserPlus, ArrowRight, Tag, X } from 'lucide-react';
import { Input } from '@/shared/components/ui/input';
import { Button } from '@/shared/components/ui/button';
import { apiFetch } from '@/shared/lib/api-client';
import { resolveMediaUrl } from '@/shared/utils/format';

interface Instructor {
  id: string | number;
  name: string;
  title: string;
  avatar: string;
  rating: number;
  students: number;
  coursesCount: number;
  tags: string[];
}

const FALLBACK_INSTRUCTORS: Instructor[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    title: "Senior Fullstack & Cloud Architect",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80",
    rating: 4.9,
    students: 12300,
    coursesCount: 8,
    tags: ["Node.js", "System Design", "AWS", "Docker"]
  },
  {
    id: "2",
    name: "Trần Thị B",
    title: "Lead UI/UX & AI Product Mentor",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80",
    rating: 4.8,
    students: 8400,
    coursesCount: 5,
    tags: ["Figma", "UI/UX", "Design System", "Framer"]
  },
  {
    id: "3",
    name: "Lê Hoàng C",
    title: "Google Developer Expert & React Lead",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80",
    rating: 5.0,
    students: 15200,
    coursesCount: 12,
    tags: ["React 19", "Next.js 15", "TypeScript", "Performance"]
  }
];

const ITEMS_PER_PAGE = 6;

export default function InstructorsPage() {
  const navigate = useNavigate();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [currentPage]);

  // Fetch real API data
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const fetchInstructors = async () => {
      let rawList: any[] = [];

      try {
        const res = await apiFetch<any>('/instructors');
        rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      } catch (err1) {
        try {
          const res = await apiFetch<any>('/instructors/featured');
          rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        } catch (err2) {
          try {
            const res = await apiFetch<any>('/home');
            rawList = Array.isArray(res?.featured_instructors) ? res.featured_instructors : [];
          } catch (err3) {
            rawList = [];
          }
        }
      }

      if (!isMounted) return;

      if (rawList.length > 0) {
        const mapped: Instructor[] = rawList.map((item: any, idx: number) => {
          const rawAvatar = item.avatar_url || item.avatar || item.image;
          const avatarUrl = rawAvatar ? resolveMediaUrl(rawAvatar) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
          const rawExpertise = item.instructor_profile?.expertise || item.expertise || item.bio || item.headline;
          const parsedTags = rawExpertise
            ? String(rawExpertise).split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)
            : ['Fullstack', 'Web Development'];

          return {
            id: item.id || `inst-${idx}`,
            name: item.full_name || item.name || item.instructor_name || 'Giảng viên MindHub',
            title: item.instructor_profile?.headline || item.headline || (parsedTags.length > 0 ? parsedTags.join(' • ') : 'Giảng viên chuyên môn'),
            avatar: avatarUrl,
            rating: Number(item.average_rating || item.rating || 5.0),
            students: Number(item.total_enrollments_count ?? item.total_students ?? 0),
            coursesCount: Number(item.published_courses_count ?? item.courses_count ?? (Array.isArray(item.published_courses) ? item.published_courses.length : (Array.isArray(item.courses) ? item.courses.length : 0))),
            tags: parsedTags,
          };
        });

        setInstructors(mapped);
      } else {
        setInstructors(FALLBACK_INSTRUCTORS);
      }
      setIsLoading(false);
    };

    fetchInstructors();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter instructors by search query
  const filteredInstructors = useMemo(() => {
    if (!searchQuery.trim()) return instructors;
    const q = searchQuery.toLowerCase().trim();
    return instructors.filter((inst) =>
      inst.name.toLowerCase().includes(q) ||
      inst.title.toLowerCase().includes(q) ||
      inst.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [instructors, searchQuery]);

  // Reset pagination on search query change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredInstructors.length / ITEMS_PER_PAGE) || 1;
  const paginatedInstructors = filteredInstructors.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50 pb-20">
        
        {/* Top Header Banner with Creative 3D Visual & Glassmorphism Search */}
        <div className="relative bg-gradient-to-r from-[#022822] via-[#043e34] to-[#022822] text-white p-6 sm:p-10 lg:p-12 rounded-b-3xl shadow-2xl overflow-hidden border-b border-emerald-500/30">
          {/* Ambient Decorative Mesh & Light Glows */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/25 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/25 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:30px_30px] opacity-20 pointer-events-none" />

          <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Headline & Search Box */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-lg backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>ĐỘI NGŨ CHUYÊN GIA HÀNG ĐẦU</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Đội Ngũ Giảng Viên <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                    Thực Chiến & Tâm Huyết
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed max-w-xl">
                  Học trực tiếp từ những chuyên gia nhiều năm kinh nghiệm thực chiến tại các tập đoàn công nghệ lớn.
                </p>
              </div>

              {/* Prominent Glassmorphic Search Input Box */}
              <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tìm kiếm chuyên gia & kỹ năng</span>
                  </label>
                  <span className="text-[11px] text-emerald-300/80 font-medium">100% Giảng viên đã xác minh</span>
                </div>

                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên giảng viên, chuyên môn (Laravel, React, AI...)"
                    className="w-full pl-4 pr-10 py-3 bg-white rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner font-semibold placeholder:text-slate-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Popular Search Skill Tag Pills */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold mr-1">
                    <Tag className="w-3 h-3 text-amber-300" />
                    <span>Chuyên môn hot:</span>
                  </div>
                  {['ReactJS', 'Laravel', 'System Design', 'Python AI', 'UI/UX', 'DevOps'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSearchQuery(tag)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-500 hover:text-white text-emerald-200 border border-emerald-500/30 text-[11px] font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlights / Quick Trust Badges */}
              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-emerald-100 font-medium">
                <div className="flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 backdrop-blur-sm shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Xác thực profile 100%</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 backdrop-blur-sm shadow-sm">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>10+ Năm kinh nghiệm</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 backdrop-blur-sm shadow-sm">
                  <Users className="w-4 h-4 text-teal-300" />
                  <span>Hỗ trợ Q&A 1:1 tận tâm</span>
                </div>
              </div>
            </div>

            {/* Right Column: Instructor Graphic & Floating Stats */}
            <div className="lg:col-span-5 hidden lg:flex justify-center relative">
              <div className="relative w-full max-w-md">
                {/* Glowing Background Ring */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-teal-400/20 to-cyan-500/30 rounded-3xl blur-2xl -z-10" />

                {/* Glass Container Card */}
                <div className="relative rounded-3xl bg-slate-900/80 border border-emerald-500/40 p-6 shadow-2xl backdrop-blur-xl text-center space-y-6 overflow-hidden">
                  
                  {/* Instructor Avatars Showcase Grid */}
                  <div className="flex items-center justify-center -space-x-4 pt-2">
                    <img className="w-14 h-14 rounded-full border-4 border-slate-900 object-cover shadow-lg" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80" alt="Instructor 1" />
                    <img className="w-16 h-16 rounded-full border-4 border-emerald-500 object-cover shadow-xl z-10" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80" alt="Instructor 2" />
                    <img className="w-14 h-14 rounded-full border-4 border-slate-900 object-cover shadow-lg" src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80" alt="Instructor 3" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-lg font-black text-white">Chuyên gia Đồng hành</h3>
                    <p className="text-xs text-slate-300 font-medium">Chia sẻ bí quyết thực chiến & cố vấn sự nghiệp</p>
                  </div>

                  {/* Floating Overlay Badge 1 */}
                  <div className="p-3 rounded-2xl bg-slate-950/85 border border-emerald-500/40 text-left backdrop-blur-md shadow-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white">150+ Giảng viên</p>
                        <p className="text-[10px] text-slate-300">Đến từ các Tập đoàn Top đầu</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">Active</span>
                  </div>

                  {/* Floating Overlay Badge 2 */}
                  <div className="p-3 rounded-2xl bg-slate-950/85 border border-amber-500/40 text-left backdrop-blur-md shadow-xl flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                        <Star className="w-5 h-5 fill-amber-400" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-amber-300">4.9/5.0 Đánh giá</p>
                        <p className="text-[10px] text-slate-300">Từ 50,000+ Học viên</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold">Top Choice</span>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Main Body Layout (8 cols Left Cards + 4 cols Right Sidebar) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
          
          {/* Subheader info bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-semibold text-slate-500 pb-2 border-b border-slate-200/80">
            <div>
              Hiển thị <span className="font-extrabold text-slate-900">{filteredInstructors.length}</span> giảng viên phù hợp
            </div>

            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-emerald-600 hover:underline cursor-pointer flex items-center gap-1 font-bold"
              >
                <Filter className="w-3.5 h-3.5" /> Xóa từ khóa tìm kiếm
              </button>
            )}
          </div>

          {/* Grid Container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Columns: Instructor Cards List */}
            <div className="lg:col-span-8 space-y-6">
              {isLoading ? (
                <div className="text-center py-20 text-slate-400 font-medium animate-pulse">
                  Đang tải danh sách giảng viên...
                </div>
              ) : paginatedInstructors.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 text-slate-500 font-medium">
                  Không tìm thấy giảng viên nào phù hợp với từ khóa "{searchQuery}".
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {paginatedInstructors.map((instructor) => (
                    <Link
                      key={instructor.id}
                      to={`/instructors/${instructor.id}`}
                      className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 group flex flex-col justify-between text-left relative overflow-hidden cursor-pointer"
                    >
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div className="space-y-4">
                        {/* Instructor Info Header */}
                        <div className="flex items-start gap-4">
                          <div className="relative shrink-0">
                            <img
                              src={instructor.avatar}
                              alt={instructor.name}
                              className="w-16 h-16 rounded-full object-cover border-2 border-slate-100 ring-2 ring-emerald-500/20 group-hover:scale-105 transition-transform duration-300 bg-slate-100"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
                              }}
                            />
                            <div className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-0.5 border-2 border-white shadow-sm" title="Xác minh">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors truncate">
                              {instructor.name}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium line-clamp-2 mt-0.5 leading-relaxed">
                              {instructor.title}
                            </p>
                          </div>
                        </div>

                        {/* Stats Bar */}
                        <div className="bg-slate-50/80 rounded-2xl p-2.5 flex items-center justify-around text-xs font-bold text-slate-700 border border-slate-100">
                          <div className="flex items-center gap-1 text-amber-500">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="font-black text-slate-900">{instructor.rating.toFixed(1)}</span>
                          </div>

                          <div className="w-px h-4 bg-slate-200" />

                          <div className="flex items-center gap-1 text-slate-600">
                            <Users className="w-4 h-4 text-emerald-600" />
                            <span><strong className="text-slate-900">{instructor.students.toLocaleString('vi-VN')}</strong> học viên</span>
                          </div>

                          <div className="w-px h-4 bg-slate-200" />

                          <div className="flex items-center gap-1 text-slate-600">
                            <BookOpen className="w-4 h-4 text-cyan-600" />
                            <span><strong className="text-slate-900">{instructor.coursesCount}</strong> khóa học</span>
                          </div>
                        </div>

                        {/* Skill Tags */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {instructor.tags.slice(0, 4).map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-extrabold px-3 py-1 rounded-full bg-emerald-50/80 text-emerald-800 group-hover:bg-emerald-100 transition-colors border border-emerald-200/70 shadow-2xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {instructor.tags.length > 4 && (
                            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200/60">
                              +{instructor.tags.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Profile Action Button */}
                      <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                        <span>Xem hồ sơ chi tiết</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination Controls */}
              {!isLoading && totalPages > 1 && (
                <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
                  <div className="text-slate-500">
                    Hiển thị <span className="font-bold text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredInstructors.length)}</span> trong tổng số <span className="font-bold text-slate-900">{filteredInstructors.length}</span> giảng viên
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                      title="Trang trước"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer ${
                          currentPage === page
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                            : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
                      title="Trang sau"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right 4 Columns: Sidebar Information & CTA Cards */}
            <div className="lg:col-span-4 space-y-6 text-left">
              
              {/* Card 1: Cam kết chất lượng đào tạo */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" /> Cam kết đào tạo tại MindHub
                </h3>
                <ul className="space-y-3 text-xs font-semibold text-slate-700">
                  <li className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>100% Giảng viên có trên 5 năm kinh nghiệm thực chiến</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-cyan-50/60 border border-cyan-100">
                    <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                    <span>Hỗ trợ hỏi đáp 1-1 trực tiếp trong quá trình học</span>
                  </li>
                  <li className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Nội dung bài giảng liên tục cập nhật theo xu hướng mới</span>
                  </li>
                </ul>
              </div>

              {/* Card 2: Đăng ký hợp tác Giảng dạy */}
              <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 rounded-3xl text-white shadow-xl space-y-4 text-center relative overflow-hidden">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Trở thành Giảng viên MindHub</h3>
                  <p className="text-xs text-slate-300 font-normal mt-1 leading-relaxed">
                    Chia sẻ kiến thức chuyên môn, xây dựng thương hiệu cá nhân và tạo thu nhập thụ động cùng cộng đồng hàng chục ngàn học viên.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/instructor/register')}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Đăng ký đối tác Giảng viên</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </PageTransition>
  );
}
