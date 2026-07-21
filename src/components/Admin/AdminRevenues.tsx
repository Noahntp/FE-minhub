import React from 'react';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import { Order } from '../../types';

interface AdminRevenuesProps {
  orders: Order[];
}

export default function AdminRevenues({ orders }: AdminRevenuesProps) {
  const successOrders = orders.filter(o => o.status === 'success');
  const totalRevenue = successOrders.reduce((acc, o) => acc + o.total, 0);
  const platformFee = totalRevenue * 0.3; // 30% platform fee
  const instructorShare = totalRevenue * 0.7; // 70% instructor share

  const formatVND = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between shrink-0 mb-4">
        <div>
          <h1 className="text-[30px] lg:text-[32px] font-bold tracking-tight text-ink leading-tight">
            Doanh thu / Chia sẻ
          </h1>
          <p className="text-xs text-mid-gray mt-0.5">
            Tổng quan doanh thu nền tảng và tỷ lệ chia sẻ cho giảng viên.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Tổng Doanh Thu</span>
            <div className="mt-2.5 text-[28px] lg:text-[30px] font-bold tracking-tight text-ink font-sans">
              {formatVND(totalRevenue)}
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Lợi nhuận MindHub (30%)</span>
            <div className="mt-2.5 text-[28px] lg:text-[30px] font-bold tracking-tight text-primary font-sans">
              {formatVND(platformFee)}
            </div>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-primary">
            <BarChart3 className="w-6 h-6" />
          </div>
        </div>

        <div className="rounded-[6px] border border-hairline bg-paper p-4 shadow-subtle flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-mid-gray uppercase tracking-wider">Phần của Giảng viên (70%)</span>
            <div className="mt-2.5 text-[28px] lg:text-[30px] font-bold tracking-tight text-warning font-sans">
              {formatVND(instructorShare)}
            </div>
          </div>
          <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-warning">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="rounded-[6px] border border-hairline bg-paper p-6 shadow-sm flex items-center justify-center h-64 mt-4">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-mid-gray/40 mx-auto mb-3" />
          <p className="text-mid-gray font-medium">Biểu đồ phân tích doanh thu chi tiết đang được cập nhật...</p>
        </div>
      </div>
    </div>
  );
}
