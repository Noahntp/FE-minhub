import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/api';
import { CourseCreditPackage, User } from '../types';
import { Package, ShieldCheck, Zap, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../utils/format';

interface PackageDetailProps {
  packageId: string;
  currentUser: User;
  onBack: () => void;
  onBuy: (packageId: string) => void;
}

export default function PackageDetail({ packageId, currentUser, onBack, onBuy }: PackageDetailProps) {
  const [pkg, setPkg] = useState<CourseCreditPackage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getPackageById(packageId);
        setPkg(data);
      } catch (err: any) {
        setError(err.message || 'Lỗi khi tải thông tin gói.');
      } finally {
        setLoading(false);
      }
    };
    fetchPackage();
  }, [packageId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center animate-fade-in">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy gói</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" /> Quay lại danh sách
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="h-5 w-5" /> Trở về danh sách gói
      </button>

      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
        {/* Left Side: Detail & Benefits */}
        <div className="p-8 md:p-12 flex-1">
          <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mb-8">
            <Package className="h-8 w-8 text-emerald-600" />
          </div>
          
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{pkg.name}</h1>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {pkg.description || `Mua gói ${pkg.name} để nhận thêm ${pkg.credits} lượt xuất bản khóa học trên hệ thống.`}
          </p>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-gray-900">Chi tiết gói:</h3>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                <span className="text-lg">Nhận ngay <strong className="text-emerald-600">{pkg.credits} lượt</strong> tạo khóa học mới.</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                <span className="text-lg">Không giới hạn thời gian sử dụng lượt đã mua.</span>
              </li>
              <li className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 className="h-6 w-6 text-emerald-500 shrink-0" />
                <span className="text-lg">Hỗ trợ ưu tiên xét duyệt khóa học khi xuất bản.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Side: Price & Action */}
        <div className="bg-gray-50 p-8 md:p-12 w-full md:w-[400px] flex flex-col justify-center relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Zap className="w-48 h-48 text-emerald-600" />
          </div>
          <div className="relative z-10">
            <div className="text-sm font-bold text-emerald-600 tracking-wider uppercase mb-2">Giá trọn gói</div>
            <div className="text-5xl font-extrabold text-gray-900 mb-6">
              {formatCurrency(pkg.price)}
            </div>
            
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-8 flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Zap className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Bạn sẽ nhận được</p>
                <p className="text-xl font-bold text-gray-900">+{pkg.credits} Lượt xuất bản</p>
              </div>
            </div>

            <button
              onClick={() => onBuy(pkg.id)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg py-4 px-8 rounded-2xl shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2"
            >
              Tiến hành thanh toán <ArrowRight className="h-5 w-5" />
            </button>
            <p className="text-xs text-center text-gray-500 mt-4">
              Giao dịch an toàn, thanh toán qua cổng VNPAY/MoMo. Lượt sẽ được cộng ngay sau khi thanh toán thành công.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
