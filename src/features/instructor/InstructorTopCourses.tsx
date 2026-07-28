import React, { useState, useEffect } from 'react';
import { Calendar, Filter, PlayCircle, Eye, BarChart2 } from 'lucide-react';
import { Course } from '@/shared/types';

interface InstructorTopCoursesProps {
  instructorId: string;
}

export const InstructorTopCourses: React.FC<InstructorTopCoursesProps> = ({ instructorId }) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [limit, setLimit] = useState<number>(5);

  const formatNumber = (val: number) => new Intl.NumberFormat('vi-VN').format(val);

  useEffect(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    let hasDate = true;

    switch (timeRange) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
      case '30days':
        start.setDate(now.getDate() - 30);
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        break;
      case 'all':
        hasDate = false;
        break;
      default:
        hasDate = false;
    }

    if (timeRange !== 'custom') {
      if (hasDate) {
        const startStr = new Date(start.getTime() - (start.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        const endStr = new Date(end.getTime() - (end.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
        setStartDate(startStr);
        setEndDate(endStr);
      } else {
        setStartDate('');
        setEndDate('');
      }
    }
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      setData(res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (instructorId) {
      fetchData();
    }
  }, [instructorId, startDate, endDate, statusFilter, limit]);

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm mb-8">
      {/* Header */}
      <div className="p-5 border-b border-stone-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-stone-50/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 rounded-lg text-rose-600">
            <BarChart2 className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-stone-800 text-lg">Top khóa học có nhiều lượt ghi danh nhất</h3>
        </div>

        <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg border border-stone-200">
          <button
            onClick={() => setLimit(5)}
            className={"px-4 py-1.5 text-xs font-bold rounded-md transition-all " + (limit === 5 ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500 hover:text-stone-700')}
          >
            TOP 5
          </button>
          <button
            onClick={() => setLimit(10)}
            className={"px-4 py-1.5 text-xs font-bold rounded-md transition-all " + (limit === 10 ? 'bg-white text-rose-600 shadow-sm' : 'text-stone-500 hover:text-stone-700')}
          >
            TOP 10
          </button>
        </div>
      </div>

      <div className="p-5">
        {/* Filters */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3.5 h-3.5" /> Thời gian ghi danh
              </label>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-stone-700"
              >
                <option value="all">Tất cả thời gian</option>
                <option value="today">Hôm nay</option>
                <option value="7days">7 ngày qua</option>
                <option value="30days">30 ngày qua</option>
                <option value="thisMonth">Tháng này</option>
                <option value="lastMonth">Tháng trước</option>
                <option value="thisYear">Năm nay</option>
                <option value="custom">Tùy chỉnh...</option>
              </select>
            </div>

            {timeRange === 'custom' && (
              <div className="flex items-center gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Từ ngày</label>
                  <input 
                    type="date" 
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-stone-700"
                  />
                </div>
                <div className="text-stone-400 mt-6">-</div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">Đến ngày</label>
                  <input 
                    type="date" 
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-stone-700"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-stone-500 uppercase tracking-wider mb-1.5">
                <Filter className="w-3.5 h-3.5" /> Trạng thái
              </label>
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm bg-white border border-stone-200 rounded-lg px-3 py-2 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-medium text-stone-700 w-48"
              >
                <option value="all">Tất cả (Trừ đã xoá)</option>
                <option value="published">Đang công khai</option>
                <option value="draft">Bản nháp</option>
                <option value="pending">Chờ duyệt</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Table */}
        <div className="overflow-x-auto relative min-h-[200px]">
          {loading && (
             <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
               <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mb-2"></div>
               <span className="text-sm font-bold text-stone-500">Đang tải dữ liệu...</span>
             </div>
          )}
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] uppercase font-bold text-stone-400 border-b border-stone-100">
                <th className="pb-3 pl-2 font-semibold">Hạng</th>
                <th className="pb-3 font-semibold">Khóa học</th>
                <th className="pb-3 font-semibold">Danh mục</th>
                <th className="pb-3 text-right">Lượt ghi danh</th>
                <th className="pb-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {data.map((c, idx) => {
                let cls = 'bg-stone-100 text-stone-500';
                if (idx === 0) cls = 'bg-amber-100 text-amber-700 shadow-sm';
                else if (idx === 1) cls = 'bg-slate-100 text-slate-700 shadow-sm';
                else if (idx === 2) cls = 'bg-orange-100 text-orange-700 shadow-sm';
                
                let statusCls = 'bg-stone-100 text-stone-600';
                let statusText = 'Unknown';
                if (c.status === 'published' || c.status === 'active') {
                   statusCls = 'bg-emerald-100 text-emerald-700';
                   statusText = 'Công khai';
                } else if (c.status === 'draft') {
                   statusCls = 'bg-amber-100 text-amber-700';
                   statusText = 'Bản nháp';
                } else if (c.status === 'pending') {
                   statusCls = 'bg-blue-100 text-blue-700';
                   statusText = 'Chờ duyệt';
                }

                return (
                  <tr key={c.id} className="border-b border-stone-50 hover:bg-rose-50/30 transition-colors group">
                    <td className="py-4 pl-2">
                      <span className={"w-7 h-7 rounded-full flex items-center justify-center text-xs font-black " + cls}>
                        #{idx + 1}
                      </span>
                    </td>
                    <td className="py-4 font-semibold text-stone-700">
                      <a href={"/course/" + c.id} className="flex items-center gap-3 hover:text-rose-600 transition-colors">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 shrink-0 overflow-hidden relative group/img">
                        {c.image ? (
                          <img src={c.image} alt={c.title} className="w-12 h-8 object-cover rounded shadow-sm" />
                        ) : (
                          <div className="w-12 h-8 bg-stone-100 flex items-center justify-center rounded shadow-sm text-stone-400">
                            <PlayCircle className="w-4 h-4" />
                          </div>
                        )}
                        </div>
                        <span className="font-semibold text-sm line-clamp-2">{c.title}</span>
                      </a>
                    </td>
                    <td className="py-4 text-stone-500 text-xs font-medium">
                      {c.category || 'Chưa phân loại'}
                    </td>
                    <td className="py-4 text-right">
                      <a href={"/instructor/students?courseId=" + c.id} className="inline-flex items-center justify-end font-bold text-rose-600 hover:text-rose-700 transition-colors group-hover:scale-105">
                        {formatNumber(c.enrollment_count ?? c.unique_learner_count ?? c.studentCount ?? 0)} <span className="text-xs font-normal text-gray-500 ml-1">HV</span>
                      </a>
                    </td>
                    <td className="py-4 text-center">
                       <span className={"px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider " + statusCls}>
                         {statusText}
                       </span>
                    </td>
                  </tr>
                )
              })}
              {data.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-stone-400 text-sm font-medium">
                    <div className="flex flex-col items-center justify-center">
                      <PlayCircle className="w-10 h-10 mb-2 opacity-20" />
                      Không tìm thấy dữ liệu phù hợp
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end">
          <a href="/instructor/courses" className="text-sm font-bold text-rose-600 hover:text-rose-700 transition-colors flex items-center gap-1">
            Xem tất cả <Eye className="w-4 h-4" />
          </a>
        </div>

      </div>
    </div>
  );
};
