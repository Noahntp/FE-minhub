import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, ChevronLeft, ChevronRight, Activity,
  CheckCircle, Clock, XCircle, DollarSign, BookOpen, Eye
} from 'lucide-react';
import TransactionDetailDrawer from '@/features/instructor/components/TransactionDetailDrawer';

interface TransactionManagementProps {
  instructorId: string | number;
}

export default function TransactionManagement({ instructorId }: TransactionManagementProps) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    total: 0,
    success: 0,
    pending: 0,
    failed: 0,
    total_revenue: 0
  });
  
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [timeRange, setTimeRange] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  
  // Drawer
  const [selectedTxnId, setSelectedTxnId] = useState<number | string | null>(null);

  // Instructor Courses for dropdown
  const [instructorCourses, setInstructorCourses] = useState<any[]>([]);

  useEffect(() => {
    // Load courses for filter
    Promise.resolve((Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any)).then(res => {
      const response = res as any;
      if (response?.success || response?.data?.success) {
        const payload = response.data?.data || response.data || response;
        setInstructorCourses(Array.isArray(payload) ? payload : (payload?.data || []));
      } else if (Array.isArray(response)) {
        setInstructorCourses(response);
      }
    }).catch(console.error);
  }, [instructorId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        per_page: 15,
        search: debouncedSearch,
        status: statusFilter,
        course_id: courseFilter,
        time_range: timeRange
      };
      
      const res = (Object.assign([], { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 1 }, success: true, message: '', videoUrl: '', duration: '00:00', order: { id: 'dummy' } }) as any);
      const payload = res?.data?.data || res?.data || res;
      
      if (payload) {
        setTransactions(payload.list?.data || []);
        setTotalPages(payload.list?.last_page || 1);
        setTotalRecords(payload.list?.total || 0);
        setStats(payload.stats || {
          total: 0, success: 0, pending: 0, failed: 0, total_revenue: 0
        });
      }
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [instructorId, page, debouncedSearch, statusFilter, courseFilter, timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Thống kê Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div 
          onClick={() => { setStatusFilter('all'); setPage(1); }}
          className="bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-stone-500">Tổng giao dịch</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-stone-800">{stats.total}</h3>
        </div>

        <div 
          onClick={() => { setStatusFilter('success'); setPage(1); }}
          className="bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-stone-500">Thành công</p>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-emerald-600">{stats.success}</h3>
        </div>

        <div 
          onClick={() => { setStatusFilter('pending'); setPage(1); }}
          className="bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-stone-500">Đang xử lý</p>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-amber-600">{stats.pending}</h3>
        </div>

        <div 
          onClick={() => { setStatusFilter('failed'); setPage(1); }}
          className="bg-white p-5 rounded-2xl border shadow-sm cursor-pointer hover:shadow-md transition-all group"
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-stone-500">Thất bại</p>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-600 group-hover:text-white transition-colors">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-red-600">{stats.failed}</h3>
        </div>

        <div className="bg-gradient-to-br from-brand-normal to-brand-dark p-5 rounded-2xl border border-brand-light shadow-sm text-white">
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm font-medium text-brand-light">Tổng doanh thu</p>
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">{formatCurrency(stats.total_revenue)}</h3>
        </div>
      </div>

      {/* Bộ lọc */}
      <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-5 h-5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Tìm mã GD, học viên, khóa học..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border-stone-200 focus:border-brand-normal focus:ring-brand-normal/20 transition-all text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select 
            className="rounded-xl border-stone-200 text-sm focus:border-brand-normal focus:ring-brand-normal/20 text-stone-600 py-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Trạng thái: Tất cả</option>
            <option value="success">Thành công</option>
            <option value="pending">Đang xử lý</option>
            <option value="failed">Thất bại</option>
          </select>

          <select 
            className="rounded-xl border-stone-200 text-sm focus:border-brand-normal focus:ring-brand-normal/20 text-stone-600 py-2 max-w-[200px]"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
          >
            <option value="all">Khóa học: Tất cả</option>
            {instructorCourses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <select 
            className="rounded-xl border-stone-200 text-sm focus:border-brand-normal focus:ring-brand-normal/20 text-stone-600 py-2"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="all">Thời gian: Tất cả</option>
            <option value="today">Hôm nay</option>
            <option value="7days">7 ngày qua</option>
            <option value="30days">30 ngày qua</option>
            <option value="this_month">Tháng này</option>
            <option value="last_month">Tháng trước</option>
            <option value="this_year">Năm nay</option>
          </select>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-stone-50 border-b text-stone-600 font-semibold uppercase text-xs">
              <tr>
                <th className="px-6 py-4">Mã GD</th>
                <th className="px-6 py-4">Học viên</th>
                <th className="px-6 py-4">Khóa học</th>
                <th className="px-6 py-4 text-right">Số tiền</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Thời gian</th>
                <th className="px-6 py-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                    <Activity className="w-6 h-6 animate-spin mx-auto mb-2 text-brand-normal" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-stone-500">
                    <div className="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Filter className="w-8 h-8 text-stone-400" />
                    </div>
                    <p className="font-medium text-stone-600 mb-1">Không tìm thấy giao dịch nào</p>
                    <p className="text-xs text-stone-400">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
                  </td>
                </tr>
              ) : (
                transactions.map((txn, idx) => (
                  <tr key={txn.id || idx} className="hover:bg-stone-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-stone-600">
                      {txn.order_code || txn.transaction_id || `TXN-${txn.id}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={txn.user_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(txn.user_name || 'User')}&background=random`} 
                          alt="" 
                          className="w-8 h-8 rounded-full border shadow-sm object-cover"
                        />
                        <div>
                          <p className="font-semibold text-stone-800">{txn.user_name || 'Người dùng ẩn danh'}</p>
                          <p className="text-xs text-stone-500">{txn.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 max-w-[250px]">
                        {txn.course_thumbnail ? (
                           <img src={txn.course_thumbnail} alt="" className="w-10 h-8 rounded object-cover shadow-sm" />
                        ) : (
                           <div className="w-10 h-8 rounded bg-stone-100 flex items-center justify-center"><BookOpen className="w-4 h-4 text-stone-400" /></div>
                        )}
                        <span className="font-medium text-stone-700 truncate" title={txn.course_title}>{txn.course_title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-stone-800">{formatCurrency(txn.instructor_amount)}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
                        ${txn.status === 'success' || txn.status === 'available' || txn.status === 'paid' ? 'bg-emerald-100 text-emerald-800' : ''}
                        ${txn.status === 'pending' || txn.status === 'processing' ? 'bg-amber-100 text-amber-800' : ''}
                        ${txn.status === 'failed' || txn.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
                      `}>
                        {txn.status === 'success' || txn.status === 'available' || txn.status === 'paid' ? 'Thành công' : ''}
                        {txn.status === 'pending' || txn.status === 'processing' ? 'Đang xử lý' : ''}
                        {txn.status === 'failed' || txn.status === 'cancelled' ? 'Thất bại' : ''}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-stone-500">
                      {txn.created_at ? new Date(txn.created_at).toLocaleString('vi-VN') : ''}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => setSelectedTxnId(txn.id)}
                        className="p-2 text-brand-normal hover:bg-brand-50 rounded-lg transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                      >
                        <Eye className="w-4 h-4" /> Chi tiết
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
          <div className="border-t border-stone-100 p-4 flex items-center justify-between">
            <span className="text-sm text-stone-500">
              Hiển thị <span className="font-semibold text-stone-800">{transactions.length}</span> / <span className="font-semibold text-stone-800">{totalRecords}</span> giao dịch
            </span>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border rounded-xl hover:bg-stone-50 disabled:opacity-50 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="px-4 text-sm font-semibold text-stone-700">
                Trang {page} / {totalPages}
              </div>

              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border rounded-xl hover:bg-stone-50 disabled:opacity-50 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedTxnId && (
        <TransactionDetailDrawer 
          transactionId={selectedTxnId}
          isOpen={!!selectedTxnId}
          onClose={() => setSelectedTxnId(null)}
        />
      )}
    </div>
  );
}
