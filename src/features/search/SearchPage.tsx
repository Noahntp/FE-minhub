import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { INITIAL_COURSES } from '@/shared/data';
import { Search, Filter, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { EmptyState } from '@/shared/components/ui/EmptyState';
import { CourseCard } from '@/features/courses/components/CourseCard';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  
  const [localQuery, setLocalQuery] = useState(query);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('relevant');
  
  const [filteredCourses, setFilteredCourses] = useState(INITIAL_COURSES);

  useEffect(() => {
    let result = INITIAL_COURSES;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.instructorName.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    
    // Sort
    if (sortOption === 'price_asc') {
      result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortOption === 'newest') {
      result.sort((a, b) => (a.isNew ? -1 : 1));
    } else {
      // relevant (mock logic)
      result.sort((a, b) => b.rating - a.rating);
    }
    
    setFilteredCourses([...result]);
  }, [query, sortOption]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(localQuery)}`);
    } else {
      navigate(`/search`);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Search Header */}
        <div className="mb-8 border-b pb-8">
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
              <Input 
                className="pl-12 h-12 rounded-2xl text-lg bg-muted shadow-none border-transparent focus-visible:ring-primary/20"
                placeholder="Tìm kiếm khoá học, kỹ năng, giảng viên..."
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="rounded-2xl h-12 px-8">
              Tìm kiếm
            </Button>
          </form>
          
          <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              {query ? (
                <h1 className="text-xl font-bold">
                  Hiển thị {filteredCourses.length} kết quả cho "{query}"
                </h1>
              ) : (
                <h1 className="text-xl font-bold">Khám phá tất cả khóa học</h1>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="gap-2 rounded-xl"
              >
                <SlidersHorizontal className="w-4 h-4" /> 
                Bộ lọc
              </Button>
              <div className="relative">
                <select 
                  className="appearance-none bg-background border rounded-xl px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="relevant">Liên quan nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="rating">Đánh giá cao</option>
                  <option value="price_asc">Giá: Thấp đến cao</option>
                  <option value="price_desc">Giá: Cao đến thấp</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-muted-foreground pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          {isFilterOpen && (
            <div className="w-full md:w-64 shrink-0 space-y-6">
              <div>
                <h3 className="font-bold mb-3 flex items-center gap-2"><Filter className="w-4 h-4" /> Danh mục</h3>
                <div className="space-y-2">
                  {['Lập trình Web', 'Trí tuệ nhân tạo', 'Thiết kế', 'Kinh doanh'].map((cat, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-lg">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary/20" />
                      <span className="text-sm">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold mb-3">Mức độ</h3>
                <div className="space-y-2">
                  {['Tất cả', 'Người mới bắt đầu', 'Trung cấp', 'Chuyên gia'].map((level, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-lg">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary/20" />
                      <span className="text-sm">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Results */}
          <div className="flex-1">
            {filteredCourses.length === 0 ? (
              <EmptyState 
                icon={Search}
                title="Không tìm thấy kết quả"
                description={`Chúng tôi không tìm thấy khóa học nào phù hợp với từ khóa "${query}". Hãy thử lại với từ khóa khác.`}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.map(course => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            )}
            
            {/* Pagination Mock */}
            {filteredCourses.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" disabled>Trước</Button>
                  <Button variant="default" size="sm">1</Button>
                  <Button variant="outline" size="sm">2</Button>
                  <Button variant="outline" size="sm">Sau</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
