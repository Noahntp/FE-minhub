import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyCourses, Course } from '@/services/course.service';
import { resolveMediaUrl } from '@/lib/media-url';
import { BookOpen, PlayCircle, Trophy } from 'lucide-react';

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMyCourses()
      .then(setCourses)
      .catch(err => setError(err.message || 'Lỗi tải danh sách khóa học của bạn'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-[#8b5e3c] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-stone-200">
        <h2 className="text-xl font-bold text-red-600 mb-2">Đã xảy ra lỗi</h2>
        <p className="text-stone-500 mb-6">{error}</p>
        <Link to="/login" className="px-6 py-2 bg-[#8b5e3c] text-white rounded-lg hover:bg-[#7a5234] transition-colors">
          Đăng nhập lại
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-stone-800 tracking-tight">Khu vực học tập</h1>
        <p className="text-stone-500 mt-2">Tiếp tục hành trình chinh phục tri thức của bạn.</p>
      </div>

      {courses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-200">
          <BookOpen className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-stone-700 mb-2">Bạn chưa có khóa học nào</h2>
          <p className="text-stone-500 mb-6">Hãy khám phá các khóa học hấp dẫn trên hệ thống nhé!</p>
          <Link to="/" className="px-6 py-3 bg-[#8b5e3c] text-white rounded-xl font-bold hover:bg-[#7a5234] transition-colors shadow-lg">
            Khám phá ngay
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Link 
              key={course.id} 
              to={`/learn/${course.id}`}
              className="group bg-white border border-stone-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all block relative"
            >
              <div className="relative aspect-video bg-stone-100 overflow-hidden">
                <img 
                  src={resolveMediaUrl(course.thumbnail_url)} 
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex justify-center items-center">
                  <PlayCircle className="w-12 h-12 text-white" />
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="font-bold text-stone-800 group-hover:text-[#8b5e3c] transition-colors line-clamp-2 min-h-[3rem]">
                  {course.title}
                </h3>
                <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                  <span>Giảng viên: <strong>{course.instructor?.full_name || 'Hệ thống'}</strong></span>
                </div>
                
                {/* Progress bar mock */}
                <div className="mt-5">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-stone-500 mb-1.5">
                    <span>Tiến độ</span>
                    <span className="text-[#8b5e3c]">0%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#8b5e3c] w-0 rounded-full"></div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
