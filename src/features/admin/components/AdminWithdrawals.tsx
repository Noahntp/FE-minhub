import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { PayoutRequest } from '@/shared/types';

interface AdminWithdrawalsProps {
  payoutRequests: PayoutRequest[];
  onApprovePayout: (id: string) => void;
  onRejectPayout: (id: string) => void;
}

export default function AdminWithdrawals({ payoutRequests, onApprovePayout, onRejectPayout }: AdminWithdrawalsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredPayouts = payoutRequests.filter(req => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (req.id || '').toLowerCase().includes(q) ||
                          (req.instructorName || '').toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">Hoàn tất</span>;
      case 'pending':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200">Chờ duyệt</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">Đã từ chối</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">{status}</span>;
    }
  };

  const totalAmount = payoutRequests.reduce((acc, req) => req.status === 'completed' ? acc + req.amount : acc, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between shrink-0 mb-4">
        <div>
          <h1 className="text-[30px] lg:text-[32px] font-bold tracking-tight text-ink leading-tight">
            Yêu cầu Rút tiền
          </h1>
          <p className="text-xs text-mid-gray mt-0.5">
            Quản lý và phê duyệt các yêu cầu rút tiền từ Giảng viên.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Tổng tiền đã chi</span>
          </div>
          <div className="mt-2.5">
            <span className="text-[28px] lg:text-[30px] font-bold tracking-tight text-ink font-sans">{formatVND(totalAmount)}</span>
          </div>
        </div>
      </div>

      <div className="rounded-[6px] border border-hairline bg-paper shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="p-4 border-b border-hairline flex flex-col sm:flex-row gap-3 justify-between items-center bg-surface-alt/50">
          <div className="relative w-full sm:w-72">
            <input 
              type="text" 
              placeholder="Tìm theo Mã, Tên giảng viên..." 
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
              <option value="All">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="completed">Đã hoàn tất</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-hairline bg-surface-alt text-mid-gray font-medium">
                <th className="px-4 py-3">Mã YC</th>
                <th className="px-4 py-3">Giảng viên</th>
                <th className="px-4 py-3 text-right">Số tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Ngày gửi</th>
                <th className="px-4 py-3 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filteredPayouts.length > 0 ? (
                filteredPayouts.map(req => (
                  <tr key={req.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{req.id}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{req.instructorName}</td>
                    <td className="px-4 py-3 text-right font-sans font-semibold text-ink">{formatVND(req.amount)}</td>
                    <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                    <td className="px-4 py-3 text-mid-gray">{req.date}</td>
                    <td className="px-4 py-3 text-center">
                      {req.status === 'pending' && (
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => onApprovePayout(req.id)} className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200">Duyệt</button>
                          <button onClick={() => onRejectPayout(req.id)} className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-red-50 text-red-700 hover:bg-red-100 border border-red-200">Từ chối</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-sm text-mid-gray">Không tìm thấy yêu cầu nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
