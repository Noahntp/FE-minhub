import React from 'react';
import { ShieldCheck, Mail, Phone, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

interface StudentAccountStatusCardProps {
  currentUser: any;
  showToast?: (message: string, type?: 'success' | 'error') => void;
}

export const StudentAccountStatusCard: React.FC<StudentAccountStatusCardProps> = ({
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
  const joinedDateFormatted = formatDate(currentUser?.created_at || currentUser?.createdAt || currentUser?.joinedDate);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all mb-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
        <h2 className="text-sm font-black uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Trạng thái & Xác minh
        </h2>
        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
          Hoạt động
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Email Verification */}
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl shrink-0 ${isEmailVerified ? 'bg-emerald-100/70 text-emerald-700' : 'bg-amber-100/70 text-amber-700'}`}>
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Xác minh Email</span>
            <span className="font-bold text-slate-900 text-sm block mt-0.5">
              {isEmailVerified ? 'Đã xác minh' : 'Chưa xác minh'}
            </span>
            {isEmailVerified ? (
              <span className="text-xs text-emerald-600 font-semibold block mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> An toàn
              </span>
            ) : (
              <button
                type="button"
                onClick={() => showToast && showToast('Mã OTP xác minh email đã được gửi.')}
                className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer block mt-1"
              >
                Gửi mã xác minh
              </button>
            )}
          </div>
        </div>

        {/* Phone Verification */}
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl shrink-0 ${isPhoneVerified ? 'bg-emerald-100/70 text-emerald-700' : 'bg-amber-100/70 text-amber-700'}`}>
            <Phone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Xác minh SĐT</span>
            <span className="font-bold text-slate-900 text-sm block mt-0.5">
              {isPhoneVerified ? 'Đã xác minh' : 'Chưa cập nhật'}
            </span>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">
              {isPhoneVerified ? 'Bảo mật tài khoản' : 'Thêm SĐT trong thông tin cá nhân'}
            </span>
          </div>
        </div>

        {/* Last Login */}
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl shrink-0 bg-indigo-100/70 text-indigo-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Đăng nhập gần nhất</span>
            <span className="font-bold text-slate-900 text-sm block mt-0.5">
              {lastLoginFormatted}
            </span>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">
              Phiên làm việc hiện tại
            </span>
          </div>
        </div>

        {/* Member Since */}
        <div className="p-4 bg-slate-50/70 rounded-2xl border border-slate-200/70 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl shrink-0 bg-sky-100/70 text-sky-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] uppercase font-bold text-slate-400 block tracking-wider">Ngày tham gia</span>
            <span className="font-bold text-slate-900 text-sm block mt-0.5">
              {joinedDateFormatted}
            </span>
            <span className="text-xs text-slate-500 font-medium block mt-0.5">
              Thành viên MindHub
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
