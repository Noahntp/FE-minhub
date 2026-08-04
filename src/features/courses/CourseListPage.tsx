import React, { useState, useEffect, useMemo } from 'react';
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
} from 'lucide-react';
import { HomeCourseCard, HomeCourseItem } from '@/features/home/components/HomeCourseCard';
import { toast } from 'sonner';

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
    id: 'laravel-rest-api',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSearch, setActiveSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['tech']);
  const [selectedPriceType, setSelectedPriceType] = useState<'all' | 'free' | 'paid'>('all');
  const [selectedMinRating, setSelectedMinRating] = useState<number | null>(3.0);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedDurations, setSelectedDurations] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

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
        
        {/* 1. Hero Header Banner with Search Bar */}
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-left space-y-2 max-w-xl">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Khám phá khóa học
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium">
              Học kỹ năng mới từ chuyên gia và nâng tầm sự nghiệp của bạn.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full md:w-[480px]">
            <input
              type="text"
              placeholder="Tìm khóa học, chủ đề hoặc kỹ năng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-28 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all placeholder:text-slate-400"
            />
            <Search className="w-5 h-5 text-slate-400 absolute left-4" />
            <button
              type="submit"
              className="absolute right-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
            >
              Tìm kiếm
            </button>
          </form>
        </div>

        {/* 2. Main Layout (Left: Sidebar Filters | Right: Results Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Cột Trái (3 cols): Sidebar Filters */}
          <div className={`lg:col-span-3 space-y-4 ${showMobileFilter ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm space-y-6 text-left">
              
              {/* Filter 1: DANH MỤC */}
              <div className="border-b border-slate-100 pb-5">
                <button
                  onClick={() => toggleAccordion('category')}
                  className="w-full flex items-center justify-between font-extrabold text-xs text-slate-900 tracking-wider uppercase mb-3"
                >
                  <span className="flex items-center gap-2">
                    <span>📁</span> DANH MỤC
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${accordionOpen.category ? 'rotate-180' : ''}`} />
                </button>

                {accordionOpen.category && (
                  <div className="space-y-2.5 pt-1">
                    {CATEGORY_FILTERS.map((cat) => {
                      const isChecked = selectedCategories.includes(cat.id);
                      return (
                        <label key={cat.id} className="flex items-center justify-between text-xs text-slate-600 hover:text-slate-900 cursor-pointer font-medium">
                          <div className="flex items-center gap-2.5">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCategory(cat.id)}
                              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                            />
                            <span>{cat.label}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-normal">{cat.count}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter 2: GIÁ */}
              <div className="border-b border-slate-100 pb-5">
                <button
                  onClick={() => toggleAccordion('price')}
                  className="w-full flex items-center justify-between font-extrabold text-xs text-slate-900 tracking-wider uppercase mb-3"
                >
                  <span className="flex items-center gap-2">
                    <span>🏷️</span> GIÁ
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${accordionOpen.price ? 'rotate-180' : ''}`} />
                </button>

                {accordionOpen.price && (
                  <div className="space-y-2 pt-1 text-xs text-slate-600 font-medium">
                    {[
                      { id: 'all', label: 'Tất cả' },
                      { id: 'free', label: 'Miễn phí' },
                      { id: 'paid', label: 'Trả phí' },
                    ].map((p) => (
                      <label key={p.id} className="flex items-center gap-2.5 cursor-pointer">
                        <input
                          type="radio"
                          name="priceType"
                          checked={selectedPriceType === p.id}
                          onChange={() => setSelectedPriceType(p.id as any)}
                          className="w-4 h-4 text-emerald-600 focus:ring-emerald-500 border-slate-300"
                        />
                        <span>{p.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Filter 3: ĐÁNH GIÁ TỐI THIỂU */}
              <div className="border-b border-slate-100 pb-5">
                <button
                  onClick={() => toggleAccordion('rating')}
                  className="w-full flex items-center justify-between font-extrabold text-xs text-slate-900 tracking-wider uppercase mb-3"
                >
                  <span className="flex items-center gap-2">
                    <span>⭐</span> ĐÁNH GIÁ TỐI THIỂU
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${accordionOpen.rating ? 'rotate-180' : ''}`} />
                </button>

                {accordionOpen.rating && (
                  <div className="space-y-2 pt-1">
                    {RATING_FILTERS.map((r) => {
                      const isChecked = selectedMinRating === r.value;
                      return (
                        <label key={r.value} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => setSelectedMinRating(isChecked ? null : r.value)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <div className="flex items-center gap-1 text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(r.value) ? 'fill-amber-400' : 'text-slate-200'}`} />
                            ))}
                          </div>
                          <span className="text-slate-700 font-bold">{r.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter 4: CẤP ĐỘ */}
              <div className="border-b border-slate-100 pb-5">
                <button
                  onClick={() => toggleAccordion('level')}
                  className="w-full flex items-center justify-between font-extrabold text-xs text-slate-900 tracking-wider uppercase mb-3"
                >
                  <span className="flex items-center gap-2">
                    <span>📶</span> CẤP ĐỘ
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${accordionOpen.level ? 'rotate-180' : ''}`} />
                </button>

                {accordionOpen.level && (
                  <div className="space-y-2.5 pt-1">
                    {LEVEL_FILTERS.map((lvl) => {
                      const isChecked = selectedLevels.includes(lvl.id);
                      return (
                        <label key={lvl.id} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleLevel(lvl.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span>{lvl.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Filter 5: THỜI LƯỢNG */}
              <div className="pb-2">
                <button
                  onClick={() => toggleAccordion('duration')}
                  className="w-full flex items-center justify-between font-extrabold text-xs text-slate-900 tracking-wider uppercase mb-3"
                >
                  <span className="flex items-center gap-2">
                    <span>🕒</span> THỜI LƯỢNG
                  </span>
                  <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${accordionOpen.duration ? 'rotate-180' : ''}`} />
                </button>

                {accordionOpen.duration && (
                  <div className="space-y-2.5 pt-1">
                    {DURATION_FILTERS.map((dur) => {
                      const isChecked = selectedDurations.includes(dur.id);
                      return (
                        <label key={dur.id} className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer font-medium">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleDuration(dur.id)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                          />
                          <span>{dur.label}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Nút Xóa bộ lọc */}
              <button
                onClick={resetAllFilters}
                className="w-full py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Xóa bộ lọc</span>
              </button>

            </div>
          </div>

          {/* Cột Phải (9 cols): Main Content Results Grid */}
          <div className="lg:col-span-9 space-y-6 text-left">
            
            {/* Top Control Bar */}
            <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              {/* Result Count & Active Filter Badges */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                <span className="font-extrabold text-slate-900">
                  Hiển thị {filteredCourses.length * 2 + 3} kết quả
                </span>

                <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>

                {/* Active Filter Tags */}
                {selectedCategories.map((catId) => (
                  <span key={catId} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 font-bold px-2.5 py-1 rounded-lg">
                    <span>{CATEGORY_FILTERS.find((c) => c.id === catId)?.label || catId}</span>
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
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredCourses.map((course) => (
                <HomeCourseCard key={course.id} course={course} />
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="pt-6 flex items-center justify-center gap-1.5 text-xs font-bold">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 rounded-xl transition-all ${
                    currentPage === page
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-black'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <span className="px-1 text-slate-400">...</span>

              <button
                onClick={() => setCurrentPage(7)}
                className={`w-9 h-9 rounded-xl transition-all ${
                  currentPage === 7
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-black'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                7
              </button>

              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
