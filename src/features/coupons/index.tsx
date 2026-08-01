import React, { useState, useEffect, useCallback } from 'react';
import { Coupon, CouponSummary, CourseOption } from './types';
import { CouponOverview } from './components/CouponOverview';
import { CouponFilter } from './components/CouponFilter';
import { CouponTable } from './components/CouponTable';
import { CouponForm } from './components/CouponForm';
import { instructorApi } from '@/features/instructor/api';
import { Sparkles, AlertCircle } from 'lucide-react';

export const CouponManagement: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [summary, setSummary] = useState<CouponSummary>({
    active_coupons: 0,
    expired_coupons: 0,
    used_up_coupons: 0,
    total_usage_count: 0,
  });
  const [courseOptions, setCourseOptions] = useState<CourseOption[]>([]);
  
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [courseFilter, setCourseFilter] = useState('all');
  const [discountTypeFilter, setDiscountTypeFilter] = useState('all');

  // Form / Drawer states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Summary Data
  const fetchSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const res = await instructorApi.getInstructorCouponSummary({ course_id: courseFilter });
      const data = res?.data || res;
      setSummary({
        active_coupons: Number(data.active_coupons || 0),
        expired_coupons: Number(data.expired_coupons || 0),
        used_up_coupons: Number(data.used_up_coupons || 0),
        total_usage_count: Number(data.total_usage_count || 0),
        inactive_coupons: Number(data.inactive_coupons || 0),
        total_coupons: Number(data.total_coupons || 0),
      });
    } catch (err: any) {
      console.error('Error fetching coupon summary:', err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [courseFilter]);

  // Fetch Course Options
  const fetchCourseOptions = useCallback(async () => {
    try {
      const res: any = await instructorApi.getInstructorCouponCourseOptions();
      const items = res?.data || (Array.isArray(res) ? res : []);
      setCourseOptions(items);
    } catch (err) {
      console.error('Error fetching course options:', err);
      setCourseOptions([]);
    }
  }, []);

  // Fetch Coupons List
  const fetchCoupons = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);
    try {
      const res = await instructorApi.getInstructorCoupons({
        page: pagination.current_page,
        per_page: pagination.per_page,
        status: statusFilter,
        type: discountTypeFilter,
        course_id: courseFilter,
        search: searchQuery.trim() || undefined,
      });

      const items = res?.data || res?.items || (Array.isArray(res) ? res : []);
      const meta = res?.meta || res?.pagination || {};

      setCoupons(items);
      setPagination(prev => ({
        ...prev,
        current_page: meta.current_page ?? prev.current_page,
        last_page: meta.last_page ?? 1,
        total: meta.total ?? items.length,
        per_page: meta.per_page ?? prev.per_page,
      }));
    } catch (err: any) {
      console.error('Error fetching coupons:', err);
      setApiError('Không thể tải danh sách mã giảm giá. Vui lòng thử lại sau.');
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.current_page, pagination.per_page, statusFilter, discountTypeFilter, courseFilter, searchQuery]);

  useEffect(() => {
    fetchCourseOptions();
  }, [fetchCourseOptions]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCourseFilter('all');
    setDiscountTypeFilter('all');
    setPagination(prev => ({ ...prev, current_page: 1 }));
    showToast('Đã xóa tất cả bộ lọc.');
  };

  const handleEditClick = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setIsFormOpen(true);
  };

  const handleToggleStatus = async (coupon: Coupon) => {
    try {
      const isCurrentlyActive = coupon.status === 'active';
      if (isCurrentlyActive) {
        await instructorApi.disableInstructorCoupon(coupon.id);
        showToast(`Đã tạm tắt mã ${coupon.code}`);
      } else {
        await instructorApi.enableInstructorCoupon(coupon.id);
        showToast(`Đã kích hoạt mã ${coupon.code}`);
      }
      fetchCoupons();
      fetchSummary();
    } catch (err: any) {
      showToast(err.message || 'Không thể cập nhật trạng thái mã.', 'error');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      await instructorApi.deleteInstructorCoupon(id);
      showToast('Đã xóa mã giảm giá thành công.');
      fetchCoupons();
      fetchSummary();
    } catch (err: any) {
      showToast(err.message || 'Không thể xóa mã giảm giá.', 'error');
    }
  };

  const handleCopyCode = async (code: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      showToast(`Đã sao chép mã ${code}`);
    } catch (err) {
      showToast(`Đã sao chép mã ${code}`);
    }
  };

  const handleSubmitForm = async (data: Partial<Coupon>) => {
    try {
      if (selectedCoupon && selectedCoupon.id) {
        await instructorApi.updateInstructorCoupon(selectedCoupon.id, data);
        showToast('Cập nhật mã giảm giá thành công.');
      } else {
        await instructorApi.createInstructorCoupon(data);
        showToast('Tạo mã giảm giá thành công.');
      }
      setIsFormOpen(false);
      fetchCoupons();
      fetchSummary();
    } catch (err: any) {
      throw err;
    }
  };

  return (
    <div className="w-full text-left relative pb-12">
      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#111a4a] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border border-brand-light/20">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-black tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Mã giảm giá</h1>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-bold mt-1">
          <span>Trang chủ</span>
          <span>&gt;</span>
          <span className="text-brand-normal">Mã giảm giá</span>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left side: Overview, Filter, Table */}
        <div className="flex-1 w-full min-w-0">
          <CouponOverview 
            stats={summary} 
            isLoading={isSummaryLoading}
            activeFilterStatus={statusFilter} 
            onFilter={(status) => {
              setStatusFilter(status);
              setPagination(prev => ({ ...prev, current_page: 1 }));
            }} 
          />
          
          <CouponFilter 
            searchQuery={searchQuery}
            setSearchQuery={(q) => {
              setSearchQuery(q);
              setPagination(prev => ({ ...prev, current_page: 1 }));
            }}
            statusFilter={statusFilter}
            setStatusFilter={(s) => {
              setStatusFilter(s);
              setPagination(prev => ({ ...prev, current_page: 1 }));
            }}
            courseFilter={courseFilter}
            setCourseFilter={(c) => {
              setCourseFilter(c);
              setPagination(prev => ({ ...prev, current_page: 1 }));
            }}
            discountTypeFilter={discountTypeFilter}
            setDiscountTypeFilter={(t) => {
              setDiscountTypeFilter(t);
              setPagination(prev => ({ ...prev, current_page: 1 }));
            }}
            courseOptions={courseOptions}
            onClearFilters={handleClearFilters}
            onCreateClick={() => {
              setSelectedCoupon(null);
              setIsFormOpen(true);
            }}
          />

          {apiError ? (
            <div className="bg-white p-8 rounded-2xl border border-rose-100 text-center text-rose-600 font-bold text-xs flex items-center justify-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{apiError}</span>
            </div>
          ) : (
            <CouponTable 
              coupons={coupons}
              isLoading={isLoading}
              pagination={pagination}
              onPageChange={(p) => setPagination(prev => ({ ...prev, current_page: p }))}
              onPerPageChange={(pp) => setPagination(prev => ({ ...prev, per_page: pp, current_page: 1 }))}
              onEdit={handleEditClick}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDelete}
              onCopy={handleCopyCode}
            />
          )}
        </div>

        {/* Right side: Drawer Form (conditionally docked) */}
        {isFormOpen && (
          <aside className="w-full lg:w-[380px] shrink-0 self-stretch lg:sticky lg:top-6">
            <CouponForm 
              coupon={selectedCoupon}
              courseOptions={courseOptions}
              onClose={() => setIsFormOpen(false)}
              onSubmit={handleSubmitForm}
            />
          </aside>
        )}
      </div>
    </div>
  );
};
