import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { 
  Filter, SlidersHorizontal, ChevronDown, ChevronRight, Sparkles, 
  BookOpen, Award, Clock, Users, ArrowLeft, Star 
} from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { HomeCourseCard, HomeCourseItem } from '@/features/home/components/HomeCourseCard';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { apiFetch } from '@/shared/lib/api-client';

const CATEGORY_SLUG_ALIAS: Record<string, string> = {
  'ai-data': 'ai-va-du-lieu',
  'lap-trinh': 'lap-trinh',
  'web-dev': 'web-development',
  'ui-ux-design': 'ui-ux',
  'game-development': 'game-dev',
};

const CATEGORY_META: Record<string, { title: string; desc: string; icon: string; bgGradient: string }> = {
  'lap-trinh': {
    title: 'Lập trình & Tư duy thuật toán',
    desc: 'Trang bị nền tảng lập trình vững chắc từ tư duy logic, cấu trúc dữ liệu đến xây dựng phần mềm thực tế.',
    icon: '💻',
    bgGradient: 'from-emerald-900 via-slate-900 to-teal-950',
  },
  'web-development': {
    title: 'Lập trình Web Chuyên Nghiệp',
    desc: 'Làm chủ toàn bộ hệ sinh thái Web hiện đại từ thiết kế giao diện Frontend đến xây dựng hệ thống Backend mạnh mẽ.',
    icon: '🌐',
    bgGradient: 'from-blue-900 via-slate-900 to-indigo-950',
  },
  'backend': {
    title: 'Lập trình Backend & API Systems',
    desc: 'Học cách thiết kế kiến trúc hệ thống, xây dựng RESTful & Microservices API, quản trị dữ liệu và tối ưu hiệu năng server.',
    icon: '⚙️',
    bgGradient: 'from-amber-950 via-slate-900 to-stone-900',
  },
  'frontend': {
    title: 'Lập trình Frontend & UI/UX Web',
    desc: 'Xây dựng giao diện web phản hồi nhanh, hiệu ứng mượt mà với React 19, Next.js, Vue và TailwindCSS.',
    icon: '🖥️',
    bgGradient: 'from-indigo-900 via-slate-900 to-purple-950',
  },
  'ai-va-du-lieu': {
    title: 'AI, Machine Learning & Dữ liệu',
    desc: 'Khám phá Trí tuệ nhân tạo, Machine Learning, Deep Learning và cách ứng dụng Generative AI vào công việc.',
    icon: '🤖',
    bgGradient: 'from-teal-900 via-slate-900 to-emerald-950',
  },
  'ai-data': {
    title: 'AI, Machine Learning & Dữ liệu',
    desc: 'Khám phá Trí tuệ nhân tạo, Machine Learning, Deep Learning và cách ứng dụng Generative AI vào công việc.',
    icon: '🤖',
    bgGradient: 'from-teal-900 via-slate-900 to-emerald-950',
  },
  'devops': {
    title: 'DevOps, CI/CD & Cloud System',
    desc: 'Triển khai hạ tầng tự động hóa, Docker, Kubernetes, CI/CD pipeline và quản trị hệ thống Cloud.',
    icon: '☁️',
    bgGradient: 'from-sky-900 via-slate-900 to-cyan-950',
  },
};

const DEFAULT_FALLBACK_COURSES: HomeCourseItem[] = [
  {
    id: 'laravel-rest-api-tu-co-ban-den-trien-khai',
    title: 'Laravel REST API từ cơ bản đến triển khai',
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    rating: 4.5,
    reviewCount: 2,
    studentCount: '2',
    instructorName: 'Nguyễn Minh Khoa',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 299000,
    originalPrice: 499000,
    discountBadge: '-40%',
    isHot: true,
  },
  {
    id: 'php-mysql-nen-tang-cho-backend',
    title: 'PHP & MySQL nền tảng cho Backend',
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    rating: 4.0,
    reviewCount: 1,
    studentCount: '1',
    instructorName: 'Nguyễn Minh Khoa',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 399000,
    originalPrice: undefined,
    isHot: true,
  },
];

const formatSlugTitle = (s: string) => {
  if (!s) return 'Danh mục khóa học';
  const customMap: Record<string, string> = {
    'lo-trinh-web-developer': 'Lộ trình Web Developer',
    'vnpay-laravel': 'VNPay Laravel',
    'landing-page-conversion': 'Landing Page & Conversion',
    'backend-laravel': 'Backend Laravel',
    'giao-tiep-lam-viec': 'Giao tiếp & Làm việc nhóm',
  };
  if (customMap[s]) return customMap[s];

  return s
    .replace(/^lo-trinh-/i, 'Lộ trình ')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export default function CategoryDetailPage() {
  const { slug: rawSlug } = useParams<{ slug: string }>();
  const slug = (rawSlug || '').trim();
  const dbSlug = CATEGORY_SLUG_ALIAS[slug] || slug;

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('popular');
  const [courses, setCourses] = useState<HomeCourseItem[]>([]);
  const [categoryInfo, setCategoryInfo] = useState<{
    id?: string | number;
    title: string;
    desc: string;
    icon: string;
    bgGradient: string;
  }>({
    title: 'Danh mục khóa học',
    desc: 'Khám phá các khóa học chất lượng cao được thiết kế chuẩn thực tế',
    icon: '🚀',
    bgGradient: 'from-slate-950 via-[#02382c] to-slate-950',
  });
  const [loading, setLoading] = useState(true);

  // Helper mapper from Backend CatalogCourseResource to HomeCourseItem
  const mapApiCourseToHomeCourseItem = (c: any): HomeCourseItem => {
    const rawPrice = Number(c.price || 0);
    const rawSalePrice = c.sale_price !== null && c.sale_price !== undefined ? Number(c.sale_price) : undefined;
    const finalPrice = rawSalePrice !== undefined && rawSalePrice < rawPrice ? rawSalePrice : rawPrice;
    const originalPrice = rawSalePrice !== undefined && rawSalePrice < rawPrice ? rawPrice : undefined;

    let discountBadge: string | undefined = undefined;
    if (originalPrice && originalPrice > finalPrice) {
      const percent = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
      discountBadge = `-${percent}%`;
    }

    const defaultImages = [
      'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
      'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    ];
    const imageIdx = Math.abs((Number(c.id) || 0) % defaultImages.length);

    return {
      id: String(c.id),
      title: c.title || 'Khóa học chất lượng',
      level: c.level === 'beginner' ? 'Cơ bản' : c.level === 'advanced' ? 'Nâng cao' : 'Trung cấp',
      thumbnail: c.thumbnail_url || defaultImages[imageIdx],
      rating: c.average_rating !== undefined && c.average_rating !== null ? Number(c.average_rating) : 0,
      reviewCount: Number(c.reviews_count || 0),
      studentCount: new Intl.NumberFormat('vi-VN').format(c.enrollments_count || 0),
      instructorName: c.instructor?.full_name || 'Giảng viên MindHub',
      instructorAvatar: c.instructor?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
      price: finalPrice,
      originalPrice: originalPrice,
      discountBadge: discountBadge,
      isFree: finalPrice === 0,
      isHot: Boolean(c.is_featured || (c.enrollments_count && c.enrollments_count > 100)),
      isNew: Boolean(c.is_new),
    };
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchCategoryAndCourses = async () => {
      if (!slug) return;

      // 1. Resolve Category Metadata
      let meta: { id?: string | number; title: string; desc: string; icon: string; bgGradient: string } = CATEGORY_META[dbSlug] || CATEGORY_META[slug] || {
        title: formatSlugTitle(slug),
        desc: `Khám phá các khóa học thực chiến và bài giảng chất lượng cao thuộc chủ đề ${formatSlugTitle(slug)}.`,
        icon: slug.includes('web') ? '🌐' : slug.includes('api') || slug.includes('backend') ? '⚙️' : '🚀',
        bgGradient: 'from-slate-950 via-[#02382c] to-slate-950',
      };

      // Try fetching category details from Backend API /categories
      try {
        const catRes = await apiFetch<any>('/categories');
        const catList = Array.isArray(catRes) ? catRes : catRes?.data || [];
        const formattedTargetTitle = formatSlugTitle(slug).toLowerCase();
        const found = catList.find(
          (item: any) => 
            item.slug === dbSlug || 
            item.slug === slug || 
            String(item.id) === slug ||
            (item.name || '').toLowerCase() === formattedTargetTitle
        );
        if (found) {
          const rawDesc = found.description || meta.desc;
          const cleanedDesc = rawDesc ? rawDesc.replace(/^danh\s*mục\s*demo(\s*mindhub)?[:\s]*/i, '').trim() : '';
          meta = {
            ...meta,
            id: found.id,
            title: found.name || meta.title,
            desc: cleanedDesc || meta.desc,
          };
        }
      } catch (err) {
        console.warn('Unable to load category metadata from API', err);
      }

      if (isMounted) {
        setCategoryInfo(meta);
      }

      // 2. Fetch Courses for this Category from Backend API
      try {
        let sortParam = 'best_selling';
        if (sortOption === 'popular') sortParam = 'best_selling';
        if (sortOption === 'newest') sortParam = 'latest';
        if (sortOption === 'price_asc') sortParam = 'price_asc';
        if (sortOption === 'price_desc') sortParam = 'price_desc';
        if (sortOption === 'rating') sortParam = 'rating_desc';

        let rawCourses: any[] = [];

        // Primary Query using category_slug=dbSlug
        let coursesRes = await apiFetch<any>(`/courses?category_slug=${encodeURIComponent(dbSlug)}&sort=${sortParam}`).catch(() => null);
        rawCourses = Array.isArray(coursesRes) ? coursesRes : coursesRes?.data || [];

        // Secondary fallback query using original slug if dbSlug was different
        if ((!Array.isArray(rawCourses) || rawCourses.length === 0) && dbSlug !== slug) {
          coursesRes = await apiFetch<any>(`/courses?category_slug=${encodeURIComponent(slug)}&sort=${sortParam}`).catch(() => null);
          rawCourses = Array.isArray(coursesRes) ? coursesRes : coursesRes?.data || [];
        }

        // Try querying by category_id if available
        if ((!Array.isArray(rawCourses) || rawCourses.length === 0) && meta.id) {
          coursesRes = await apiFetch<any>(`/courses?category_id=${meta.id}&sort=${sortParam}`).catch(() => null);
          rawCourses = Array.isArray(coursesRes) ? coursesRes : coursesRes?.data || [];
        }

        // If backend returned general list or no category filter applied on server side,
        // strictly filter rawCourses to ensure courses match the category!
        if (Array.isArray(rawCourses) && rawCourses.length > 0) {
          const targetSlug = dbSlug.toLowerCase();
          const targetOriginalSlug = slug.toLowerCase();
          const targetTitle = (meta.title || '').toLowerCase();
          const targetKeywords = targetOriginalSlug.replace(/^lo-trinh-/i, '').split('-').filter((k) => k.length > 2);

          const matchedCourses = rawCourses.filter((c: any) => {
            const courseCatSlug = (c.category?.slug || c.category_slug || '').toLowerCase();
            const courseCatName = (c.category?.name || c.category_name || '').toLowerCase();
            const courseCatId = c.category_id || c.category?.id;

            if (courseCatSlug && (courseCatSlug === targetSlug || courseCatSlug === targetOriginalSlug)) return true;
            if (meta.id && courseCatId && String(courseCatId) === String(meta.id)) return true;
            if (courseCatName && targetTitle && (courseCatName.includes(targetTitle) || targetTitle.includes(courseCatName))) return true;

            const titleLower = (c.title || '').toLowerCase();
            const descLower = (c.description || c.short_description || '').toLowerCase();
            if (targetKeywords.length > 0 && targetKeywords.some((kw) => titleLower.includes(kw) || descLower.includes(kw))) {
              return true;
            }

            return false;
          });

          if (isMounted) {
            setCourses(matchedCourses.map(mapApiCourseToHomeCourseItem));
          }
        } else {
          if (isMounted) {
            setCourses([]);
          }
        }
      } catch (err) {
        console.warn('Unable to load courses for category from Backend API', err);
        if (isMounted) {
          setCourses([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCategoryAndCourses();

    return () => {
      isMounted = false;
    };
  }, [slug, dbSlug, sortOption]);

  return (
    <PageTransition>
      {/* 1. Ultra-Premium Dark Hero Banner */}
      <div className="relative bg-gradient-to-br from-slate-950 via-[#02382c] to-slate-950 text-white overflow-hidden py-12 lg:py-16 select-none shadow-xl">
        {/* Background Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-teal-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-300/80 mb-6">
            <Link to="/" className="hover:text-emerald-400 transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Trang chủ</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <Link to="/courses" className="hover:text-emerald-400 transition-colors">
              Khóa học
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-emerald-400 font-bold">{categoryInfo.title}</span>
          </div>

          {/* Banner Main Content */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold mb-4">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span>CHỦ ĐỀ ĐÀO TẠO THỰC TẾ</span>
              </div>

              <div className="flex items-center gap-4 mb-3">
                <span className="text-4xl sm:text-5xl p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 shadow-xl shrink-0">
                  {categoryInfo.icon}
                </span>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                  {categoryInfo.title}
                </h1>
              </div>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-medium mt-3">
                {categoryInfo.desc}
              </p>
            </div>

            {/* Quick Stat Badges */}
            <div className="grid grid-cols-2 gap-3 w-full md:w-auto shrink-0">
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
                <div className="text-xl font-black text-emerald-400">{courses.length}</div>
                <div className="text-[11px] font-semibold text-slate-300">Khóa học thực tế</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
                <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
                  <span>5.0</span>
                  <Star className="w-4 h-4 fill-amber-400" />
                </div>
                <div className="text-[11px] font-semibold text-slate-300">Đánh giá trung bình</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
                <div className="text-xl font-black text-sky-400">100%</div>
                <div className="text-[11px] font-semibold text-slate-300">Cấp chứng chỉ</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 text-center">
                <div className="text-xl font-black text-purple-400">24/7</div>
                <div className="text-[11px] font-semibold text-slate-300">Trợ giảng hỗ trợ</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Main Content Section */}
      <div className="bg-slate-50/50 py-10 min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Controls Bar: Results Count + Filter Toggle + Sort Dropdown */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                Hiển thị <span className="text-emerald-600 font-black">{courses.length}</span> khóa học từ hệ thống API
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`gap-2 rounded-xl font-bold transition-all ${
                  isFilterOpen
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'border-slate-200 hover:border-emerald-500 hover:text-emerald-600'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Bộ lọc</span>
              </Button>

              <div className="relative">
                <select
                  className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all cursor-pointer shadow-sm"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="popular">🔥 Phổ biến nhất</option>
                  <option value="newest">✨ Mới nhất</option>
                  <option value="rating">⭐ Đánh giá cao</option>
                  <option value="price_asc">🏷️ Giá: Thấp đến cao</option>
                  <option value="price_desc">🏷️ Giá: Cao đến thấp</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* Sidebar Filter Panel */}
            {isFilterOpen && (
              <div className="w-full lg:w-72 shrink-0 space-y-6 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3 text-slate-400">
                    Cấp độ khóa học
                  </h3>
                  <div className="space-y-2">
                    {['Tất cả trình độ', 'Cơ bản', 'Trung cấp', 'Nâng cao'].map((lvl, idx) => (
                      <label key={idx} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors text-xs font-bold text-slate-700">
                        <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                        <span>{lvl}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100">
                  <h3 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider mb-3 text-slate-400">
                    Tính năng kèm theo
                  </h3>
                  <div className="space-y-2">
                    {['Cấp chứng chỉ điện tử', 'Có bài tập dự án', 'Hỗ trợ Q&A 1:1', 'Tài nguyên mã nguồn'].map((feat, idx) => (
                      <label key={idx} className="flex items-center gap-2.5 cursor-pointer hover:bg-slate-50 p-2 rounded-xl transition-colors text-xs font-bold text-slate-700">
                        <input type="checkbox" className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4" />
                        <span>{feat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Courses Display Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-80 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse space-y-4">
                      <div className="h-40 bg-slate-100 rounded-xl" />
                      <div className="h-4 bg-slate-100 rounded w-3/4" />
                      <div className="h-4 bg-slate-100 rounded w-1/2" />
                    </div>
                  ))}
                </div>
              ) : courses.length === 0 ? (
                <EmptyState
                  icon={Filter}
                  title="Chưa có khóa học cho danh mục này"
                  description="Danh mục này hiện chưa có khóa học công khai. Vui lòng khám phá các danh mục khác trên MindHub."
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {courses.map((course) => (
                    <HomeCourseCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </PageTransition>
  );
}
