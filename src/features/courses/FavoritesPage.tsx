import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Heart, ChevronRight, LayoutGrid, List, RotateCcw, 
  ChevronDown, ChevronUp, Star, Users, Check, Sparkles, Filter, ShoppingCart, PlayCircle
} from 'lucide-react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { useApp } from '@/app/AppContext';
import { toast } from 'sonner';
import { apiFetch } from '@/shared/lib/api-client';

// Sample 8 realistic courses matching screenshot
const SAMPLE_FAVORITE_COURSES = [
  {
    id: 'fav-1',
    title: 'React.js From Zero to Hero',
    instructor: 'Nguyễn Văn A',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    category: 'Lập trình',
    categorySlug: 'lap-trinh',
    techBadge: 'REACT',
    badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
    rating: 4.9,
    studentsCount: '32.1K',
    price: 909300,
    originalPrice: 1299000,
    discountPercent: 30,
    level: 'Beginner',
    isEnrolled: false,
  },
  {
    id: 'fav-2',
    title: 'Node.js & Express.js Web Development',
    instructor: 'Trần Quang Huy',
    instructorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
    category: 'Lập trình',
    categorySlug: 'lap-trinh',
    techBadge: 'NODE.JS',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    thumbnail: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=600&q=80',
    rating: 4.8,
    studentsCount: '18.7K',
    price: 799000,
    originalPrice: null,
    discountPercent: null,
    level: 'Intermediate',
    isEnrolled: false,
  },
  {
    id: 'fav-3',
    title: 'JavaScript Basic to Advanced',
    instructor: 'Phạm Minh Đức',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    category: 'Lập trình',
    categorySlug: 'lap-trinh',
    techBadge: 'JAVASCRIPT',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=600&q=80',
    rating: 4.7,
    studentsCount: '25.4K',
    price: 699000,
    originalPrice: null,
    discountPercent: null,
    level: 'Beginner',
    isEnrolled: true,
  },
  {
    id: 'fav-4',
    title: 'Tailwind CSS từ A đến Z',
    instructor: 'Lê Hoàng Nam',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80',
    category: 'Thiết kế',
    categorySlug: 'thiet-ke',
    techBadge: 'TAILWIND CSS',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&q=80',
    rating: 4.8,
    studentsCount: '12.9K',
    price: 499000,
    originalPrice: null,
    discountPercent: null,
    level: 'Beginner',
    isEnrolled: false,
  },
  {
    id: 'fav-5',
    title: 'UI/UX Design cho người mới bắt đầu',
    instructor: 'Đỗ Thu Trang',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    category: 'Thiết kế',
    categorySlug: 'thiet-ke',
    techBadge: 'UI/UX DESIGN',
    badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&q=80',
    rating: 4.9,
    studentsCount: '9.3K',
    price: 599000,
    originalPrice: null,
    discountPercent: null,
    level: 'Beginner',
    isEnrolled: true,
  },
  {
    id: 'fav-6',
    title: 'Figma Mastery - Thiết kế chuyên nghiệp',
    instructor: 'Nguyễn Hoài An',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    category: 'Thiết kế',
    categorySlug: 'thiet-ke',
    techBadge: 'FIGMA',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    rating: 4.7,
    studentsCount: '15.2K',
    price: 499000,
    originalPrice: null,
    discountPercent: null,
    level: 'Intermediate',
    isEnrolled: false,
  },
  {
    id: 'fav-7',
    title: 'Laravel 11 - Xây dựng Web App thực chiến',
    instructor: 'Vũ Đức Anh',
    instructorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&q=80',
    category: 'Lập trình',
    categorySlug: 'lap-trinh',
    techBadge: 'LARAVEL',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=80',
    rating: 4.9,
    studentsCount: '21.6K',
    price: 999000,
    originalPrice: null,
    discountPercent: null,
    level: 'Advanced',
    isEnrolled: false,
  },
  {
    id: 'fav-8',
    title: 'Python cho người mới bắt đầu',
    instructor: 'Phan Quốc Huy',
    instructorAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80',
    category: 'Lập trình',
    categorySlug: 'lap-trinh',
    techBadge: 'PYTHON',
    badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
    thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80',
    rating: 4.8,
    studentsCount: '27.3K',
    price: 0,
    originalPrice: null,
    discountPercent: null,
    level: 'Beginner',
    isEnrolled: true,
  },
];

export default function FavoritesPage() {
  const navigate = useNavigate();

  // State management
  const [favoriteList, setFavoriteList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [statusTab, setStatusTab] = useState<'all' | 'unregistered' | 'registered'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Filter sidebar states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [apiCategories, setApiCategories] = useState<{ id: string; label: string; count: number }[]>([]);

  // Accordion open states
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isLevelOpen, setIsLevelOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);

  const { favorites, setFavorites } = useApp();

  // Fetch categories from API /api/categories
  useEffect(() => {
    apiFetch<any>('/categories')
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (list.length > 0) {
          const mapped = list.map((cat: any) => ({
            id: cat.name,
            label: cat.name,
            count: Number(cat.courses_count || 0),
          }));
          setApiCategories(mapped);
        }
      })
      .catch(() => {});
  }, []);

  // Load wishlist from API backend
  useEffect(() => {
    let isMounted = true;
    const fetchWishlist = async () => {
      try {
        setIsLoading(true);
        const res = await apiFetch<any>('/wishlists');
        const rawList = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        
        if (isMounted) {
          if (rawList.length > 0) {
            const mapped: any[] = rawList.map((item: any) => {
              const c = item.course || item;
              const price = c.sale_price !== null && c.sale_price !== undefined ? Number(c.sale_price) : Number(c.price || 0);
              const originalPrice = c.sale_price !== null && c.sale_price !== undefined && Number(c.sale_price) < Number(c.price) ? Number(c.price) : null;
              let discountPercent: number | null = null;
              if (originalPrice && originalPrice > price && price > 0) {
                discountPercent = Math.round(((originalPrice - price) / originalPrice) * 100);
              }

              const categoryTitle = c.category?.name || c.category || 'Lập trình';
              const techTag = (c.title || 'REACT').split(' ')[0].toUpperCase();

              return {
                id: String(c.id || c.slug || item.course_id),
                realId: c.id || item.course_id,
                title: c.title || 'Khóa học chưa có tên',
                instructor: c.instructor?.full_name || 'Giảng viên MindHub',
                instructorAvatar: c.instructor?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
                category: categoryTitle,
                categorySlug: c.category?.slug || 'lap-trinh',
                techBadge: techTag,
                badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
                thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
                rating: Number(c.average_rating || c.rating || 4.8),
                studentsCount: c.enrollments_count ? (c.enrollments_count >= 1000 ? `${(c.enrollments_count/1000).toFixed(1)}K` : String(c.enrollments_count)) : '1.2K',
                price,
                originalPrice,
                discountPercent,
                level: c.level || 'Beginner',
                isEnrolled: Boolean(c.is_enrolled || c.isEnrolled),
              };
            });
            setFavoriteList(mapped);
          } else if (favorites.length > 0) {
            try {
              const catalogRes = await apiFetch<any>('/courses');
              const catalogList = Array.isArray(catalogRes?.data) ? catalogRes.data : (Array.isArray(catalogRes) ? catalogRes : []);
              const favoritedCatalog = catalogList.filter((c: any) =>
                favorites.includes(String(c.id)) || favorites.includes(String(c.slug))
              );
              const mapped = favoritedCatalog.map((c: any) => ({
                id: String(c.id || c.slug),
                realId: c.id,
                title: c.title || 'Khóa học',
                instructor: c.instructor?.full_name || 'Giảng viên MindHub',
                instructorAvatar: c.instructor?.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
                category: c.category?.name || 'Lập trình',
                categorySlug: c.category?.slug || 'lap-trinh',
                techBadge: (c.title || 'COURSE').split(' ')[0].toUpperCase(),
                badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
                thumbnail: c.thumbnail_url || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80',
                rating: Number(c.average_rating || 4.8),
                studentsCount: '1.2K',
                price: Number(c.sale_price ?? c.price ?? 0),
                originalPrice: Number(c.price || 0),
                discountPercent: null,
                level: c.level || 'Beginner',
                isEnrolled: false,
              }));
              setFavoriteList(mapped);
            } catch (catErr) {
              setFavoriteList([]);
            }
          } else {
            setFavoriteList([]);
          }
        }
      } catch (err) {
        console.warn('Could not fetch wishlists from API:', err);
        if (isMounted) {
          setFavoriteList([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchWishlist();
    return () => {
      isMounted = false;
    };
  }, [favorites]);

  // Remove item from favorites
  const handleRemoveFavorite = async (e: React.MouseEvent, courseId: string, title: string, realId?: number) => {
    e.stopPropagation();
    e.preventDefault();
    setFavoriteList((prev) => prev.filter((item) => item.id !== courseId));
    setFavorites((prev) => prev.filter((id) => id !== courseId && id !== String(realId)));
    toast.success(`Đã bỏ yêu thích khóa học "${title}"`);

    const idToDelete = realId || courseId;
    if (idToDelete && !isNaN(Number(idToDelete))) {
      try {
        await apiFetch(`/wishlists/${idToDelete}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Could not remove wishlist on backend:', err);
      }
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedLevels([]);
    setSelectedPrices([]);
    setStatusTab('all');
    setSortBy('newest');
    toast.info('Đã xóa bộ lọc.');
  };

  // Toggle Checkbox Item
  const toggleSelection = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, value: string) => {
    if (list.includes(value)) {
      setList(list.filter((item) => item !== value));
    } else {
      setList([...list, value]);
    }
  };

  // Filtered and Sorted list calculation
  const filteredCourses = useMemo(() => {
    return favoriteList.filter((course) => {
      // 1. Status Filter Tab
      if (statusTab === 'unregistered' && course.isEnrolled) return false;
      if (statusTab === 'registered' && !course.isEnrolled) return false;

      // 2. Category Checkbox Filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(course.category)) {
        return false;
      }

      // 3. Level Checkbox Filter
      if (selectedLevels.length > 0 && !selectedLevels.includes(course.level)) {
        return false;
      }

      // 4. Price Checkbox Filter
      if (selectedPrices.length > 0) {
        const matchesPrice = selectedPrices.some((priceRange) => {
          if (priceRange === 'free') return course.price === 0;
          if (priceRange === 'under500') return course.price > 0 && course.price < 500000;
          if (priceRange === '500to1000') return course.price >= 500000 && course.price <= 1000000;
          if (priceRange === 'above1000') return course.price > 1000000;
          return true;
        });
        if (!matchesPrice) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0; // newest default
    });
  }, [favoriteList, statusTab, selectedCategories, selectedLevels, selectedPrices, sortBy]);

  const totalCount = filteredCourses.length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50 pb-20 font-sans text-slate-800">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* 1. BREADCRUMB */}
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link to="/" className="hover:text-emerald-600 transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Khóa học yêu thích</span>
          </div>

          {/* 2. HEADER BANNER */}
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center shrink-0 shadow-xs">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Khóa học yêu thích
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
                Danh sách các khóa học bạn đã yêu thích ({favoriteList.length} khóa học)
              </p>
            </div>
          </div>

          {/* 3. STATUS TABS & SORT CONTROLS BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 pb-4 gap-4">
            
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setStatusTab('all')}
                className={`pb-2 text-xs sm:text-sm font-extrabold transition-all border-b-2 cursor-pointer ${
                  statusTab === 'all'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Tất cả
              </button>
              <button
                onClick={() => setStatusTab('unregistered')}
                className={`pb-2 text-xs sm:text-sm font-extrabold transition-all border-b-2 cursor-pointer ${
                  statusTab === 'unregistered'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Chưa đăng ký
              </button>
              <button
                onClick={() => setStatusTab('registered')}
                className={`pb-2 text-xs sm:text-sm font-extrabold transition-all border-b-2 cursor-pointer ${
                  statusTab === 'registered'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Đã đăng ký
              </button>
            </div>

            {/* Sort Dropdown & View Mode Buttons */}
            <div className="flex items-center gap-4 shrink-0 self-end sm:self-auto">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <span>Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-xs"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="rating">Đánh giá cao nhất</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>

              {/* View Toggle Buttons */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Giao diện lưới"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-blue-50 text-blue-600 font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Giao diện danh sách"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* 4. MAIN 2-COLUMN LAYOUT (FILTER SIDEBAR + COURSES GRID) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* LEFT SIDEBAR: BỘ LỌC (3 Cols) */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Filter className="w-4 h-4 text-slate-500" />
                  <span>Bộ lọc</span>
                </h3>
              </div>

              {/* Accordion 1: Danh mục */}
              <div className="space-y-3 border-b border-slate-100 pb-4">
                <button
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  className="w-full flex items-center justify-between text-xs font-black text-slate-900 cursor-pointer"
                >
                  <span>Danh mục</span>
                  {isCategoryOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isCategoryOpen && (
                  <div className="space-y-2 pt-1 text-xs font-semibold text-slate-700">
                    {(apiCategories.length > 0 ? apiCategories : [
                      { id: 'Lập trình', label: 'Lập trình', count: 18 },
                      { id: 'Thiết kế', label: 'Thiết kế', count: 6 },
                      { id: 'Kinh doanh', label: 'Kinh doanh', count: 3 },
                      { id: 'Marketing', label: 'Marketing', count: 2 },
                      { id: 'Công nghệ thông tin', label: 'Công nghệ thông tin', count: 2 },
                    ]).map((cat) => {
                      const isChecked = selectedCategories.includes(cat.label || cat.id);
                      return (
                        <label key={cat.id} className="flex items-center justify-between cursor-pointer group hover:text-blue-600 transition-colors">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelection(selectedCategories, setSelectedCategories, cat.label || cat.id)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={isChecked ? 'font-bold text-blue-600' : ''}>{cat.label || cat.id}</span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">{cat.count}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Accordion 2: Cấp độ */}
              <div className="space-y-3 border-b border-slate-100 pb-4">
                <button
                  onClick={() => setIsLevelOpen(!isLevelOpen)}
                  className="w-full flex items-center justify-between text-xs font-black text-slate-900 cursor-pointer"
                >
                  <span>Cấp độ</span>
                  {isLevelOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isLevelOpen && (
                  <div className="space-y-2 pt-1 text-xs font-semibold text-slate-700">
                    {[
                      { name: 'Beginner', count: 12 },
                      { name: 'Intermediate', count: 11 },
                      { name: 'Advanced', count: 5 },
                    ].map((lvl) => {
                      const isChecked = selectedLevels.includes(lvl.name);
                      return (
                        <label key={lvl.name} className="flex items-center justify-between cursor-pointer group hover:text-blue-600 transition-colors">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelection(selectedLevels, setSelectedLevels, lvl.name)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={isChecked ? 'font-bold text-blue-600' : ''}>{lvl.name}</span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">{lvl.count}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Accordion 3: Giá */}
              <div className="space-y-3 pb-2">
                <button
                  onClick={() => setIsPriceOpen(!isPriceOpen)}
                  className="w-full flex items-center justify-between text-xs font-black text-slate-900 cursor-pointer"
                >
                  <span>Giá</span>
                  {isPriceOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isPriceOpen && (
                  <div className="space-y-2 pt-1 text-xs font-semibold text-slate-700">
                    {[
                      { key: 'free', label: 'Miễn phí', count: 8 },
                      { key: 'under500', label: 'Dưới 500.000đ', count: 11 },
                      { key: '500to1000', label: '500.000đ - 1.000.000đ', count: 6 },
                      { key: 'above1000', label: 'Trên 1.000.000đ', count: 3 },
                    ].map((p) => {
                      const isChecked = selectedPrices.includes(p.key);
                      return (
                        <label key={p.key} className="flex items-center justify-between cursor-pointer group hover:text-blue-600 transition-colors">
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelection(selectedPrices, setSelectedPrices, p.key)}
                              className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <span className={isChecked ? 'font-bold text-blue-600' : ''}>{p.label}</span>
                          </div>
                          <span className="text-[11px] font-bold text-slate-400">{p.count}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Nút Xóa bộ lọc */}
              <button
                onClick={handleClearFilters}
                className="w-full py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 text-xs font-extrabold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>Xóa bộ lọc</span>
              </button>

            </div>

            {/* RIGHT COLUMN: COURSES GRID / EMPTY STATE */}
            <div className="lg:col-span-9 space-y-6">
              
              {isLoading ? (
                <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 text-xs font-semibold">
                  Đang tải danh sách yêu thích...
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/80 p-12 sm:p-16 text-center space-y-4 shadow-xs">
                  <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
                    <Heart className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">Danh sách yêu thích trống</h3>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      {favoriteList.length === 0 
                        ? 'Bạn chưa có khóa học nào trong danh sách yêu thích.' 
                        : 'Không có khóa học nào khớp với các bộ lọc bạn đã chọn.'}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/courses')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer inline-block"
                  >
                    Khám phá khóa học ngay
                  </button>
                </div>
              ) : (
                <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
                  {filteredCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => navigate(`/courses/${course.id}`)}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer overflow-hidden group flex flex-col justify-between"
                    >
                      <div className="relative aspect-video overflow-hidden bg-slate-100">
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          onClick={(e) => handleRemoveFavorite(e, course.id, course.title, course.realId)}
                          className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/90 hover:bg-rose-50 text-rose-500 shadow-sm transition-all cursor-pointer"
                          title="Bỏ yêu thích"
                        >
                          <Heart className="w-4 h-4 fill-rose-500" />
                        </button>
                      </div>

                      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between text-left">
                        <div className="space-y-2">
                          <h3 className="font-black text-slate-900 text-xs sm:text-sm line-clamp-2 group-hover:text-emerald-600 transition-colors leading-snug">
                            {course.title}
                          </h3>

                          <div className="flex items-center gap-2 pt-1">
                            <img
                              src={course.instructorAvatar}
                              alt={course.instructor}
                              className="w-5 h-5 rounded-full object-cover border border-slate-200"
                            />
                            <span className="text-[11px] font-semibold text-slate-500 truncate">
                              {course.instructor}
                            </span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1 font-bold text-amber-500">
                              <Star className="w-3.5 h-3.5 fill-amber-400" />
                              <span>{course.rating}</span>
                              <span className="text-slate-400 font-medium">({course.studentsCount})</span>
                            </div>

                            <div className="flex items-center gap-1 text-slate-400 font-medium">
                              <Users className="w-3 h-3" />
                              <span>{course.studentsCount}</span>
                            </div>
                          </div>

                          <div className="pt-1 flex items-baseline gap-2 flex-wrap">
                            {course.price === 0 ? (
                              <span className="text-base font-black text-emerald-600">Miễn phí</span>
                            ) : (
                              <>
                                <span className="text-base font-black text-slate-900">
                                  {course.price.toLocaleString('vi-VN')}đ
                                </span>
                                {course.originalPrice && (
                                  <span className="text-xs font-medium text-slate-400 line-through">
                                    {course.originalPrice.toLocaleString('vi-VN')}đ
                                  </span>
                                )}
                              </>
                            )}
                          </div>

                          <div className="pt-1">
                            {course.isEnrolled ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/learn/${course.id}`);
                                }}
                                className="w-full py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors cursor-pointer"
                              >
                                <Check className="w-4 h-4" />
                                <span>Vào học ngay</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const isFree = Boolean((course as any).isFree || Number(course.price || 0) === 0);
                                  if (isFree) {
                                    toast.success(`Đăng ký tham gia thành công khóa học miễn phí: ${course.title}`);
                                    navigate(`/learn/${course.id}`);
                                  } else {
                                    navigate(`/checkout?courseId=${course.id}`);
                                  }
                                }}
                                className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                {(course as any).isFree || Number(course.price || 0) === 0 ? <PlayCircle className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                                <span>{(course as any).isFree || Number(course.price || 0) === 0 ? 'Tham gia ngay' : 'Mua ngay'}</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 5. PAGINATION BAR */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
                
                {/* Page Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ‹
                  </button>

                  <button
                    onClick={() => setCurrentPage(1)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-colors cursor-pointer ${
                      currentPage === 1 ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    1
                  </button>

                  <button
                    onClick={() => setCurrentPage(2)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-colors cursor-pointer ${
                      currentPage === 2 ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    2
                  </button>

                  <button
                    onClick={() => setCurrentPage(3)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-colors cursor-pointer ${
                      currentPage === 3 ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    3
                  </button>

                  <span className="px-1 text-slate-400 font-bold">...</span>

                  <button
                    onClick={() => setCurrentPage(7)}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black transition-colors cursor-pointer ${
                      currentPage === 7 ? 'bg-blue-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    7
                  </button>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(7, p + 1))}
                    disabled={currentPage === 7}
                    className="w-8 h-8 rounded-xl border border-slate-200 bg-white flex items-center justify-center font-bold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    ›
                  </button>
                </div>

                {/* Counter text */}
                <div className="text-slate-500 font-medium">
                  Hiển thị: <span className="font-bold text-slate-900">1 - {totalCount}</span> của <span className="font-bold text-slate-900">{favoriteList.length} khóa học</span>
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>
    </PageTransition>
  );
}
