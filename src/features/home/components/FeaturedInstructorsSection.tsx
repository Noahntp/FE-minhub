import React, { useState, useEffect } from 'react';
import { Users, Star, ArrowRight, BookOpen, X, ExternalLink, Sparkles, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { HomeCourseCard, HomeCourseItem } from './HomeCourseCard';
import { resolveMediaUrl } from '@/shared/utils/format';
import { apiFetch } from '@/shared/lib/api-client';

interface InstructorItem {
  id: string | number;
  full_name: string;
  name?: string;
  avatar?: string;
  avatar_url?: string;
  bio?: string;
  expertise?: string;
  total_students?: number;
  total_enrollments_count?: number;
  average_rating?: number;
  courses_count?: number;
  courses?: HomeCourseItem[];
}

interface FeaturedInstructorsSectionProps {
  instructors?: any[];
  allCourses?: HomeCourseItem[];
}

const DEFAULT_INSTRUCTORS: InstructorItem[] = [
  {
    id: 'inst-1',
    full_name: 'Nguyễn Văn A',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    expertise: 'Laravel, PHP, MySQL, REST API',
    total_students: 4200,
    courses_count: 3,
    average_rating: 4.9,
  },
  {
    id: 'inst-2',
    full_name: 'Trần Hà Linh',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
    expertise: 'React 19, Next.js 15, UI/UX, AI Product',
    total_students: 2800,
    courses_count: 3,
    average_rating: 4.8,
  },
  {
    id: 'inst-3',
    full_name: 'Lê Hoàng Nam',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    expertise: 'Node.js, Express, Microservices, Docker',
    total_students: 3600,
    courses_count: 4,
    average_rating: 4.9,
  },
  {
    id: 'inst-4',
    full_name: 'Phạm Quỳnh Anh',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    expertise: 'Python, Data Science, Machine Learning',
    total_students: 3100,
    courses_count: 3,
    average_rating: 4.9,
  },
];

const CARDS_PER_SLIDE = 4;

export function FeaturedInstructorsSection({ instructors: apiInstructors, allCourses = [] }: FeaturedInstructorsSectionProps) {
  const navigate = useNavigate();
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorItem | null>(null);
  const [liveInstructors, setLiveInstructors] = useState<any[]>([]);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Fetch real instructors from API if prop is empty
  useEffect(() => {
    let isMounted = true;

    if (Array.isArray(apiInstructors) && apiInstructors.length > 0) {
      setLiveInstructors(apiInstructors);
    } else {
      apiFetch<any>('/instructors')
        .then((res) => {
          if (!isMounted) return;
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
          if (list.length > 0) {
            setLiveInstructors(list);
          }
        })
        .catch((err) => {
          console.warn('Could not fetch instructors from API:', err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [apiInstructors]);

  // Parse instructor list strictly from API data
  const instructorsList: InstructorItem[] = (() => {
    const sourceList = liveInstructors.length > 0 ? liveInstructors : (apiInstructors || []);

    if (Array.isArray(sourceList) && sourceList.length > 0) {
      return sourceList.map((item: any, idx: number) => {
        const rawAvatar = item.avatar_url || item.avatar || item.image;
        return {
          id: item.id || `inst-${idx}`,
          full_name: item.full_name || item.name || item.instructor_name || 'Giảng viên MindHub',
          avatar: rawAvatar ? resolveMediaUrl(rawAvatar) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
          expertise: item.expertise || item.instructor_profile?.expertise || item.bio || item.headline || 'Giảng viên chuyên môn tại MindHub',
          total_students: item.total_enrollments_count ?? item.total_students ?? 0,
          courses_count: item.published_courses_count ?? item.courses_count ?? (Array.isArray(item.published_courses) ? item.published_courses.length : (Array.isArray(item.courses) ? item.courses.length : 0)),
          average_rating: item.average_rating ? Number(item.average_rating) : 5.0,
          courses: Array.isArray(item.published_courses) ? item.published_courses : (Array.isArray(item.courses) ? item.courses : undefined),
        };
      });
    }

    return DEFAULT_INSTRUCTORS;
  })();

  // Carousel Slide Logic
  const totalSlides = Math.ceil(instructorsList.length / CARDS_PER_SLIDE) || 1;
  const visibleInstructors = instructorsList.slice(
    currentSlide * CARDS_PER_SLIDE,
    (currentSlide + 1) * CARDS_PER_SLIDE
  );

  // Dynamic grid class based on exact number of visible instructors
  const gridContainerClass = (() => {
    const len = visibleInstructors.length;
    if (len === 1) return 'grid-cols-1 max-w-md mx-auto';
    if (len === 2) return 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto';
    if (len === 3) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
  })();

  // Get courses taught by the selected instructor
  const getInstructorCourses = (instructor: InstructorItem): HomeCourseItem[] => {
    if (instructor.courses && instructor.courses.length > 0) {
      return instructor.courses;
    }

    // Filter from homepage courses list by name match
    const matched = allCourses.filter(c => 
      c.instructorName.toLowerCase().trim().includes(instructor.full_name.toLowerCase().trim()) ||
      instructor.full_name.toLowerCase().trim().includes(c.instructorName.toLowerCase().trim())
    );

    if (matched.length > 0) return matched;

    // Fallback sample courses for demo
    return [
      {
        id: `inst-crs-1-${instructor.id}`,
        title: `Lập trình ứng dụng thực chiến cùng ${instructor.full_name}`,
        level: 'Trung cấp',
        thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
        rating: 4.9,
        reviewCount: 128,
        studentCount: '1.2K',
        instructorName: instructor.full_name,
        instructorAvatar: instructor.avatar,
        price: 399000,
        originalPrice: 699000,
        discountBadge: '-42%',
        isHot: true,
      },
      {
        id: `inst-crs-2-${instructor.id}`,
        title: `Kỹ năng chuyên sâu & Tối ưu hóa hệ thống`,
        level: 'Nâng cao',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
        rating: 4.8,
        reviewCount: 95,
        studentCount: '850',
        instructorName: instructor.full_name,
        instructorAvatar: instructor.avatar,
        price: 499000,
        isNew: true,
      },
      {
        id: `inst-crs-3-${instructor.id}`,
        title: `Xây dựng dự án thực tế từ Zero đến Hero`,
        level: 'Cơ bản',
        thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
        rating: 4.9,
        reviewCount: 210,
        studentCount: '1.9K',
        instructorName: instructor.full_name,
        instructorAvatar: instructor.avatar,
        price: 299000,
        originalPrice: 499000,
        discountBadge: '-40%',
      }
    ];
  };

  return (
    <section className="py-14 bg-gradient-to-b from-slate-50/60 via-white to-slate-50/60 border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10 text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold mb-2.5">
              <Users className="w-3.5 h-3.5 text-emerald-600" /> Đội ngũ Giảng viên
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Giảng viên tiêu biểu & Chuyên gia
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-1">
              Học hỏi trực tiếp từ những chuyên gia hàng đầu giàu kinh nghiệm thực chiến.
            </p>
          </div>

          <div className="flex items-center gap-4 self-start sm:self-auto">
            {/* Carousel Navigation Buttons if multiple slides */}
            {totalSlides > 1 && (
              <div className="flex items-center gap-1.5 bg-slate-100/90 p-1 rounded-2xl border border-slate-200/80 shadow-inner">
                <button
                  onClick={() => setCurrentSlide((s) => Math.max(0, s - 1))}
                  disabled={currentSlide === 0}
                  className="p-1.5 rounded-xl text-slate-700 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Trang trước"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <span className="text-xs font-extrabold text-slate-700 px-1 select-none">
                  {currentSlide + 1} / {totalSlides}
                </span>

                <button
                  onClick={() => setCurrentSlide((s) => Math.min(totalSlides - 1, s + 1))}
                  disabled={currentSlide === totalSlides - 1}
                  className="p-1.5 rounded-xl text-slate-700 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer"
                  title="Trang sau"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              onClick={() => navigate('/instructors')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-emerald-600 hover:text-emerald-700 transition-colors group cursor-pointer"
            >
              <span>Khám phá tất cả giảng viên</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-emerald-600" />
            </button>
          </div>
        </div>

        {/* Instructors Cards Grid */}
        <div className={`grid ${gridContainerClass} gap-6 transition-all duration-300`}>
          {visibleInstructors.map((inst) => {
            const parsedSkills = inst.expertise
              ? String(inst.expertise).split(/[,;]+/).map(s => s.trim()).filter(Boolean)
              : ['Fullstack Developer'];

            return (
              <div
                key={inst.id}
                onClick={() => navigate(`/instructors/${inst.id}`)}
                className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group flex flex-col justify-between text-center relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-3">
                  {/* Avatar */}
                  <div className="relative w-20 h-20 mx-auto">
                    <img
                      src={inst.avatar}
                      alt={inst.full_name}
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-slate-100 group-hover:ring-emerald-500/30 group-hover:scale-105 transition-all duration-300 shadow-md bg-slate-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
                      }}
                    />
                    <div className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-1 border-2 border-white shadow-sm" title="Giảng viên đã xác minh">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Name & Title */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {inst.full_name}
                    </h3>
                    <p className="text-xs text-slate-500 font-semibold line-clamp-1 mt-0.5">
                      {parsedSkills.length > 0 ? parsedSkills.join(' • ') : 'Giảng viên chuyên môn'}
                    </p>
                  </div>

                  {/* Parsed Skill Pill Badges */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1 min-h-[42px] max-w-sm mx-auto">
                    {parsedSkills.slice(0, 3).map((skill, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center justify-center px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200/80 shadow-2xs group-hover:bg-emerald-100/90 transition-all duration-200 leading-none whitespace-nowrap"
                      >
                        {skill}
                      </span>
                    ))}
                    {parsedSkills.length > 3 && (
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 font-extrabold text-[11px] border border-slate-200/80 leading-none whitespace-nowrap">
                        +{parsedSkills.length - 3}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  {/* Stats row */}
                  <div className="bg-slate-50/80 rounded-2xl p-2.5 flex items-center justify-around text-xs font-bold text-slate-700 border border-slate-100">
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Học viên</span>
                      <span className="text-emerald-700 font-black text-xs">{inst.total_students.toLocaleString('vi-VN')}</span>
                    </div>
                    <div className="w-px h-6 bg-slate-200" />
                    <div className="text-center">
                      <span className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">Đánh giá</span>
                      <span className="text-amber-500 font-black text-xs flex items-center justify-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" /> {inst.average_rating.toFixed(1)}
                      </span>
                    </div>
                  </div>

                  {/* View Courses Action Button */}
                  {(() => {
                    const instCourses = getInstructorCourses(inst);
                    const courseCountToShow = (inst.courses && inst.courses.length > 0)
                      ? inst.courses.length
                      : (instCourses.length > 0 ? instCourses.length : Number(inst.courses_count || 0));

                    return (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedInstructor(inst);
                        }}
                        className="w-full py-2.5 px-4 rounded-2xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-extrabold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border border-emerald-200/60 hover:border-emerald-600"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Xem khóa học ({courseCountToShow})</span>
                      </button>
                    );
                  })()}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* INSTRUCTOR COURSES MODAL */}
      {selectedInstructor && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative border border-slate-100">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white relative">
              <button
                onClick={() => setSelectedInstructor(null)}
                className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-4 pr-10">
                <img
                  src={selectedInstructor.avatar}
                  alt={selectedInstructor.full_name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-emerald-400 shrink-0"
                />
                <div>
                  <div className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 mb-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Giảng viên Chuyên môn MindHub
                  </div>
                  <h3 className="text-xl font-black text-white">{selectedInstructor.full_name}</h3>
                  <p className="text-xs text-slate-300 line-clamp-1">{selectedInstructor.expertise}</p>
                </div>
              </div>
            </div>

            {/* Modal Sub Header Bar */}
            <div className="px-6 py-3 bg-slate-100/80 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-600">
              <span>
                Danh sách khóa học giảng dạy ({getInstructorCourses(selectedInstructor).length})
              </span>

              <button
                onClick={() => {
                  const instId = selectedInstructor.id;
                  setSelectedInstructor(null);
                  navigate(`/instructors/${instId}`);
                }}
                className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                Trang cá nhân giảng viên <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Modal Courses Body */}
            <div className="p-6 overflow-y-auto max-h-[60vh] custom-scrollbar bg-slate-50/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {getInstructorCourses(selectedInstructor).map((course) => (
                  <HomeCourseCard key={course.id} course={course} />
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-end">
              <button
                onClick={() => setSelectedInstructor(null)}
                className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Đóng
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
