import React, { useState, useEffect, useMemo } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, Users, BookOpen, CheckCircle2, Sparkles, ChevronLeft, ChevronRight, Filter, Award, ShieldCheck, UserPlus, ArrowRight } from 'lucide-react';
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
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-[#004D3F] via-[#007A64] to-[#04342C] text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 text-left">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold mb-3 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Đội ngũ Chuyên gia Hàng đầu
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                Đội ngũ Giảng viên
              </h1>
              <p className="text-sm sm:text-base text-slate-200 font-medium mt-2 max-w-xl">
                Học trực tiếp từ những chuyên gia nhiều năm kinh nghiệm thực chiến tại các tập đoàn công nghệ lớn.
              </p>
            </div>

            {/* Live Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400 z-10" />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm giảng viên, kỹ năng..."
                className="w-full pl-10 pr-4 py-2.5 bg-white/95 text-slate-900 placeholder:text-slate-400 rounded-2xl border border-white/20 shadow-lg text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
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
