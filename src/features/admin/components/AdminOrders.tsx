import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Order } from '@/shared/types';

interface AdminOrdersProps {
  orders: Order[];
}

export default function AdminOrders({ orders }: AdminOrdersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch = (o.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (o.courses || []).some(c => (c.title || '').toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">Đã thanh toán</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">Chờ thanh toán</span>;
      case 'failed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Thất bại</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">{status}</span>;
    }
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const successCount = orders.filter(o => o.status === 'success').length;
  const failedCount = orders.filter(o => o.status === 'failed').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between shrink-0 mb-4">
        <div>
          <h1 className="text-[30px] lg:text-[32px] font-bold tracking-tight text-ink leading-tight">
            Quản lý Đơn hàng
          </h1>
          <p className="text-xs text-mid-gray mt-0.5">
            Theo dõi, quản lý trạng thái thanh toán và thông tin các đơn hàng khóa học.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Tổng đơn hàng</span>
          </div>
          <div className="mt-2.5">
            <span className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink font-sans">{orders.length}</span>
          </div>
        </div>
        
        <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Chờ thanh toán</span>
          </div>
          <div className="mt-2.5">
            <span className="text-[28px] lg:text-[30px] font-bold tracking-tight text-warning font-sans">{pendingCount}</span>
          </div>
        </div>

        <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Đã thanh toán</span>
          </div>
          <div className="mt-2.5">
            <span className="text-[28px] lg:text-[30px] font-bold tracking-tight text-success font-sans">{successCount}</span>
          </div>
        </div>

        <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Thất bại / Hủy</span>
          </div>
          <div className="mt-2.5">
            <span className="text-[28px] lg:text-[30px] font-bold tracking-tight text-danger-brick font-sans">{failedCount}</span>
          </div>
        </div>
      </div>

      <div className="rounded-[6px] border border-hairline bg-paper shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="p-4 border-b border-hairline flex flex-col sm:flex-row gap-3 justify-between items-center bg-surface-alt/50">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Tìm theo Mã đơn, Tên khoá học..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-paper border border-hairline rounded-[4px] focus:outline-none focus:border-ink transition-colors"
            />
            <Search className="w-4 h-4 text-mid-gray absolute left-3 top-2" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto px-3 py-1.5 text-sm bg-paper border border-hairline rounded-[4px] focus:outline-none focus:border-ink"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ thanh toán</option>
              <option value="success">Đã thanh toán</option>
              <option value="failed">Thất bại</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-hairline bg-surface-alt text-mid-gray font-medium">
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Khóa học</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày tạo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(o => (
                  <tr key={o.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{o.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-semibold text-ink truncate max-w-[200px]">
                          {o.courses.length > 0 ? o.courses[0].title : 'Khoá học đã xoá'}
                        </span>
                        {o.courses.length > 1 && (
                          <span className="text-[10px] text-mid-gray mt-0.5">+ {o.courses.length - 1} khoá khác</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-sans font-semibold text-ink">{formatVND(o.total)}</td>
                    <td className="px-4 py-3">{getStatusBadge(o.status)}</td>
                    <td className="px-4 py-3 text-mid-gray">{o.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-sm text-mid-gray">Không tìm thấy đơn hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
