import React, { useState } from 'react';
import { Eye, Edit, Trash2, Power, PowerOff } from 'lucide-react';
import { Coupon } from '../types';

interface Props {
  coupons: Coupon[];
  isLoading: boolean;
  onView: (coupon: Coupon) => void;
  onEdit: (coupon: Coupon) => void;
  onToggleStatus: (coupon: Coupon) => void;
  onDelete: (id: string) => void;
}

export const CouponTable: React.FC<Props> = ({ coupons, isLoading, onView, onEdit, onToggleStatus, onDelete }) => {
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const formatCurrency = (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);

  const renderBadge = (status: Coupon['status']) => {
    switch (status) {
      case 'active':
        return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">Đang hoạt động</span>;
      case 'inactive':
        return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium border border-gray-200">Đã tắt</span>;
      case 'expired':
        return <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">Hết hạn</span>;
      case 'used_up':
        return <span className="px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium border border-orange-200">Hết lượt</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-sm text-gray-500">
              {['Mã', 'Tên', 'Loại giảm', 'Mức giảm', 'Lượt dùng', 'Thời hạn', 'Trạng thái', 'Thao tác'].map((h, i) => (
                <th key={i} className="p-4 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i} className="border-b border-gray-50 animate-pulse">
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                <td className="p-4"><div className="h-6 bg-gray-200 rounded-full w-24"></div></td>
                <td className="p-4"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center flex flex-col items-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Trash2 className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-lg font-medium text-gray-800">Không tìm thấy mã giảm giá nào</h3>
        <p className="text-gray-500 text-sm mt-1">Vui lòng điều chỉnh bộ lọc hoặc tạo mã mới.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100 text-sm text-gray-500">
              <th className="p-4 font-medium">Mã</th>
              <th className="p-4 font-medium">Tên</th>
              <th className="p-4 font-medium">Loại giảm</th>
              <th className="p-4 font-medium">Mức giảm</th>
              <th className="p-4 font-medium">Lượt dùng</th>
              <th className="p-4 font-medium">Thời hạn</th>
              <th className="p-4 font-medium">Trạng thái</th>
              <th className="p-4 font-medium text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors group">
                <td className="p-4 font-semibold text-gray-800">
                  <span className="px-2 py-1 bg-gray-100 rounded text-sm font-mono border border-gray-200">{coupon.code}</span>
                </td>
                <td className="p-4 text-gray-700 font-medium">{coupon.name}</td>
                <td className="p-4 text-gray-600 text-sm">
                  {coupon.discount_type === 'percent' ? 'Phần trăm' : 'Cố định'}
                </td>
                <td className="p-4 font-semibold text-blue-600">
                  {coupon.discount_type === 'percent' ? `${coupon.discount_value}%` : formatCurrency(coupon.discount_value)}
                </td>
                <td className="p-4 text-gray-600 text-sm">
                  <span className="font-medium text-gray-800">{coupon.used_count}</span> / {coupon.usage_limit || '∞'}
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {new Date(coupon.start_at).toLocaleDateString('vi-VN')} - {new Date(coupon.end_at).toLocaleDateString('vi-VN')}
                </td>
                <td className="p-4">{renderBadge(coupon.status)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onView(coupon)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Xem chi tiết">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => onEdit(coupon)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Chỉnh sửa">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => onToggleStatus(coupon)} className={`p-2 rounded-lg transition-colors ${coupon.status === 'active' ? 'text-gray-400 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`} title={coupon.status === 'active' ? 'Tắt mã' : 'Bật mã'}>
                      {coupon.status === 'active' ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setDeleteConfirmId(coupon.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {deleteConfirmId && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 max-w-sm w-full mx-4 text-center transform scale-100 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Xóa mã giảm giá?</h3>
            <p className="text-gray-500 text-sm mb-6">Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium text-sm flex-1"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium text-sm flex-1"
              >
                Xác nhận xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
