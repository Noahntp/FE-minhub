import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Star,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  BookOpen,
  Tag,
  Award,
  CheckCircle2,
  Users,
  Flame,
  Zap,
} from 'lucide-react';
import { HomeCourseCard, HomeCourseItem } from '@/features/home/components/HomeCourseCard';
import { toast } from 'sonner';
import { apiFetch } from '@/shared/lib/api-client';
import { resolveMediaUrl } from '@/shared/utils/format';

// Sample mock categories with count matching design mockup
const CATEGORY_FILTERS = [
  { id: 'tech', label: 'Công nghệ', count: 542 },
  { id: 'business', label: 'Kinh doanh', count: 328 },
  { id: 'design', label: 'Thiết kế', count: 265 },
  { id: 'language', label: 'Ngoại ngữ', count: 152 },
  { id: 'personal', label: 'Phát triển cá nhân', count: 198 },
];

const RATING_FILTERS = [
  { value: 4.5, label: '4.5 trở lên' },
  { value: 4.0, label: '4 trở lên' },
  { value: 3.5, label: '3.5 trở lên' },
  { value: 3.0, label: '3 trở lên' },
];

const LEVEL_FILTERS = [
  { id: 'Beginner', label: 'Cơ bản (Beginner)' },
  { id: 'Intermediate', label: 'Trung cấp (Intermediate)' },
  { id: 'Advanced', label: 'Nâng cao (Advanced)' },
];

const DURATION_FILTERS = [
  { id: 'under-5', label: 'Dưới 5 giờ' },
  { id: '5-15', label: '5 – 15 giờ' },
  { id: '15-30', label: '15 – 30 giờ' },
  { id: 'over-30', label: 'Trên 30 giờ' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'highest-rated', label: 'Đánh giá cao nhất' },
  { value: 'lowest-price', label: 'Giá thấp nhất' },
  { value: 'highest-price', label: 'Giá cao nhất' },
];

// 21 Rich Sample Courses matching design screenshot
const ALL_COURSES_DATA: HomeCourseItem[] = [
  {
    id: 'laravel-rest-api-tu-co-ban-den-trien-khai',
    title: 'Lập trình Python cơ bản cho người mới bắt đầu',
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    rating: 4.7,
    reviewCount: 328,
    studentCount: '1.2K',
    instructorName: 'Trần Minh Hoàng',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    price: 499000,
    originalPrice: 799000,
    discountBadge: '-38%',
    isHot: true,
  },
  {
    id: 'react-nextjs-master',
    title: 'React 18 & Next.js 15: Xây dựng Web App chuyên nghiệp',
    level: 'Trung cấp',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    rating: 4.8,
    reviewCount: 214,
    studentCount: '2.4K',
    instructorName: 'Nguyễn Thị Lan',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    price: 699000,
    originalPrice: 1099000,
    discountBadge: '-36%',
    isHot: true,
  },
  {
    id: 'uiux-figma-mastery',
    title: 'UI/UX Design với Figma từ cơ bản đến nâng cao',
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=800&q=80',
    rating: 4.6,
    reviewCount: 186,
    studentCount: '1.8K',
    instructorName: 'Phạm Quốc Bảo',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    price: 399000,
    originalPrice: 699000,
    discountBadge: '-42%',
  },
  {
    id: 'excel-data-dashboard',
    title: 'Phân tích dữ liệu với Excel & Dashboard',
    level: 'Trung cấp',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    rating: 4.6,
    reviewCount: 153,
    studentCount: '1.5K',
    instructorName: 'Lê Văn Nam',
    instructorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
    price: 349000,
    originalPrice: 549000,
    discountBadge: '-36%',
  },
  {
    id: 'digital-marketing-360',
    title: 'Digital Marketing tổng thể cho người mới bắt đầu',
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    rating: 4.7,
    reviewCount: 201,
    studentCount: '2.1K',
    instructorName: 'Đỗ Thùy Linh',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    price: 449000,
    originalPrice: 699000,
    discountBadge: '-35%',
  },
  {
    id: 'english-communication-busy',
    title: 'Tiếng Anh giao tiếp cho người bận rộn',
    level: 'Cơ bản',
    thumbnail: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&q=80',
    rating: 4.5,
    reviewCount: 342,
    studentCount: '3.2K',
    instructorName: 'Emma Nguyen',
    instructorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&q=80',
    price: 299000,
    originalPrice: 499000,
    discountBadge: '-40%',
  },
  {
    id: 'docker-k8s-devops-master',
    title: 'Docker & Kubernetes Thực Chiến Cho Developer',
    level: 'Nâng cao',
    thumbnail: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&q=80',
    rating: 4.9,
    reviewCount: 142,
    studentCount: '1.4K',
    instructorName: 'Đỗ Thành Long',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    price: 599000,
    originalPrice: 899000,
    discountBadge: '-33%',
    isNew: true,
  },
  {
    id: 'nestjs-microservices-master',
    title: 'Node.js & NestJS Xây Dựng Hệ Thống Microservices',
    level: 'Nâng cao',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80',
    rating: 4.8,
    reviewCount: 129,
    studentCount: '1.2K',
    instructorName: 'Trần Minh Đức',
    instructorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
    price: 549000,
    originalPrice: 799000,
    discountBadge: '-31%',
    isNew: true,
  },
  {
    id: 'spring-boot-security-master',
    title: 'Spring Boot 3 & Spring Security 6 Cho Project Thực Tế',
    level: 'Trung cấp',
    thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=800&q=80',
    rating: 4.9,
    reviewCount: 185,
    studentCount: '1.9K',
    instructorName: 'Lê Hoàng Nam',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    price: 499000,
    originalPrice: 699000,
    discountBadge: '-28%',
  },
];

export default function CourseListPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPriceType, setSelectedPriceType] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedMinRating, setSelectedMinRating] = useState<number | null>(null);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  // Sync URL search parameters on mount / update
  useEffect(() => {
    const isFree = searchParams.get('free') === 'true';
    const pType = searchParams.get('priceType');
    if (isFree || pType === 'free') {
      setSelectedPriceType('free');
    } else if (pType === 'paid') {
      setSelectedPriceType('paid');
    }

    const q = searchParams.get('search') || searchParams.get('query') || searchParams.get('q');
    if (q) {
      setSearchQuery(q);
      setActiveSearch(q);
    }

    const cat = searchParams.get('categories') || searchParams.get('category');
    if (cat) {
      setSelectedCategories(cat.split(','));
    }

    const coupon = searchParams.get('coupon');
    if (coupon) {
      toast.success(`Đã tự động kích hoạt mã ưu đãi ${coupon.toUpperCase()} (-50%) cho bạn!`);
    }
  }, [searchParams]);

  // Accordion Section Expand States
  const [accordionOpen, setAccordionOpen] = useState({
    category: true,
    price: true,
    rating: true,
    level: true,
    duration: true,
  });

  const toggleAccordion = (key: keyof typeof accordionOpen) => {
    setAccordionOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
    setCurrentPage(1);
  };

  const toggleCategory = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
    setCurrentPage(1);
  };

  const toggleLevel = (lvlId: string) => {
    setSelectedLevels((prev) =>
      prev.includes(lvlId) ? prev.filter((l) => l !== lvlId) : [...prev, lvlId]
    );
    setCurrentPage(1);
  };

  const toggleDuration = (durId: string) => {
    setSelectedDurations((prev) =>
      prev.includes(durId) ? prev.filter((d) => d !== durId) : [...prev, durId]
    );
    setCurrentPage(1);
  };

  const [apiCourses, setApiCourses] = useState<HomeCourseItem[]>([]);
  const [apiCategories, setApiCategories] = useState<{ id: string; label: string; count: number; slug: string }[]>([]);
  const [totalResults, setTotalResults] = useState<number>(0);
  const [totalPagesCount, setTotalPagesCount] = useState<number>(1);
  const [isCoursesLoading, setIsCoursesLoading] = useState<boolean>(true);
  const [hasLoadedFromApi, setHasLoadedFromApi] = useState<boolean>(false);

  // Fetch Category Filters from API /api/categories
  useEffect(() => {
    apiFetch<any>('/categories')
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          const mapped = list.map((cat: any) => ({
            id: cat.slug || String(cat.id),
            label: cat.name,
            count: cat.courses_count !== undefined && cat.courses_count !== null 
              ? Number(cat.courses_count) 
              : (Array.isArray(cat.courses) ? cat.courses.length : 0),
            slug: cat.slug,
          }));
          setApiCategories(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Debounce live search
  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveSearch(searchQuery);
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch Courses from API /api/courses
  useEffect(() => {
    setIsCoursesLoading(true);
    const params = new URLSearchParams();
    if (activeSearch.trim()) {
      params.set('query', activeSearch.trim());
      params.set('search', activeSearch.trim());
    }
    if (selectedCategories.length > 0) {
      params.set('categories', selectedCategories.join(','));
      params.set('category_slug', selectedCategories[0]);
    }
    if (selectedLevels.length > 0) {
      const lvlMap: Record<string, string> = {
        Beginner: 'beginner',
        Intermediate: 'intermediate',
        Advanced: 'advanced',
      };
      params.set('level', lvlMap[selectedLevels[0]] || 'all_levels');
    }

    if (selectedPriceType && selectedPriceType !== 'all') {
      params.set('priceType', selectedPriceType);
    }
    if (selectedMinRating) {
      params.set('minRating', String(selectedMinRating));
    }

    const sortMap: Record<string, string> = {
      newest: 'newest',
      popular: 'popular',
      'highest-rated': 'highest-rated',
      'lowest-price': 'lowest-price',
      'highest-price': 'highest-price',
    };
    params.set('sortBy', sortMap[sortBy] || 'newest');
    params.set('sort', sortMap[sortBy] || 'newest');
    params.set('page', String(currentPage));
    params.set('per_page', '9');
    params.set('limit', '9');

    apiFetch<any>(`/courses?${params.toString()}`)
      .then((res) => {
        const rawList = res?.data?.items ?? res?.data ?? res?.items ?? res;
        const list = Array.isArray(rawList) ? rawList : [];

        if (list.length > 0) {
          const mapped: (HomeCourseItem & { durationSeconds: number })[] = list.map((item: any) => {
            const rawPrice = Number(item.price || 0);
            const rawSalePrice = item.salePrice !== undefined && item.salePrice !== null 
              ? Number(item.salePrice) 
              : (item.sale_price !== undefined && item.sale_price !== null ? Number(item.sale_price) : undefined);
            
            const finalPrice = rawSalePrice !== undefined && rawSalePrice < rawPrice ? rawSalePrice : rawPrice;
            const originalPrice = rawSalePrice !== undefined && rawSalePrice < rawPrice ? rawPrice : (item.originalPrice ? Number(item.originalPrice) : undefined);

            let levelLabel: 'Cơ bản' | 'Trung cấp' | 'Nâng cao' | 'Mọi trình độ' = 'Cơ bản';
            if (item.level === 'intermediate' || item.level === 'Trung cấp') levelLabel = 'Trung cấp';
            if (item.level === 'advanced' || item.level === 'Nâng cao') levelLabel = 'Nâng cao';
            if (item.level === 'all_levels' || item.level === 'Mọi trình độ') levelLabel = 'Mọi trình độ';

            return {
              id: String(item.slug || item.id),
              realId: item.id ? Number(item.id) : undefined,
              title: item.title || 'Khóa học chưa có tên',
              level: levelLabel,
              thumbnail: resolveMediaUrl(item.image || item.thumbnail_url || item.thumbnail) || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
              rating: item.rating !== undefined && item.rating !== null 
                ? Number(item.rating) 
                : (item.average_rating !== undefined && item.average_rating !== null ? Number(item.average_rating) : 0),
              reviewCount: item.reviewCount !== undefined && item.reviewCount !== null 
                ? Number(item.reviewCount) 
                : (item.reviews_count !== undefined && item.reviews_count !== null ? Number(item.reviews_count) : 0),
              studentCount: item.enrolledCount !== undefined && item.enrolledCount !== null 
                ? `${item.enrolledCount}` 
                : (item.enrollments_count !== undefined && item.enrollments_count !== null ? `${item.enrollments_count}` : '0'),
              instructorName: item.instructorName || item.instructor?.full_name || item.instructor?.name || 'Giảng viên MindHub',
              instructorAvatar: resolveMediaUrl(item.instructorAvatar || item.instructor?.avatar_url || item.instructor?.avatar) || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
              price: finalPrice,
              originalPrice: originalPrice,
              discountBadge: originalPrice && originalPrice > finalPrice ? `-${Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}%` : undefined,
              isHot: Boolean(item.is_featured || item.isHot),
              durationSeconds: Number(item.total_duration_seconds || 0),
            };
          });

          // Local price filter
          let filtered = mapped;
          if (selectedPriceType === 'free') {
            filtered = filtered.filter((c) => c.price === 0);
          } else if (selectedPriceType === 'paid') {
            filtered = filtered.filter((c) => c.price > 0);
          }

          // Local min rating filter
          if (selectedMinRating !== null) {
            filtered = filtered.filter((c) => c.rating >= selectedMinRating);
          }

          // Duration Filter
          if (selectedDurations.length > 0) {
            filtered = filtered.filter((c) => {
              const hours = (c.durationSeconds || 0) / 3600;
              return selectedDurations.some((dur) => {
                if (dur === 'under-5') return hours < 5;
                if (dur === '5-15') return hours >= 5 && hours < 15;
                if (dur === '15-30') return hours >= 15 && hours < 30;
                if (dur === 'over-30') return hours >= 30;
                return true;
              });
            });
          }

          setApiCourses(filtered);
          const totalCount = res?.data?.totalItems ?? res?.data?.total ?? res?.meta?.total ?? res?.totalItems;
          setTotalResults(totalCount !== undefined ? Number(totalCount) : filtered.length);

          const totalPages = res?.data?.totalPages ?? res?.data?.last_page ?? res?.meta?.last_page ?? res?.totalPages;
          setTotalPagesCount(totalPages !== undefined ? Number(totalPages) : (Math.ceil((totalCount || filtered.length) / 9) || 1));
        } else {
          setApiCourses([]);
          setTotalResults(0);
          setTotalPagesCount(1);
        }
      })
      .catch(() => {
        setApiCourses([]);
        setTotalResults(0);
        setTotalPagesCount(1);
      })
      .finally(() => {
        setIsCoursesLoading(false);
        setHasLoadedFromApi(true);
      });
  }, [activeSearch, selectedCategories, selectedLevels, selectedPriceType, selectedMinRating, selectedDurations, sortBy, currentPage]);

  const resetAllFilters = () => {
    setSearchQuery('');
    setActiveSearch('');
    setSelectedCategories([]);
    setSelectedPriceType('all');
    setSelectedMinRating(null);
    setSelectedLevels([]);
    setSelectedDurations([]);
    setSortBy('newest');
    setCurrentPage(1);
    toast.info('Đã xóa tất cả bộ lọc');
  };

  // Filtered & Sorted Course List
  const filteredCourses = useMemo(() => {
    return ALL_COURSES_DATA.filter((course) => {
      // Search query filter
      if (activeSearch.trim()) {
        const queryLower = activeSearch.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(queryLower);
        const matchesInstructor = course.instructorName.toLowerCase().includes(queryLower);
        if (!matchesTitle && !matchesInstructor) return false;
      }

      // Price type filter
      if (selectedPriceType === 'free' && course.price > 0) return false;
      if (selectedPriceType === 'paid' && (course.price === 0 || course.isFree)) return false;

      // Min rating filter
      if (selectedMinRating !== null && course.rating < selectedMinRating) return false;

      // Level filter
      if (selectedLevels.length > 0 && !selectedLevels.includes(course.level)) return false;

      return true;
    });
  }, [activeSearch, selectedPriceType, selectedMinRating, selectedLevels]);

  const totalPages = 7; // Matching pagination buttons < 1 2 3 4 5 ... 7 >

  return (
    <div className="min-h-screen bg-slate-50/50 text-slate-800 font-sans pb-20 pt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* 1. Hero Header Banner with Creative 3D Visual & Glassmorphism Search */}
        <div className="relative bg-gradient-to-r from-[#022822] via-[#043e34] to-[#022822] text-white p-6 sm:p-10 lg:p-12 rounded-3xl shadow-2xl overflow-hidden border border-emerald-500/30">
          {/* Ambient Decorative Mesh & Light Glows */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-500/25 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-teal-400/25 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:30px_30px] opacity-20 pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: Headline, Value Proposition & Search Box */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-xs font-bold shadow-lg backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                <span>Thư viện 1,000+ Khóa học Chất lượng Cao</span>
              </div>

              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                  Khám Phá & Nâng Tầm <br className="hidden sm:inline" />
                  <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-amber-300 bg-clip-text text-transparent">
                    Kỹ Năng Của Bạn
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-emerald-100/90 font-medium leading-relaxed max-w-xl">
                  Học trực tuyến mọi lúc, mọi nơi cùng đội ngũ chuyên gia hàng đầu. Cập nhật kiến thức thực chiến chuẩn doanh nghiệp.
                </p>
              </div>

              {/* Prominent Search Input Box */}
              <div className="bg-slate-900/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-emerald-500/30 shadow-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Tìm kiếm khóa học</span>
                  </label>
                  <span className="text-[11px] text-emerald-300/80 font-medium">Hơn 50,000+ lượt tìm kiếm</span>
                </div>

                <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                  <input
                    type="text"
                    placeholder="Nhập tên khóa học, kỹ năng (ReactJS, Laravel, AI...)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-4 pr-32 py-3 bg-white rounded-xl text-slate-900 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 shadow-inner font-semibold placeholder:text-slate-400"
                  />
                  {searchQuery ? (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); setActiveSearch(''); }}
                      className="absolute right-28 p-1 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  ) : null}
                  <button
                    type="submit"
                    className="absolute right-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Tìm kiếm</span>
                  </button>
                </form>

                {/* Popular Search Tag Pills */}
                <div className="pt-1 flex flex-wrap items-center gap-1.5">
                  <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold mr-1">
                    <Tag className="w-3 h-3 text-amber-300" />
                    <span>Từ khóa hot:</span>
                  </div>
                  {['Laravel', 'ReactJS', 'Python AI', 'Figma UI', 'MySQL', 'DevOps'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => { setSearchQuery(tag); setActiveSearch(tag); }}
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-500 hover:text-white text-emerald-200 border border-emerald-500/30 text-[11px] font-semibold transition-all cursor-pointer shadow-sm active:scale-95"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlights / Quick Stats Pills */}
              <div className="pt-1 flex flex-wrap items-center gap-3 text-xs text-emerald-100 font-medium">
                <div className="flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 backdrop-blur-sm shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Học thực hành 100%</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 backdrop-blur-sm shadow-sm">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span>Cấp chứng nhận MindHub</span>
                </div>
                <div className="flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30 backdrop-blur-sm shadow-sm">
                  <Users className="w-4 h-4 text-teal-300" />
                  <span>Hỗ trợ 24/7 từ Giảng viên</span>
                </div>
              </div>
            </div>

            {/* Right Column: Creative 3D Illustration Graphic Frame */}
            <div className="lg:col-span-5 hidden lg:flex justify-center relative">
              <div className="relative w-full max-w-md">
                {/* Glowing Outer Frame */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/30 via-teal-400/20 to-cyan-500/30 rounded-3xl blur-2xl -z-10" />

                {/* Glass Container */}
                <div className="relative rounded-3xl bg-slate-900/80 border border-emerald-500/40 p-3 shadow-2xl backdrop-blur-xl overflow-hidden group">
                  <img
                    src="/courses-hero-illustration.png"
                    alt="MindHub Learning 3D Illustration"
                    className="w-full h-auto object-cover rounded-2xl shadow-inner group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Floating Overlay Badge 1 */}
                  <div className="absolute top-5 left-5 p-2.5 rounded-2xl bg-slate-950/85 border border-emerald-500/40 text-left backdrop-blur-md shadow-xl flex items-center gap-2.5 animate-bounce">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <div>
                      <p className="text-[11px] font-bold text-emerald-300">50,000+ Học viên</p>
                      <p className="text-[9px] text-slate-300">Đang tham gia khóa học</p>
                    </div>
                  </div>

                  {/* Floating Overlay Badge 2 */}
                  <div className="absolute bottom-5 right-5 p-2.5 rounded-2xl bg-slate-950/85 border border-amber-500/40 text-left backdrop-blur-md shadow-xl flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Star className="w-4 h-4 fill-amber-400" />
                    </div>
                    <div>
                      <p className="text-[11px] font-extrabold text-amber-300">4.9/5.0 Đánh giá</p>
                      <p className="text-[9px] text-slate-300">Từ 15,000+ nhận xét</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 2. Main Layout (Left: Sidebar Filters | Right: Results Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Desktop Left Column (3 cols): Sidebar Filters */}
          <div className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-left sticky top-24">
              
              {/* Header: Bộ lọc */}
              <div className="flex items-center justify-between font-extrabold text-sm text-slate-900 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-emerald-600" />
                  <span>Bộ lọc</span>
                </div>
                {(selectedCategories.length > 0 || selectedLevels.length > 0 || selectedPriceType !== 'all' || selectedMinRating) && (
                  <button
                    onClick={resetAllFilters}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                  >
                    Xóa tất cả
                  </button>
                )}
              </div>

              {/* Filter 1: DANH MỤC */}
              <div className="border-b border-slate-100 pb-5">
                <button
                  onClick={() => toggleAccordion('category')}
                  className="w-full flex items-center justify-between font-extrabold text-xs text-slate-900 tracking-wider mb-3"
                >
                  <span className="font-bold text-slate-900">Danh mục</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${accordionOpen.category ? 'rotate-180' : ''}`} />
                </button>

                {accordionOpen.category && (
                  <div className="space-y-2.5 pt-1">
                    {(apiCategories.length > 0 ? apiCategories : [
                      { id: 'lap-trinh', label: 'Lập trình', count: 18 },
                      { id: 'thiet-ke', label: 'Thiết kế', count: 6 },
                      { id: 'kinh-doanh', label: 'Kinh doanh', count: 3 },
                      { id: 'marketing', label: 'Marketing', count: 2 },
                      { id: 'cntt', label: 'Công nghệ thông tin', count: 2 },
                    ]).map((cat) => {
                      const isChecked = selectedCategories.includes(cat.id) || selectedCategories.includes(cat.slug || '');
                      return (
                        <label key={cat.id} className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategory(cat.id)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                            />
                            <span className={isChecked ? 'font-bold text-emerald-700' : ''}>{cat.label}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-normal">{cat.count}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter 2: CẤP ĐỘ */}
              <div className="border-b border-slate-100 pb-5">
                <button
                  onClick={() => toggleAccordion('level')}
                  className="w-full flex items-center justify-between font-extrabold text-xs text-slate-900 tracking-wider mb-3"
                >
                  <span className="font-bold text-slate-900">Cấp độ</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${accordionOpen.level ? 'rotate-180' : ''}`} />
                </button>

                {accordionOpen.level && (
                  <div className="space-y-2.5 pt-1">
                    {[
                      { id: 'Beginner', label: 'Beginner', count: 12 },
                      { id: 'Intermediate', label: 'Intermediate', count: 11 },
                      { id: 'Advanced', label: 'Advanced', count: 5 },
                    ].map((lvl) => {
                      const isChecked = selectedLevels.includes(lvl.id);
                      return (
                        <label key={lvl.id} className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleLevel(lvl.id)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                            />
                            <span className={isChecked ? 'font-bold text-emerald-700' : ''}>{lvl.label}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-normal">{lvl.count}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter 3: GIÁ */}
              <div className="border-b border-slate-100 pb-5">
                <button
                  onClick={() => toggleAccordion('price')}
                  className="w-full flex items-center justify-between font-extrabold text-xs text-slate-900 tracking-wider mb-3"
                >
                  <span className="font-bold text-slate-900">Giá</span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${accordionOpen.price ? 'rotate-180' : ''}`} />
                </button>

                {accordionOpen.price && (
                  <div className="space-y-2.5 pt-1 text-xs text-slate-600 font-medium">
                    {[
                      { id: 'free', label: 'Miễn phí', count: 8 },
                      { id: 'under-500k', label: 'Dưới 500.000đ', count: 11 },
                      { id: '500k-1m', label: '500.000đ - 1.000.000đ', count: 6 },
                      { id: 'over-1m', label: 'Trên 1.000.000đ', count: 3 },
                    ].map((p) => {
                      const isChecked = selectedPriceType === p.id;
                      return (
                        <label key={p.id} className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => setSelectedPriceType(isChecked ? 'all' : (p.id as any))}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
                            />
                            <span className={isChecked ? 'font-bold text-emerald-700' : ''}>{p.label}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-normal">{p.count}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Nút Xóa bộ lọc */}
              <button
                onClick={resetAllFilters}
                className="w-full py-2.5 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Xóa bộ lọc</span>
              </button>

            </div>
          </div>

          {/* Mobile Slide-over Filter Drawer Modal */}
          {showMobileFilter && (
            <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
              <div 
                className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
                onClick={() => setShowMobileFilter(false)}
              />
              <div className="relative w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 text-left">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-emerald-600" />
                    <span className="font-extrabold text-sm text-slate-900">Bộ lọc tìm kiếm</span>
                  </div>
                  <button
                    onClick={() => setShowMobileFilter(false)}
                    className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Filter list content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-6">
                  {/* Category Filter */}
                  <div className="border-b border-slate-100 pb-4">
                    <p className="font-extrabold text-xs text-slate-900 mb-3">Danh mục khóa học</p>
                    <div className="space-y-2.5">
                      {(apiCategories.length > 0 ? apiCategories : [
                        { id: 'lap-trinh', label: 'Lập trình', count: 18 },
                        { id: 'thiet-ke', label: 'Thiết kế', count: 6 },
                        { id: 'kinh-doanh', label: 'Kinh doanh', count: 3 },
                      ]).map((cat) => {
                        const isChecked = selectedCategories.includes(cat.id) || selectedCategories.includes(cat.slug || '');
                        return (
                          <label key={cat.id} className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleCategory(cat.id)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                              />
                              <span className={isChecked ? 'font-bold text-emerald-700' : ''}>{cat.label}</span>
                            </div>
                            <span className="text-[11px] text-slate-400">{cat.count}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Level Filter */}
                  <div className="border-b border-slate-100 pb-4">
                    <p className="font-extrabold text-xs text-slate-900 mb-3">Cấp độ</p>
                    <div className="space-y-2.5">
                      {[
                        { id: 'Beginner', label: 'Beginner', count: 12 },
                        { id: 'Intermediate', label: 'Intermediate', count: 11 },
                        { id: 'Advanced', label: 'Advanced', count: 5 },
                      ].map((lvl) => {
                        const isChecked = selectedLevels.includes(lvl.id);
                        return (
                          <label key={lvl.id} className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleLevel(lvl.id)}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                              />
                              <span className={isChecked ? 'font-bold text-emerald-700' : ''}>{lvl.label}</span>
                            </div>
                            <span className="text-[11px] text-slate-400">{lvl.count}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Filter */}
                  <div>
                    <p className="font-extrabold text-xs text-slate-900 mb-3">Khoảng giá</p>
                    <div className="space-y-2.5">
                      {[
                        { id: 'free', label: 'Miễn phí' },
                        { id: 'under-500k', label: 'Dưới 500.000đ' },
                        { id: '500k-1m', label: '500.000đ - 1.000.000đ' },
                        { id: 'over-1m', label: 'Trên 1.000.000đ' },
                      ].map((p) => {
                        const isChecked = selectedPriceType === p.id;
                        return (
                          <label key={p.id} className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 cursor-pointer">
                            <div className="flex items-center gap-2.5">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => setSelectedPriceType(isChecked ? 'all' : (p.id as any))}
                                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                              />
                              <span className={isChecked ? 'font-bold text-emerald-700' : ''}>{p.label}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Footer Apply / Reset */}
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
                  <button
                    onClick={() => {
                      resetAllFilters();
                      setShowMobileFilter(false);
                    }}
                    className="w-1/2 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100"
                  >
                    Đặt lại
                  </button>
                  <button
                    onClick={() => setShowMobileFilter(false)}
                    className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20"
                  >
                    Xem kết quả
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Cột Phải (9 cols): Main Content Results Grid */}
          <div className="lg:col-span-9 space-y-6 text-left">
            
            {/* Top Control Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Result Count & Active Filter Badges */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="font-extrabold text-slate-900">
                  Hiển thị {totalResults || (apiCourses.length > 0 ? apiCourses.length : filteredCourses.length)} kết quả
                </span>

                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                {/* Active Filter Tags */}
                {selectedCategories.map((catId) => (
                  <span key={catId} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg">
                    <span>
                      {(apiCategories.find((c) => c.id === catId || c.slug === catId) || CATEGORY_FILTERS.find((c) => c.id === catId))?.label || catId}
                    </span>
                    <button onClick={() => toggleCategory(catId)} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}

                {selectedPriceType !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg">
                    <span>{selectedPriceType === 'free' ? 'Miễn phí' : 'Trả phí'}</span>
                    <button onClick={() => setSelectedPriceType('all')} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                {selectedMinRating && (
                  <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg">
                    <span>Đánh giá {selectedMinRating}+</span>
                    <button onClick={() => setSelectedMinRating(null)} className="hover:text-rose-500">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}

                <button
                  onClick={resetAllFilters}
                  className="text-emerald-600 hover:underline font-bold ml-1 text-xs"
                >
                  Xóa tất cả
                </button>
              </div>

              {/* Mobile Filter Toggle & Sort Dropdown */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  onClick={() => setShowMobileFilter(!showMobileFilter)}
                  className="lg:hidden px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Bộ lọc</span>
                </button>

                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                  <span className="hidden sm:inline">Sắp xếp theo:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

            </div>

            {/* Course Cards Grid (3 Columns) */}
            {(() => {
              const displayCourses = hasLoadedFromApi ? apiCourses : filteredCourses;
              if (isCoursesLoading) {
                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-white rounded-2xl h-80 border border-slate-200/80 animate-pulse p-4 space-y-4">
                        <div className="bg-slate-100 h-40 rounded-xl w-full"></div>
                        <div className="bg-slate-100 h-5 rounded w-3/4"></div>
                        <div className="bg-slate-100 h-4 rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                );
              }
              if (displayCourses.length === 0) {
                return (
                  <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-3">
                    <div className="text-4xl">🔍</div>
                    <h3 className="font-extrabold text-slate-900 text-base">Không tìm thấy khóa học phù hợp</h3>
                    <p className="text-xs text-slate-500">Hãy thử thay đổi từ khóa hoặc xóa bớt các bộ lọc đang chọn.</p>
                    <button
                      onClick={resetAllFilters}
                      className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-extrabold text-xs inline-block mt-2"
                    >
                      Xóa tất cả bộ lọc
                    </button>
                  </div>
                );
              }
              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                  {displayCourses.map((course) => (
                    <HomeCourseCard key={course.id} course={course} />
                  ))}
                </div>
              );
            })()}

            {/* Dynamic Pagination Controls matching real API totalPagesCount */}
            {(() => {
              const realTotalPages = Math.max(1, totalPagesCount);
              if (realTotalPages <= 1) return null;

              const pages: (number | string)[] = [];
              if (realTotalPages <= 7) {
                for (let i = 1; i <= realTotalPages; i++) {
                  pages.push(i);
                }
              } else {
                pages.push(1);
                if (currentPage > 3) pages.push('...');
                
                const start = Math.max(2, currentPage - 1);
                const end = Math.min(realTotalPages - 1, currentPage + 1);
                for (let i = start; i <= end; i++) {
                  if (!pages.includes(i)) pages.push(i);
                }

                if (currentPage < realTotalPages - 2) pages.push('...');
                if (!pages.includes(realTotalPages)) pages.push(realTotalPages);
              }

              return (
                <div className="pt-8 flex items-center justify-center gap-2 text-xs font-bold">
                  <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 flex items-center justify-center disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {pages.map((p, idx) => {
                    if (p === '...') {
                      return (
                        <span key={`dots-${idx}`} className="px-1 text-slate-400 font-bold">
                          ...
                        </span>
                      );
                    }
                    const pageNum = Number(p);
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-[#2563eb] text-white shadow-md shadow-blue-500/30 font-black'
                            : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    disabled={currentPage >= realTotalPages}
                    onClick={() => setCurrentPage((p) => Math.min(realTotalPages, p + 1))}
                    className="w-9 h-9 rounded-full border border-slate-200 hover:bg-slate-100 text-slate-500 flex items-center justify-center disabled:opacity-30 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })()}

          </div>

        </div>

      </div>
    </div>
  );
}
