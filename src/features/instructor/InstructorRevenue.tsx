import React, { useState, useEffect } from 'react';
import { 
  Search, Activity, DollarSign, 
  ChevronLeft, ChevronRight, X
} from 'lucide-react';

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
};

interface InstructorRevenueProps {
  instructorId: string;
  courses: any[];
}

export const InstructorRevenue: React.FC<InstructorRevenueProps> = ({ instructorId, courses }) => {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalGross: 0,
    totalPlatformFee: 0,
    totalTransactions: 0,
    totalStudentsPaid: 0
  });

  const [revenues, setRevenues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 10, totalPages: 1 });
  
  // Filters
  const [courseFilter, setCourseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  // Time range
  const [timePreset, setTimePreset] = useState('thisMonth');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Detail
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const applyTimePreset = (preset: string) => {
    const now = new Date();
    let start, end;
    switch (preset) {
      case 'today':
        start = new Date(now.setHours(0,0,0,0));
        end = new Date();
        break;
      case '7days':
        start = new Date(now.setDate(now.getDate() - 7));
        end = new Date();
        break;
      case '30days':
        start = new Date(now.setDate(now.getDate() - 30));
        end = new Date();
        break;
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date();
        break;
      case 'lastMonth':
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        end = new Date(now.getFullYear(), now.getMonth(), 0);
        break;
      case 'thisYear':
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date();
        break;
      default:
        start = null;
        end = null;
    }
    
    setTimePreset(preset);
    if (start && end) {
      setStartDate(start.toISOString().split('T')[0]);
      setEndDate(end.toISOString().split('T')[0]);
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  // Initialize default time preset
  useEffect(() => {
    if (timePreset === 'thisMonth' && !startDate) {
      applyTimePreset('thisMonth');
    }
  }, []);

  useEffect(() => {
    if (!instructorId) return;
    
    const fetchStats = async () => {
      try {
        const res = (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
        setStats(res);
      } catch (err) {
        console.error("Failed to load revenue stats", err);
      }
    };

    fetchStats();
  }, [instructorId, startDate, endDate]);

  useEffect(() => {
    if (!instructorId) return;

    const fetchRevenues = async () => {
      setLoading(true);
      try {
        const res = (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
        setRevenues(res.data);
        setMeta(res.meta);
      } catch (err) {
        console.error("Failed to load revenues", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRevenues();
  }, [instructorId, courseFilter, statusFilter, debouncedSearch, startDate, endDate, meta.page, meta.limit]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= meta.totalPages) {
      setMeta({ ...meta, page: newPage });
    }
  };

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in text-xs">
      <h3 className="text-base font-display font-bold text-main-normal text-left flex items-center gap-1">
        <Activity className="w-4 h-4 text-emerald-600" /> Quản Lý Doanh Thu
      </h3>

      {/* QUICK FILTERS */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          {['today', '7days', '30days', 'thisMonth', 'lastMonth', 'thisYear', 'custom'].map(preset => {
            const labels: any = {
              'today': 'Hôm nay', '7days': '7 ngày qua', '30days': '30 ngày qua',
              'thisMonth': 'Tháng này', 'lastMonth': 'Tháng trước', 'thisYear': 'Năm nay', 'custom': 'Tùy chỉnh'
            };
            return (
              <button
                key={preset}
                onClick={() => applyTimePreset(preset)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${timePreset === preset ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'} border`}
              >
                {labels[preset]}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap gap-4 items-end">
          {timePreset === 'custom' && (
            <>
              <div>
                <label className="block text-stone-500 font-bold mb-1">Từ ngày</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border rounded-lg p-2" />
              </div>
              <div>
                <label className="block text-stone-500 font-bold mb-1">Đến ngày</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border rounded-lg p-2" />
              </div>
            </>
          )}

          <div className="flex-1 min-w-[200px]">
            <label className="block text-stone-500 font-bold mb-1">Khóa học</label>
            <select value={courseFilter} onChange={e => {setCourseFilter(e.target.value); setMeta({...meta, page:1})}} className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-emerald-500">
              <option value="all">Tất cả khóa học</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <div className="w-40">
            <label className="block text-stone-500 font-bold mb-1">Trạng thái</label>
            <select value={statusFilter} onChange={e => {setStatusFilter(e.target.value); setMeta({...meta, page:1})}} className="border rounded-lg p-2 w-full focus:ring-2 focus:ring-emerald-500">
              <option value="all">Tất cả</option>
              <option value="paid">Đã thanh toán (Paid)</option>
              <option value="available">Sẵn sàng rút (Available)</option>
              <option value="settled">Đã quyết toán (Settled)</option>
              <option value="pending">Chờ xử lý (Pending)</option>
            </select>
          </div>

          <div className="w-64 relative">
            <label className="block text-stone-500 font-bold mb-1">Tìm kiếm giao dịch</label>
            <input 
              type="text" 
              placeholder="Tên khóa học..." 
              value={searchQuery}
              onChange={e => {setSearchQuery(e.target.value); setMeta({...meta, page:1})}}
              className="border rounded-lg pl-8 p-2 w-full focus:ring-2 focus:ring-emerald-500" 
            />
            <Search className="w-4 h-4 text-stone-400 absolute left-2 top-[28px]" />
          </div>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white p-5 rounded-xl shadow-md">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 block">Doanh Thu Thực Nhận</span>
          <span className="text-3xl font-black block mt-2">{formatVND(stats.totalRevenue)}</span>
        </div>
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Tổng Giao Dịch (Gross)</span>
          <span className="text-xl font-bold text-stone-800 block mt-2">{formatVND(stats.totalGross)}</span>
        </div>
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Phí Nền Tảng (MindHub Fee)</span>
          <span className="text-xl font-bold text-red-500 block mt-2">-{formatVND(stats.totalPlatformFee)}</span>
        </div>
        <div className="bg-white border p-5 rounded-xl shadow-sm">
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block">Số lượng giao dịch</span>
          <span className="text-xl font-bold text-stone-800 block mt-2">{stats.totalTransactions} đơn</span>
        </div>
      </div>

      {/* REVENUE TABLE */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden text-sm">
        <div className="p-4 border-b bg-stone-50 flex justify-between items-center">
          <h4 className="font-bold text-stone-800">Danh sách giao dịch</h4>
          <span className="text-xs text-stone-500 font-semibold">Tổng: {meta.total} giao dịch</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 text-xs text-stone-500 uppercase">
              <tr>
                <th className="px-4 py-3 border-b">Ngày giao dịch</th>
                <th className="px-4 py-3 border-b">Khóa học</th>
                <th className="px-4 py-3 border-b text-right">Tổng thanh toán</th>
                <th className="px-4 py-3 border-b text-right">Phí nền tảng</th>
                <th className="px-4 py-3 border-b text-right">Thu nhập của bạn</th>
                <th className="px-4 py-3 border-b text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y text-stone-700 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-stone-500">Đang tải dữ liệu...</td>
                </tr>
              ) : revenues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-stone-500">Không có giao dịch nào trong khoảng thời gian này.</td>
                </tr>
              ) : (
                revenues.map(rev => (
                  <tr key={rev.id} onClick={() => setSelectedTransaction(rev)} className="hover:bg-stone-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap">{formatDate(rev.created_at)}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate">{rev.course?.title || 'Khóa học không xác định'}</td>
                    <td className="px-4 py-3 text-right text-stone-500">{formatVND(rev.gross_amount)}</td>
                    <td className="px-4 py-3 text-right text-red-500">-{formatVND(rev.platform_fee_amount)}</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600">{formatVND(rev.instructor_amount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${rev.status === 'paid' ? 'bg-blue-100 text-blue-700' : rev.status === 'available' ? 'bg-emerald-100 text-emerald-700' : rev.status === 'settled' ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'}`}>
                        {rev.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        {!loading && meta.totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center bg-stone-50">
            <span className="text-xs text-stone-500 font-semibold">Trang {meta.page} / {meta.totalPages}</span>
            <div className="flex gap-2">
              <button 
                onClick={() => handlePageChange(meta.page - 1)}
                disabled={meta.page <= 1}
                className="p-1.5 border rounded bg-white text-stone-600 disabled:opacity-50 hover:bg-stone-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handlePageChange(meta.page + 1)}
                disabled={meta.page >= meta.totalPages}
                className="p-1.5 border rounded bg-white text-stone-600 disabled:opacity-50 hover:bg-stone-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TRANSACTION DETAIL DRAWER / POPUP */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
            <div className="p-4 border-b flex justify-between items-center bg-stone-50">
              <h3 className="font-bold text-lg text-stone-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Chi tiết Giao dịch
              </h3>
              <button onClick={() => setSelectedTransaction(null)} className="p-1 rounded-full hover:bg-stone-200 text-stone-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 text-sm font-medium">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-stone-500 block mb-1">Mã tham chiếu (Order ID)</span>
                  <span className="text-stone-800 bg-stone-100 px-2 py-0.5 rounded text-xs">{selectedTransaction.order_id || selectedTransaction.id}</span>
                </div>
                <div>
                  <span className="text-stone-500 block mb-1">Ngày tạo</span>
                  <span className="text-stone-800">{formatDate(selectedTransaction.created_at)}</span>
                </div>
              </div>

              <div>
                <span className="text-stone-500 block mb-1">Khóa học</span>
                <span className="text-stone-800 font-bold">{selectedTransaction.course?.title || 'Không xác định'}</span>
              </div>

              <div className="border-t border-b py-4 my-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Khách hàng thanh toán (Gross)</span>
                  <span className="text-stone-800">{formatVND(selectedTransaction.gross_amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-500">Phí MindHub giữ lại</span>
                  <span className="text-red-500">-{formatVND(selectedTransaction.platform_fee_amount)}</span>
                </div>
                <div className="flex justify-between items-center bg-emerald-50 p-2 rounded border border-emerald-100">
                  <span className="text-emerald-800 font-bold">Thực nhận của bạn</span>
                  <span className="text-emerald-700 font-black text-lg">{formatVND(selectedTransaction.instructor_amount)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-stone-500">Trạng thái dòng tiền</span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${selectedTransaction.status === 'paid' ? 'bg-blue-100 text-blue-700' : selectedTransaction.status === 'available' ? 'bg-emerald-100 text-emerald-700' : selectedTransaction.status === 'settled' ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-stone-600'}`}>
                  {selectedTransaction.status}
                </span>
              </div>
            </div>
            
            <div className="p-4 border-t bg-stone-50 flex justify-end">
              <button onClick={() => setSelectedTransaction(null)} className="px-4 py-2 font-bold text-stone-700 bg-white border rounded-xl hover:bg-stone-100 transition-colors">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
