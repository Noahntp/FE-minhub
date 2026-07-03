import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { CourseCreditPackage, User } from '../types';
import { Package, ShieldCheck, Zap, AlertCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface PackageListProps {
  currentUser: User;
  onNavigateToPackage: (packageId: string) => void;
  onNavigateToHistory: () => void;
}

export default function PackageList({ currentUser, onNavigateToPackage, onNavigateToHistory }: PackageListProps) {
  const [packages, setPackages] = useState<CourseCreditPackage[]>([]);
  const [balance, setBalance] = useState<{ remaining_credits: number, total_credits: number, used_credits: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pkgs, bal] = await Promise.all([
          ApiService.getCoursePackages(),
          ApiService.getInstructorCreditBalance(currentUser.id)
        ]);
        setPackages(pkgs);
        setBalance(bal);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải danh sách gói.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Header & Balance Card */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-8 mb-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Zap className="h-8 w-8 text-emerald-300" />
            Gói Lượt Tạo Khóa Học
          </h1>
          <p className="text-emerald-100 max-w-2xl">
            Nâng cấp số lượt tạo và xuất bản khóa học của bạn để tiếp cận học viên MindHub.
          </p>
        </div>
        <div className="mt-6 md:mt-0 bg-white/10 p-6 rounded-xl backdrop-blur-sm border border-white/20 min-w-[250px] text-center">
          <p className="text-sm text-emerald-100 font-medium mb-1">Lượt khả dụng hiện tại</p>
          <div className="text-4xl font-extrabold text-white mb-2">
            {balance?.remaining_credits || 0} <span className="text-xl font-medium text-emerald-200">lượt</span>
          </div>
          <div className="flex justify-between text-xs text-emerald-200 border-t border-white/20 pt-2 mt-2">
            <span>Đã dùng: {balance?.used_credits || 0}</span>
            <span>Tổng mua: {balance?.total_credits || 0}</span>
          </div>
          <button 
            onClick={onNavigateToHistory}
            className="mt-4 text-xs bg-white/20 hover:bg-white/30 transition-colors py-1.5 px-3 rounded-full w-full"
          >
            Xem lịch sử giao dịch
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 group flex flex-col"
          >
            <div className="p-8 flex-1">
              <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Package className="h-6 w-6 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
              <div className="flex items-end gap-2 mb-4">
                <span className="text-3xl font-extrabold text-gray-900">{formatCurrency(pkg.price)}</span>
              </div>
              <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold mb-6">
                <Zap className="h-4 w-4" />
                +{pkg.credits} Lượt xuất bản
              </div>
              <p className="text-gray-600 text-sm mb-6 line-clamp-3">
                {pkg.description || `Mua gói ${pkg.name} để nhận thêm ${pkg.credits} lượt xuất bản khóa học trên hệ thống.`}
              </p>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  Không giới hạn thời gian sử dụng lượt.
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                  Hỗ trợ duyệt khóa học nhanh chóng.
                </li>
              </ul>
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onNavigateToPackage(pkg.id)}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-emerald-600 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  Chi tiết
                </button>
                <button
                  onClick={() => onNavigateToPackage(pkg.id + '/checkout')}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1"
                >
                  Mua <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {packages.length === 0 && !loading && !error && (
          <div className="col-span-full py-12 text-center text-gray-500 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p>Hiện không có gói lượt tạo khóa học nào đang mở bán.</p>
          </div>
        )}
      </div>
    </div>
  );
}
