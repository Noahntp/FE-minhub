import React, { useState } from 'react';
import { Edit, Trash2, Power, PowerOff, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { Coupon } from '../types';

interface Props {
  coupons: Coupon[];
  isLoading: boolean;
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  onEdit: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon) => void;
  onDelete: (id: string | number) => void;
  onCopy: (code: string) => void;
}

export const CouponTable: React.FC<Props> = ({ 
  coupons, 
  isLoading, 
  pagination,
  onPageChange,
  onPerPageChange,
  onEdit, 
  onToggleStatus, 
  onDelete, 
  onCopy 
}) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN').format(val) + 'đ';
  };

  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const dd = String(date.getDate()).padStart(2, '0');
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const yyyy = date.getFullYear();
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
  };

  const renderBadge = (coupon: Coupon) => {
    const status = coupon.effective_status || coupon.status;
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center whitespace-nowrap px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-emerald-200/60">ĐANG HOẠT ĐỘNG</span>;
      case 'inactive':
        return <span className="inline-flex items-center whitespace-nowrap px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-200">TẠM TẮT</span>;
      case 'expired':
        return <span className="inline-flex items-center whitespace-nowrap px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-rose-200/60">ĐÃ HẾT HẠN</span>;
      case 'used_up':
        return <span className="inline-flex items-center whitespace-nowrap px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-amber-200/60">ĐÃ DÙNG HẾT</span>;
      case 'scheduled':
        return <span className="inline-flex items-center whitespace-nowrap px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-blue-200/60">SẮP DIỄN RA</span>;
      default:
        return <span className="inline-flex items-center whitespace-nowrap px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-wider border border-slate-200">{coupon.status_label || status}</span>;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 overflow-hidden">
        <div className="p-12 text-center text-slate-400 font-bold text-xs">Đang tải danh sách mã giảm giá...</div>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 p-16 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-8 h-8 text-slate-350" />
        </div>
        <h3 className="text-sm font-black text-slate-800">Không tìm thấy mã giảm giá nào</h3>
        <p className="text-slate-400 text-xs font-semibold mt-1">Vui lòng điều chỉnh bộ lọc hoặc tạo mã mới.</p>
      </div>
    );
  }

  const fromCount = (pagination.current_page - 1) * pagination.per_page + 1;
  const toCount = Math.min(pagination.current_page * pagination.per_page, pagination.total);

  return (
    <div className="bg-white rounded-2xl shadow-3xs border border-slate-100 overflow-hidden relative">
      <div className="overflow-x-auto tactile-scrollbar">
        <table className="w-full text-left border-collapse min-w-[1100px]">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10.5px] font-bold uppercase tracking-wider text-slate-500">
              <th className="p-4 font-bold whitespace-nowrap">Mã</th>
              <th className="p-4 font-bold whitespace-nowrap min-w-[260px]">Khóa học</th>
              <th className="p-4 font-bold whitespace-nowrap min-w-[90px]">Loại</th>
              <th className="p-4 font-bold whitespace-nowrap">Giá trị</th>
              <th className="p-4 font-bold whitespace-nowrap">Bắt đầu</th>
              <th className="p-4 font-bold whitespace-nowrap">Kết thúc</th>
              <th className="p-4 font-bold whitespace-nowrap text-center">Đã dùng</th>
              <th className="p-4 font-bold whitespace-nowrap text-center">Giới hạn</th>
              <th className="p-4 font-bold whitespace-nowrap text-center min-w-[130px]">Trạng thái</th>
              <th className="p-4 font-bold whitespace-nowrap text-center min-w-[120px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-800">
            {coupons.map((coupon) => {
              const courseTitle = coupon.course?.title || 'Áp dụng tất cả khóa học';
              const isPercent = coupon.discount_type === 'percent' || coupon.discount_type === 'percentage';

              return (
                <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors group">
                  {/* Code */}
                  <td className="p-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-800 rounded font-mono text-xs font-black border border-slate-100">
                      {coupon.code}
                    </span>
                  </td>

                  {/* Course Details */}
                  <td className="p-4 min-w-[260px]">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[240px] whitespace-nowrap inline-block" title={courseTitle}>
                        {courseTitle}
                      </span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="p-4 min-w-[90px] whitespace-nowrap">
                    {isPercent ? (
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 bg-blue-50 text-blue-750 text-[10px] font-bold rounded border border-blue-100">
                        Phần trăm
                      </span>
                    ) : (
                      <span className="inline-flex items-center whitespace-nowrap px-2.5 py-0.5 bg-purple-50 text-purple-750 text-[10px] font-bold rounded border border-purple-100">
                        Số tiền
                      </span>
                    )}
                  </td>

                  {/* Value */}
                  <td className="p-4 font-black text-xs text-slate-800 whitespace-nowrap">
                    {isPercent ? `${coupon.discount_value}%` : formatCurrency(Number(coupon.discount_value))}
                  </td>

                  {/* Start Date */}
                  <td className="p-4 text-[11px] text-slate-500 font-bold whitespace-nowrap">
                    {formatDateTime(coupon.start_at)}
                  </td>

                  {/* End Date */}
                  <td className="p-4 text-[11px] text-slate-500 font-bold whitespace-nowrap">
                    {formatDateTime(coupon.end_at)}
                  </td>

                  {/* Used Count */}
                  <td className="p-4 text-center text-xs font-black text-slate-800 whitespace-nowrap">
                    {coupon.used_count}
                  </td>

                  {/* Usage Limit */}
                  <td className="p-4 text-center text-xs font-bold text-slate-400 whitespace-nowrap">
                    {coupon.usage_limit ?? 'Không giới hạn'}
                  </td>

                  {/* Status Badge */}
                  <td className="p-4 text-center min-w-[130px] whitespace-nowrap">
                    {renderBadge(coupon)}
                  </td>

                  {/* Actions */}
                  <td className="p-4 min-w-[120px] whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onCopy(coupon.code);
                        }} 
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-450 hover:text-brand-normal hover:bg-slate-100 transition-colors cursor-pointer" 
                        title="Copy mã"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onToggleStatus(coupon);
                        }} 
                        className={`h-8 w-8 inline-flex items-center justify-center rounded-lg transition-colors cursor-pointer ${
                          coupon.status === 'active' 
                            ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50' 
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`} 
                        title={coupon.status === 'active' ? 'Tạm tắt mã' : 'Bật mã'}
                      >
                        {coupon.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onEdit(coupon);
                        }}
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-450 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setDeleteConfirmId(coupon.id);
                        }} 
                        className="h-8 w-8 inline-flex items-center justify-center rounded-lg text-slate-450 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer" 
                        title="Xóa"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-5 py-4 border-t border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-50/20 text-slate-500 font-bold text-xs text-left">
        <div>
          Hiển thị {pagination.total > 0 ? `${fromCount} đến ${toCount}` : 0} trong tổng số {pagination.total} mã
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <select
              value={String(pagination.per_page)}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              className="appearance-none px-3 py-1.5 border border-slate-200 bg-white rounded-lg outline-none cursor-pointer pr-8 relative font-bold text-slate-700"
              style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237c7f88' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundPosition: 'right 8px center', backgroundRepeat: 'no-repeat' }}
            >
              <option value="10">10 / trang</option>
              <option value="20">20 / trang</option>
              <option value="50">50 / trang</option>
            </select>
          </div>

          {pagination.last_page > 1 && (
            <div className="flex items-center gap-1">
              <button 
                type="button"
                disabled={pagination.current_page <= 1}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPageChange(pagination.current_page - 1);
                }}
                className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              
              {Array.from({ length: pagination.last_page }, (_, i) => i + 1).map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPageChange(p);
                  }}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs transition-colors cursor-pointer ${
                    p === pagination.current_page 
                      ? 'bg-brand-normal text-white' 
                      : 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button 
                type="button"
                disabled={pagination.current_page >= pagination.last_page}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onPageChange(pagination.current_page + 1);
                }}
                className="p-1.5 border border-slate-200 rounded-lg bg-white text-slate-400 hover:text-slate-700 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="absolute inset-0 bg-[#011821]/30 backdrop-blur-3xs flex items-center justify-center z-30">
          <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-xs w-full mx-4 text-center animate-in fade-in zoom-in duration-200">
            <div className="w-11 h-11 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Trash2 className="w-5 h-5 text-rose-600" />
            </div>
            <h3 className="text-sm font-black text-slate-800 mb-1">Xóa mã giảm giá?</h3>
            <p className="text-slate-400 text-xs font-semibold mb-4 leading-normal">Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác.</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-2 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors font-bold text-xs flex-1 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (deleteConfirmId) onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors font-bold text-xs flex-1 cursor-pointer"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
