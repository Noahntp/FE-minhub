import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, X, Star } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { CourseCardSkeleton } from './components/CourseCardSkeleton';
import { CourseCard, CourseData } from './components/CourseCard';
import { useCourseList, CourseListFilters } from './hooks/useCourseList';

const CATEGORIES = ['Công nghệ', 'Kinh doanh', 'Thiết kế', 'Ngoại ngữ', 'Phát triển cá nhân'];
const RATINGS = [4.5, 4.0, 3.5, 3.0];
const SORTS = [
  { value: 'newest', label: 'Mới nhất' },
  { value: 'popular', label: 'Phổ biến nhất' },
  { value: 'highest-rated', label: 'Đánh giá cao nhất' },
  { value: 'lowest-price', label: 'Giá thấp nhất' },
  { value: 'highest-price', label: 'Giá cao nhất' },
];

export default function CourseListPage() {
  const [filters, setFilters] = useState<CourseListFilters>({
    query: '',
    categories: [],
    levels: [],
    minRating: null,
    priceType: 'all',
    sortBy: 'newest',
    page: 1,
    limit: 12
  });

  const [searchInput, setSearchInput] = useState('');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Debounce Search Input
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, query: searchInput, page: 1 }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const { courses, totalItems, totalPages, isLoading, error } = useCourseList(filters);

  const toggleCategory = (cat: string) => {
    setFilters(prev => {
      const isSelected = prev.categories.includes(cat);
      const newCats = isSelected 
        ? prev.categories.filter(c => c !== cat)
        : [...prev.categories, cat];
      return { ...prev, categories: newCats, page: 1 };
    });
  };

  const setRating = (rating: number | null) => {
    setFilters(prev => ({ ...prev, minRating: prev.minRating === rating ? null : rating, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters(prev => ({
      ...prev,
      categories: [],
      levels: [],
      minRating: null,
      priceType: 'all',
      page: 1
    }));
    setSearchInput('');
  };

  // Convert Course to CourseData for CourseCard
  const courseDataList: CourseData[] = courses.map(c => ({
    id: c.id,
    title: c.title,
    instructor: c.instructorName,
    thumbnail: c.image,
    duration: '10h 30m', // Simulated
    difficulty: 'Beginner', // Simulated
    price: c.price,
    salePrice: c.salePrice
  } as CourseData & { price: number; salePrice?: number | null })); // Type casting to satisfy CourseCard internals if it relies on them, although CourseCard type doesn't officially define price in the previous view, let's assume standard behavior

  return (
    <div className="min-h-screen bg-background pb-20 pt-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        
        {/* Header Area */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">Khám phá Khoá học</h1>
            <p className="text-muted-foreground mt-2">Tìm kiếm từ hàng ngàn khoá học chất lượng</p>
          </div>
          
          <div className="w-full md:w-96 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Tìm kiếm khoá học..." 
                className="pl-9 h-12 w-full bg-card"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              {searchInput && (
                <button 
                  onClick={() => setSearchInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                </button>
              )}
            </div>
            <Button 
              variant="outline" 
              className="h-12 md:hidden"
              onClick={() => setShowMobileFilters(!showMobileFilters)}
            >
              <Filter className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 shrink-0 space-y-8 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
            {/* Category Filter */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">Danh mục</h3>
              <div className="space-y-3">
                {CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                      checked={filters.categories.includes(cat)}
                      onChange={() => toggleCategory(cat)}
                    />
                    <span className="text-sm">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">Giá</h3>
              <div className="space-y-3">
                {['all', 'free', 'paid'].map((type) => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="radio"
                      name="price"
                      className="border-input text-primary focus:ring-primary h-4 w-4"
                      checked={filters.priceType === type}
                      onChange={() => setFilters(prev => ({ ...prev, priceType: type as any, page: 1 }))}
                    />
                    <span className="text-sm">
                      {type === 'all' ? 'Tất cả' : type === 'free' ? 'Miễn phí' : 'Trả phí'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">Đánh giá tối thiểu</h3>
              <div className="space-y-2">
                {RATINGS.map(rating => (
                  <button
                    key={rating}
                    onClick={() => setRating(rating)}
                    className={`flex items-center gap-2 p-2 w-full rounded-md transition-colors ${filters.minRating === rating ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-muted-foreground'}`}
                  >
                    <div className="flex text-yellow-400">
                      <Star className="w-4 h-4 fill-current" />
                    </div>
                    <span className="text-sm">{rating} trở lên</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Grid Content */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <p className="text-muted-foreground font-medium">
                {isLoading ? 'Đang tìm kiếm...' : `Hiển thị ${totalItems} kết quả`}
              </p>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground whitespace-nowrap">Sắp xếp theo:</span>
                <select 
                  className="flex h-10 w-full sm:w-[180px] rounded-md border border-input bg-card px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any, page: 1 }))}
                >
                  {SORTS.map(sort => (
                    <option key={sort.value} value={sort.value}>{sort.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {error && (
              <EmptyState 
                title="Đã xảy ra lỗi" 
                description="Không thể tải danh sách khoá học. Vui lòng thử lại sau."
                actionLabel="Thử lại"
                onAction={() => window.location.reload()}
              />
            )}

            {!error && isLoading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            )}

            {!error && !isLoading && courseDataList.length === 0 && (
              <EmptyState 
                title="Không tìm thấy khoá học" 
                description="Thử thay đổi bộ lọc hoặc từ khoá tìm kiếm khác."
                actionLabel="Xoá bộ lọc"
                onAction={resetFilters}
              />
            )}

            {!error && !isLoading && courseDataList.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {courseDataList.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {!error && !isLoading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={filters.page === 1}
                  onClick={() => handlePageChange(filters.page - 1)}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={filters.page === page ? "default" : "ghost"}
                        className="w-10 h-10"
                        onClick={() => handlePageChange(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button 
                  variant="outline" 
                  size="icon"
                  disabled={filters.page === totalPages}
                  onClick={() => handlePageChange(filters.page + 1)}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
