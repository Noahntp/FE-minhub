import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { INITIAL_COURSES } from '@/shared/data';
import { Filter, SlidersHorizontal, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { CourseCard } from '@/features/courses/components/CourseCard';
import { EmptyState } from '@/shared/components/ui/EmptyState';

const CATEGORY_INFO: Record<string, { title: string; desc: string; icon: string }> = {
  'web-development': {
    title: 'Lập trình Web',
    desc: 'Làm chủ các công nghệ web hiện đại từ Frontend đến Backend. Xây dựng các ứng dụng web thực tế.',
    icon: '🌐'
  },
  'artificial-intelligence': {
    title: 'Trí tuệ nhân tạo (AI)',
    desc: 'Khám phá Machine Learning, Deep Learning và cách ứng dụng Generative AI vào công việc.',
    icon: '🤖'
  },
  'design': {
    title: 'Thiết kế (UI/UX)',
    desc: 'Học cách thiết kế giao diện người dùng đẹp mắt và trải nghiệm người dùng tuyệt vời.',
    icon: '✨'
  },
  'marketing': {
    title: 'Kinh doanh & Marketing',
    desc: 'Phát triển kỹ năng kinh doanh số, SEO, và chiến lược tiếp thị đa kênh.',
    icon: '📈'
  }
};

export default function CategoryDetailPage() {
  const { slug } = useParams();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortOption, setSortOption] = useState('popular');
  const [courses, setCourses] = useState(INITIAL_COURSES);

  const category = slug ? CATEGORY_INFO[slug] : null;

  useEffect(() => {
    // Mock fetching courses for this category
    // In a real app, this would filter by category slug
    let result = INITIAL_COURSES;
    
    if (sortOption === 'price_asc') {
      result.sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
    } else if (sortOption === 'price_desc') {
      result.sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
    } else if (sortOption === 'newest') {
      result.sort((a, b) => (a.isNew ? -1 : 1));
    } else {
      result.sort((a, b) => b.enrolledCount - a.enrolledCount);
    }
    
    setCourses([...result]);
  }, [slug, sortOption]);

  if (!category) {
    return (
      <PageTransition>
        <div className="max-w-7xl mx-auto py-20 px-4 text-center">
          <h1 className="text-3xl font-bold mb-4">Không tìm thấy danh mục</h1>
          <Button asChild>
            <Link to="/courses">Xem tất cả khóa học</Link>
          </Button>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      {/* Category Banner */}
      <div className="bg-primary/5 border-b">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-6">
            <Link to="/" className="hover:text-primary">Trang chủ</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/courses" className="hover:text-primary">Khóa học</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-foreground">{category.title}</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-5xl md:text-6xl">{category.icon}</div>
            <div>
              <h1 className="text-3xl md:text-5xl font-black font-suisseintl tracking-tight mb-4">
                {category.title}
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl">
                {category.desc}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold">
            Hiển thị {courses.length} khóa học
          </h2>
          
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
                <option value="popular">Phổ biến nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="rating">Đánh giá cao</option>
                <option value="price_asc">Giá: Thấp đến cao</option>
                <option value="price_desc">Giá: Cao đến thấp</option>
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          {isFilterOpen && (
            <div className="w-full md:w-64 shrink-0 space-y-6">
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
              
              <div>
                <h3 className="font-bold mb-3">Tính năng</h3>
                <div className="space-y-2">
                  {['Có chứng chỉ', 'Có bài tập thực hành', 'Phụ đề Tiếng Việt'].map((feature, idx) => (
                    <label key={idx} className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-lg">
                      <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary/20" />
                      <span className="text-sm">{feature}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          
          {/* Results */}
          <div className="flex-1">
            {courses.length === 0 ? (
              <EmptyState 
                icon={Filter}
                title="Không có khóa học"
                description="Danh mục này hiện chưa có khóa học nào."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses.map(course => (
                  <CourseCard key={course.id} course={course as any} />
                ))}
              </div>
            )}
            
            {courses.length > 0 && (
              <div className="mt-12 flex justify-center">
                <Button variant="outline" className="rounded-full px-8">Tải thêm</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
