import React, { useState, useEffect, useMemo } from 'react';
import { Search, Compass, ChevronRight, GraduationCap } from 'lucide-react';
import { Course, User } from '../types';
import { ApiService } from '../services/api';
import { INSTRUCTORS_DATA } from '../data';

interface InstructorCoursesPageProps {
  instructorId: string;
  navigateTo: (path: string) => void;
  renderCourseCard: (course: Course) => React.ReactNode;
  currentUser: User;
}

export default function InstructorCoursesPage({
  instructorId,
  navigateTo,
  renderCourseCard,
  currentUser
}: InstructorCoursesPageProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync state with URL params
  const queryParams = new URLSearchParams(window.location.search);
  const initialSearch = queryParams.get('search') || '';
  const initialCategory = queryParams.get('category') || 'All';
  const initialSort = queryParams.get('sort') || 'popular';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState(initialSort);

  const instructor = INSTRUCTORS_DATA.find(inst => inst.id === instructorId);

  useEffect(() => {
    let active = true;
    setLoading(true);
    ApiService.getPublicCoursesByInstructor(instructorId)
      .then(data => {
        if (active) {
          setCourses(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [instructorId, instructor]);

  // Update URL whenever filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== 'All') params.set('category', selectedCategory);
    if (sortBy !== 'popular') params.set('sort', sortBy);

    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }, [searchQuery, selectedCategory, sortBy]);

  const filteredAndSortedCourses = useMemo(() => {
    let result = [...courses];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        c.title.toLowerCase().includes(q) || 
        c.category.toLowerCase().includes(q) ||
        (c.subcategory && c.subcategory.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(c => c.category === selectedCategory);
    }

    if (sortBy === 'newest') {
      // Mocking newest by ID or assuming courses are already ordered somehow. We don't have createdAt on mock Course type.
      result.reverse(); 
    } else if (sortBy === 'rating') {
      result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'price-asc') {
      result.sort((a, b) => (a.salePrice ?? a.price) - (b.salePrice ?? b.price));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => (b.salePrice ?? b.price) - (a.salePrice ?? a.price));
    } else {
      // popular
      result.sort((a, b) => (b.enrolledCount || 0) - (a.enrolledCount || 0));
    }

    return result;
  }, [courses, searchQuery, selectedCategory, sortBy]);

  if (!instructor) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <GraduationCap className="w-16 h-16 text-stone-300 mb-4" />
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Giảng viên không tồn tại</h2>
        <p className="text-stone-500 mb-6 max-w-md">Chúng tôi không tìm thấy hồ sơ giảng viên này trong hệ thống.</p>
        <button onClick={() => navigateTo('home')} className="px-6 py-2.5 bg-brand-normal text-white font-bold rounded-xl shadow-md hover:bg-brand-dark transition-all cursor-pointer">Về Trang Chủ</button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in min-h-screen text-left">
      
      {/* Breadcrumb & Header Info */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-[11px] font-bold text-stone-400 mb-4 uppercase tracking-wider">
          <button onClick={() => navigateTo('home')} className="hover:text-brand-normal transition-colors cursor-pointer">Trang Chủ</button>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-stone-600">Khóa học của {instructor.name}</span>
        </div>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm">
          <img 
            src={instructor.avatar} 
            alt={instructor.name} 
            className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-md shrink-0"
          />
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-extrabold text-stone-800 mb-1">{instructor.name}</h1>
            <p className="text-stone-500 text-sm mb-3 font-medium">{instructor.title}</p>
            <p className="text-stone-600 text-xs italic leading-relaxed max-w-3xl">"{instructor.bio}"</p>
          </div>
          <div className="md:ml-auto flex items-center gap-2 mt-4 md:mt-0">
            <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-2 rounded-xl text-center">
              <div className="text-[10px] font-bold uppercase mb-0.5">Học viên</div>
              <div className="text-base font-extrabold">{instructor.studentsCount.toLocaleString()}</div>
            </div>
            <div className="bg-brand-50 border border-brand-200 text-brand-800 px-4 py-2 rounded-xl text-center">
              <div className="text-[10px] font-bold uppercase mb-0.5">Khóa học</div>
              <div className="text-base font-extrabold">{instructor.coursesCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Course List */}
      <div className="space-y-6">
        <div className="bg-white border border-mist p-5 rounded-3xl space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 border-b border-mist pb-4 text-left">
            <div>
              <h3 className="text-xl md:text-2xl font-extrabold text-deep-ink flex items-center gap-2">
                <Compass className="w-6 h-6 text-deep-indigo" /> 
                {searchQuery ? `Tìm kiếm: "${searchQuery}"` : `Tất cả khóa học (${filteredAndSortedCourses.length})`}
              </h3>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm khóa học của giảng viên..."
                className="w-full text-xs pl-9 pr-3 py-2.5 border border-brand-light-active rounded-xl focus:ring-1 focus:ring-brand-normal focus:outline-none bg-slate-50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-brand-light-active rounded-xl px-3 py-2.5 bg-white text-xs font-bold text-stone-700 focus:outline-none focus:border-brand-normal cursor-pointer"
              >
                <option value="All">Tất cả danh mục</option>
                <option value="Artificial Intelligence">Trí tuệ nhân tạo (AI)</option>
                <option value="Design">Thiết kế</option>
                <option value="Marketing">Kinh doanh & Tiếp thị</option>
                <option value="Development">Lập trình</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-brand-light-active rounded-xl px-3 py-2.5 bg-white text-xs font-bold text-stone-700 focus:outline-none focus:border-brand-normal cursor-pointer"
              >
                <option value="popular">Phổ biến nhất</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá từ thấp đến cao</option>
                <option value="price-desc">Giá từ cao đến thấp</option>
              </select>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-normal"></div>
          </div>
        ) : filteredAndSortedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCourses.map(course => renderCourseCard(course))}
          </div>
        ) : (
          <div className="bg-white border border-dashed rounded-3xl p-10 text-center flex flex-col items-center justify-center shadow-xs">
             <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-stone-300" />
             </div>
             <h4 className="text-lg font-bold text-stone-800 mb-2">Không có khóa học nào phù hợp</h4>
             <p className="text-xs text-stone-500 mb-4 max-w-sm mx-auto">
                Hãy thử thay đổi từ khóa tìm kiếm hoặc điều chỉnh bộ lọc để tìm được khóa học ưng ý.
             </p>
             <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSortBy('popular');
                }}
                className="px-5 py-2 text-xs font-bold bg-brand-normal text-white rounded-xl shadow hover:bg-brand-dark transition-all cursor-pointer mx-auto block mt-4"
             >
                Xóa tất cả bộ lọc
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
