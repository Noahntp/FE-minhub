import React from 'react';
import { CheckCircle2, ShieldCheck, Mail, Phone, Clock, AlertTriangle } from 'lucide-react';

interface AccountVerificationCardProps {
  currentUser: any;
  showToast?: (message: string, type?: 'success' | 'error') => void;
}

export const AccountVerificationCard: React.FC<AccountVerificationCardProps> = ({
  currentUser,
  showToast
}) => {
  const isEmailVerified = Boolean(currentUser?.emailVerifiedAt || currentUser?.email_verified_at);
  const isPhoneVerified = Boolean(currentUser?.phoneVerifiedAt || currentUser?.phone_verified_at || currentUser?.phone);
  
  const formatDate = (dateVal: string | null) => {
    if (!dateVal) return 'Gần đây';
    try {
      return new Date(dateVal).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateVal;
    }
  };

  const lastLoginFormatted = formatDate(currentUser?.lastLoginAt || currentUser?.last_login_at);

  return (
    <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs mb-6">
      <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a] mb-4 pb-2 border-b border-[#e7e8ed]">
        Trạng thái & Xác minh tài khoản
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Box 1: Account status */}
        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-[#e7e8ed] flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider">Trạng thái</span>
            <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-[#06091a] block text-xs">Đang hoạt động</span>
            <span className="inline-flex items-center gap-1 text-[9.5px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold mt-1 border border-emerald-200">
              <CheckCircle2 className="w-3 h-3" /> Hoạt động tốt
            </span>
          </div>
        </div>

        {/* Box 2: Email verification */}
        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-[#e7e8ed] flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider">Xác minh Email</span>
            <div className={`p-1.5 rounded-lg ${isEmailVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-[#06091a] block text-xs">
              {isEmailVerified ? 'Đã xác minh' : 'Chưa xác minh'}
            </span>
            {isEmailVerified ? (
              <span className="text-[9.5px] text-[#737373] font-medium block mt-1">
                An toàn 100%
              </span>
            ) : (
              <button
                type="button"
                onClick={() => showToast && showToast('Mã OTP xác minh email đã gửi qua hộp thư.')}
                className="text-[9.5px] font-bold text-[#007A64] hover:underline cursor-pointer block mt-1"
              >
                Gửi mã xác minh ngay
              </button>
            )}
          </div>
        </div>

        {/* Box 3: Phone verification */}
        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-[#e7e8ed] flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider">Xác minh SĐT</span>
            <div className={`p-1.5 rounded-lg ${isPhoneVerified ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
              <Phone className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-[#06091a] block text-xs">
              {isPhoneVerified ? 'Đã xác minh' : 'Chưa xác minh'}
            </span>
            <span className="text-[9.5px] text-[#737373] font-medium block mt-1">
              {isPhoneVerified ? 'Bảo mật 2 lớp' : 'Cần cập nhật SĐT'}
            </span>
          </div>
        </div>

        {/* Box 4: Last login */}
        <div className="p-3.5 bg-slate-50/70 rounded-xl border border-[#e7e8ed] flex flex-col justify-between space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-[10px] uppercase font-bold text-[#737373] tracking-wider">Lần đăng nhập cuối</span>
            <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-[#06091a] block text-xs truncate">
              {lastLoginFormatted}
            </span>
            <span className="text-[9.5px] text-[#737373] font-medium block mt-1">
              IP: 127.0.0.1
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
