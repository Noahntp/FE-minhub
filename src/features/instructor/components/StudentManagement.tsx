import React, { useState, useEffect } from 'react';
import { Users, Search, BookOpen, Clock, CheckCircle } from 'lucide-react';
import StudentDetailDrawer from '@/features/instructor/components/StudentDetailDrawer';

// Fetch from API directly inside this component.

interface StudentManagementProps {
  instructorCourses: any[];
}

export default function StudentManagement({ instructorCourses }: StudentManagementProps) {
  const [stats, setStats] = useState({ total_enrollments: 0, learning_count: 0, completed_count: 0 });
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filters
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  // Drawer state
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchLearners = async () => {
    setLoading(true);
    try {
      const res = (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      if (res?.success || res?.data?.success) {
        const payload = res.data?.data || res.data || res;
        setStats(payload.stats || { total_enrollments: 0, learning_count: 0, completed_count: 0 });
        setStudentsList(payload.list?.data || []);
        setTotalPages(payload.list?.last_page || 1);
        setTotalRecords(payload.list?.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch learners', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, [courseFilter, statusFilter, debouncedSearch, page]);

  return (
    <div className="space-y-6 animate-fade-in text-xs text-left relative">
      
      {/* Drawer */}
      {selectedEnrollmentId && (
        <StudentDetailDrawer 
          enrollmentId={selectedEnrollmentId} 
          onClose={() => setSelectedEnrollmentId(null)} 
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
        <div>
          <h3 className="text-base font-display font-bold text-main-normal flex items-center gap-1.5">
            <Users className="w-5 h-5 text-stone-850" /> Quản lý Học viên
          </h3>
          <p className="text-stone-500 text-[11px] mt-0.5">Quản lý và theo dõi tiến độ của tất cả học viên trong các khóa học của bạn.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div 
          onClick={() => { setStatusFilter('all'); setCourseFilter('all'); setPage(1); }}
          className="bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-bold text-stone-500">Tổng lượt ghi danh</span>
            <Users className="w-4 h-4 text-brand-normal group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl font-black text-stone-800">{stats.total_enrollments}</span>
        </div>

        <div 
          onClick={() => { setStatusFilter('learning'); setPage(1); }}
          className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group ${statusFilter === 'learning' ? 'ring-2 ring-blue-500 border-transparent' : ''}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-bold text-stone-500">Đang học</span>
            <Clock className="w-4 h-4 text-blue-500 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl font-black text-blue-600">{stats.learning_count}</span>
        </div>

        <div 
          onClick={() => { setStatusFilter('completed'); setPage(1); }}
          className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md cursor-pointer transition-all hover:-translate-y-1 group ${statusFilter === 'completed' ? 'ring-2 ring-emerald-500 border-transparent' : ''}`}
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] uppercase font-bold text-stone-500">Đã hoàn thành</span>
            <CheckCircle className="w-4 h-4 text-emerald-500 group-hover:scale-110 transition-transform" />
          </div>
          <span className="text-2xl font-black text-emerald-600">{stats.completed_count}</span>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white border rounded-2xl p-4 shadow-xs flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Tìm theo Tên hoặc Email..." 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal text-xs"
            />
          </div>
        </div>
        
        <div className="w-[180px]">
          <select
            value={courseFilter}
            onChange={(e) => { setCourseFilter(e.target.value); setPage(1); }}
            className="w-full text-xs font-semibold p-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal"
          >
            <option value="all">Tất cả khóa học</option>
            {instructorCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        <div className="w-[150px]">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full text-xs font-semibold p-2.5 border border-stone-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-normal"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="learning">Đang học</option>
            <option value="completed">Đã hoàn thành</option>
          </select>
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white border rounded-2xl overflow-hidden shadow-xs text-[11.5px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="py-3 px-4 font-bold text-stone-500 uppercase text-[10px]">Học viên</th>
                <th className="py-3 px-4 font-bold text-stone-500 uppercase text-[10px] w-1/4">Khóa học</th>
                <th className="py-3 px-4 font-bold text-stone-500 uppercase text-[10px]">Tiến độ</th>
                <th className="py-3 px-4 font-bold text-stone-500 uppercase text-[10px]">Lần học gần nhất</th>
                <th className="py-3 px-4 font-bold text-stone-500 uppercase text-[10px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeleton rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-3 px-4"><div className="w-32 h-8 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-3 px-4"><div className="w-full h-8 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-3 px-4"><div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-3 px-4"><div className="w-24 h-4 bg-gray-200 animate-pulse rounded"></div></td>
                    <td className="py-3 px-4"></td>
                  </tr>
                ))
              ) : studentsList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                      Không tìm thấy học viên nào.
                    </div>
                  </td>
                </tr>
              ) : (
                studentsList.map((enrollment) => (
                  <tr key={enrollment.id} className="border-b last:border-b-0 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 cursor-pointer" onClick={() => setSelectedEnrollmentId(enrollment.id)}>
                        <img src={enrollment.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(enrollment.user.name)}&background=random`} alt="avt" className="w-9 h-9 rounded-full object-cover" />
                        <div>
                          <span className="font-bold text-stone-800 hover:text-brand-normal block">{enrollment.user.name}</span>
                          <span className="text-[10px] text-stone-500">{enrollment.user.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-stone-100 flex items-center justify-center shrink-0">
                          <BookOpen className="w-4 h-4 text-stone-400" />
                        </div>
                        <span className="text-stone-800 font-semibold line-clamp-2" title={enrollment.course.title}>{enrollment.course.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 text-right font-mono font-bold text-brand-normal">{Number(enrollment.progress).toFixed(0)}%</span>
                        <div className="w-20 h-1.5 bg-stone-200 rounded-full overflow-hidden">
                          <div style={{ width: `${enrollment.progress}%` }} className="h-full bg-brand-normal rounded-full transition-all"></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-stone-600">
                      {enrollment.last_accessed_at ? new Date(enrollment.last_accessed_at).toLocaleString('vi-VN') : 'Chưa từng học'}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedEnrollmentId(enrollment.id)}
                        className="text-[10px] font-bold text-brand-normal hover:text-white border border-brand-normal hover:bg-brand-normal px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        Xem chi tiết
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center p-4 border-t">
            <span className="text-stone-500 font-medium">Tổng số: {totalRecords} học viên</span>
            <div className="flex gap-1">
              <button 
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-stone-50"
              >
                Trang trước
              </button>
              <span className="px-3 py-1 font-bold bg-slate-100 rounded">{page} / {totalPages}</span>
              <button 
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-stone-50"
              >
                Trang sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
