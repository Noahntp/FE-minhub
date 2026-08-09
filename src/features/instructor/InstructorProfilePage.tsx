import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { HomeCourseCard, HomeCourseItem } from '@/features/home/components/HomeCourseCard';
import { Star, Users, PlayCircle, Award, MessageCircle, MapPin, Globe, CheckCircle2, BookOpen, ShieldCheck, Sparkles, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { ReviewList } from '@/features/reviews/ReviewList';
import { apiFetch } from '@/shared/lib/api-client';
import { resolveMediaUrl } from '@/shared/utils/format';
import { mapApiCourseToHomeCourseItem } from '@/features/home/hooks/useHomepageData';
import { toast } from 'sonner';

// Sample fallback courses for instructor profile
const FALLBACK_INSTRUCTOR_COURSES: HomeCourseItem[] = [
  {
    id: 'react-19-nextjs-15',
    title: 'Chinh Phục React 19 & Next.js 15: Từ Cơ Bản Đến Nâng Cao',
    level: 'Trung cấp',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    rating: 4.9,
    reviewCount: 320,
    studentCount: '3.4K',
    instructorName: 'Nguyễn Văn A',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 699000,
    originalPrice: 1099000,
    discountBadge: '-36%',
    isHot: true,
  },
  {
    id: 'system-design-microservices',
    title: 'System Design & Kiến Trúc Microservices Cho Hệ Thống Lớn',
    level: 'Nâng cao',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    rating: 4.9,
    reviewCount: 285,
    studentCount: '2.1K',
    instructorName: 'Nguyễn Văn A',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 799000,
    originalPrice: 1200000,
    discountBadge: '-33%',
    isHot: true,
  },
  {
    id: 'laravel-rest-api-expert',
    title: 'Lập Trình Laravel RESTful API & Security Best Practices',
    level: 'Trung cấp',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    rating: 4.8,
    reviewCount: 198,
    studentCount: '2.8K',
    instructorName: 'Nguyễn Văn A',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 499000,
    originalPrice: 799000,
    discountBadge: '-38%',
  },
  {
    id: 'node-express-typescript',
    title: 'Node.js, Express & TypeScript: Xây Dựng Backend Chuẩn Chuyên Nghiệp',
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    rating: 4.7,
    reviewCount: 164,
    studentCount: '1.9K',
    instructorName: 'Nguyễn Văn A',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 399000,
    originalPrice: 650000,
    discountBadge: '-38%',
  },
  {
    id: 'python-ai-data-science',
    title: 'Python AI & Data Science: Phân Tích Dữ Liệu Thực Chiến',
    level: 'Trung cấp',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    rating: 4.9,
    reviewCount: 142,
    studentCount: '1.5K',
    instructorName: 'Nguyễn Văn A',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 549000,
    originalPrice: 850000,
    discountBadge: '-35%',
  },
  {
    id: 'fullstack-vue3-nuxt',
    title: 'Fullstack Web Development với Vue 3 & Nuxt.js 3',
    level: 'Mọi trình độ',
    thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80',
    rating: 4.8,
    reviewCount: 115,
    studentCount: '1.1K',
    instructorName: 'Nguyễn Văn A',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 449000,
    originalPrice: 699000,
    discountBadge: '-35%',
  },
];

const ITEMS_PER_PAGE = 4;

export default function InstructorProfilePage() {
  const { instructorId } = useParams();
  const [activeTab, setActiveTab] = useState<'courses' | 'reviews'>('courses');
  const [isFollowing, setIsFollowing] = useState(false);
  const [instructorData, setInstructorData] = useState<any>(null);
  const [coursesList, setCoursesList] = useState<HomeCourseItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [reviewsCount, setReviewsCount] = useState<number>(3);

  useEffect(() => {
    let isMounted = true;
    if (instructorId) {
      apiFetch<any>(`/instructors/${instructorId}`)
        .then((res) => {
          if (!isMounted) return;
          const raw = res?.data || res;
          if (raw) {
            setInstructorData(raw);
            const courses = raw.published_courses || raw.publishedCourses || raw.courses;
            if (Array.isArray(courses)) {
              const mapped = courses.map((c: any) => mapApiCourseToHomeCourseItem(c));
              setCoursesList(mapped);
            }
          }
        })
        .catch((err) => {
          console.warn('Could not load instructor profile from API, using fallback data:', err);
          if (isMounted) {
            setCoursesList(FALLBACK_INSTRUCTOR_COURSES);
          }
        });
    } else {
      setCoursesList(FALLBACK_INSTRUCTOR_COURSES);
    }
    return () => {
      isMounted = false;
    };
  }, [instructorId]);

  const rawAvatar = instructorData?.avatar_url || instructorData?.avatar;
  const avatarUrl = rawAvatar ? resolveMediaUrl(rawAvatar) : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&q=80';

  const rawSkills = instructorData?.instructor_profile?.expertise || instructorData?.expertise;
  const parsedSkills = rawSkills
    ? String(rawSkills).split(/[,;/]+/).map((s) => s.trim()).filter(Boolean)
    : ['React 19', 'Next.js 15', 'Node.js', 'Laravel Framework', 'System Design', 'Microservices', 'Docker & K8s'];

  const instructor = {
    id: String(instructorId || '1'),
    name: instructorData?.full_name || instructorData?.name || 'Nguyễn Văn A',
    title: instructorData?.instructor_profile?.headline || instructorData?.headline || (parsedSkills.length > 0 ? parsedSkills.join(' • ') : 'Giảng viên chuyên môn tại MindHub'),
    avatar: avatarUrl,
    bio: instructorData?.instructor_profile?.bio || instructorData?.description || instructorData?.bio || 'Với hơn 10 năm kinh nghiệm trong ngành phát triển phần mềm, tôi đã tham gia xây dựng nhiều hệ thống quy mô lớn tại các tập đoàn công nghệ hàng đầu.',
    students: instructorData ? Number(instructorData.total_enrollments_count ?? instructorData.total_students ?? 0) : 15420,
    coursesCount: coursesList.length,
    rating: instructorData ? Number(instructorData.average_rating ?? 5.0) : 4.8,
    reviews: reviewsCount,
    location: instructorData?.instructor_profile?.location || instructorData?.location || 'Hà Nội, Việt Nam',
    website: instructorData?.instructor_profile?.website || instructorData?.website || 'https://mindhub.vn',
    companies: ['VNG Corporation', 'VinAI Research', 'FPT Software'],
    skills: parsedSkills,
  };

  const handleFollowToggle = () => {
    setIsFollowing((prev) => !prev);
    if (!isFollowing) {
      toast.success(`Đã theo dõi giảng viên ${instructor.name}`);
    } else {
      toast.info(`Đã hủy theo dõi ${instructor.name}`);
    }
  };

  const handleSendMessage = () => {
    toast.success(`Đã gửi yêu cầu kết nối tới giảng viên ${instructor.name}. Đội ngũ hỗ trợ sẽ liên hệ bạn sớm nhất!`);
  };

  // Pagination Logic
  const totalPages = Math.ceil(coursesList.length / ITEMS_PER_PAGE) || 1;
  const paginatedCourses = coursesList.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50 pb-20">
        
        {/* Cover Header Banner */}
        <div className="relative bg-gradient-to-r from-[#004D3F] via-[#007A64] to-[#04342C] h-48 sm:h-64 text-white overflow-hidden">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-300/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        </div>

        {/* Profile Header Info Card */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-lg flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            
            {/* Avatar with Verified Badge */}
            <div className="relative shrink-0 -mt-16 sm:-mt-20">
              <img
                src={instructor.avatar}
                alt={instructor.name}
                className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white shadow-xl ring-4 ring-emerald-500/20 bg-slate-100"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=250&q=80';
                }}
              />
              <div className="absolute bottom-2 right-2 bg-emerald-600 text-white rounded-full p-1.5 border-2 border-white shadow-md" title="Giảng viên đã xác minh">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            {/* Profile Info Details */}
            <div className="flex-1 space-y-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-xs font-bold mb-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Giảng viên Tiêu biểu MindHub
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                  {instructor.name}
                </h1>
                <p className="text-sm sm:text-base font-semibold text-emerald-700 mt-0.5">
                  {instructor.title}
                </p>
              </div>

              {/* Stats Bar */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 sm:gap-6 text-xs sm:text-sm font-semibold text-slate-600">
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-900">{instructor.students.toLocaleString('vi-VN')}</span> học viên
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <PlayCircle className="w-4 h-4 text-cyan-600" />
                  <span className="font-bold text-slate-900">{instructor.coursesCount}</span> khóa học
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span className="font-bold text-slate-900">{instructor.rating.toFixed(1)}</span>
                  <span className="text-slate-400">({instructor.reviews.toLocaleString('vi-VN')} đánh giá)</span>
                </div>
              </div>

              {/* Actions & Links */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
                <Button
                  onClick={handleFollowToggle}
                  className={`rounded-2xl px-6 py-2.5 font-bold text-xs shadow-md transition-all cursor-pointer ${
                    isFollowing
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                  }`}
                >
                  {isFollowing ? '✓ Đã theo dõi' : '+ Theo dõi'}
                </Button>

                <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 md:pl-2 md:border-l border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-slate-400" /> {instructor.location}
                  </span>
                  <a
                    href={instructor.website}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors"
                  >
                    <Globe className="w-4 h-4 text-slate-400" /> Website <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* Main Body Grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (8 cols): Bio, Experience & Courses */}
          <div className="lg:col-span-8 space-y-8 text-left">
            
            {/* Bio Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-emerald-600" /> Về giảng viên
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed font-normal whitespace-pre-wrap">
                {instructor.bio}
              </p>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-medium">
                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[11px] mb-1">Từng công tác tại</span>
                  <div className="flex flex-wrap gap-1.5">
                    {instructor.companies.map((comp, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold">
                        🏢 {comp}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="block text-slate-400 font-bold uppercase text-[11px] mb-1">Chứng chỉ & Đóng góp</span>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                      🏆 Microsoft Certified Trainer
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 font-semibold border border-amber-100">
                      ⭐ Top Author 2024
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Courses & Reviews Tabs */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              
              {/* Tab Header */}
              <div className="flex items-center gap-8 border-b border-slate-100 pb-2">
                <button
                  onClick={() => setActiveTab('courses')}
                  className={`pb-3 font-extrabold text-base transition-colors relative cursor-pointer ${
                    activeTab === 'courses' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Khóa học giảng dạy ({instructor.coursesCount})
                  {activeTab === 'courses' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 font-extrabold text-base transition-colors relative cursor-pointer ${
                    activeTab === 'reviews' ? 'text-emerald-700' : 'text-slate-400 hover:text-slate-700'
                  }`}
                >
                  Đánh giá từ học viên ({instructor.reviews.toLocaleString('vi-VN')})
                  {activeTab === 'reviews' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-600 rounded-full" />
                  )}
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'courses' ? (
                <div className="space-y-6 pt-2">
                  {paginatedCourses.length === 0 ? (
                    <div className="text-center py-12 text-slate-400 font-medium">
                      Giảng viên chưa đăng khóa học nào.
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {paginatedCourses.map((course, idx) => (
                          <HomeCourseCard key={course.id || idx} course={course} />
                        ))}
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold">
                          <div className="text-slate-500">
                            Hiển thị <span className="font-bold text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, coursesList.length)}</span> trong tổng số <span className="font-bold text-slate-900">{coursesList.length}</span> khóa học
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
                    </>
                  )}
                </div>
              ) : (
                <ReviewList
                  targetId={instructor.id}
                  type="instructor"
                  onCountChange={(count) => setReviewsCount(count)}
                />
              )}

            </div>

          </div>

          {/* Right Sidebar Column (4 cols): Achievements, Skills, Work Contact */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            {/* Card 1: Thành tựu */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" /> Thành tựu nổi bật
              </h3>
              <ul className="space-y-3 text-xs font-semibold text-slate-700">
                <li className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>Giảng viên xuất sắc tiêu biểu năm 2023 & 2024</span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Top 1% Chuyên gia React & Fullstack Architecture</span>
                </li>
                <li className="flex items-start gap-2.5 p-2.5 rounded-2xl bg-cyan-50/60 border border-cyan-100">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                  <span>Hơn {instructor.students.toLocaleString('vi-VN')} học viên đã đăng ký học</span>
                </li>
              </ul>
            </div>

            {/* Card 2: Chuyên môn & Kỹ năng */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" /> Kỹ năng & Chuyên môn
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {instructor.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Card 3: Liên hệ công việc */}
            <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 rounded-3xl text-white shadow-xl space-y-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Liên hệ hợp tác & Đào tạo</h3>
                <p className="text-xs text-slate-300 font-normal mt-1 leading-relaxed">
                  Bạn muốn mời giảng viên tham gia dự án tư vấn hoặc đào tạo doanh nghiệp?
                </p>
              </div>
              <Button
                onClick={handleSendMessage}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 cursor-pointer active:scale-95 transition-all"
              >
                Gửi tin nhắn liên hệ
              </Button>
            </div>

          </div>

        </div>

      </div>
    </PageTransition>
  );
}
