import React from 'react';
import { ShieldCheck, LayoutDashboard, ArrowRight } from 'lucide-react';
import { ROUTES } from '../../utils/routes';

interface ProfileHeaderProps {
  status?: string;
  role?: string;
  onNavigateTo?: (route: string) => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  status = 'active',
  role,
  onNavigateTo
}) => {
  const isStatusActive = status === 'active' || status === 'Đang hoạt động';
  const isInstructor = role === 'instructor' || role === 'admin';

  const handleGoToInstructor = () => {
    if (onNavigateTo) {
      onNavigateTo(ROUTES.instructor.dashboard);
    } else {
      window.history.pushState({}, '', ROUTES.instructor.dashboard);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="mb-6 bg-white rounded-2xl p-5 border border-[#e7e8ed] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#737373] font-medium mb-1">
          <span>Tài khoản</span>
          <span className="text-[#a3a3a3]">&gt;</span>
          <span className="text-[#06091a] font-bold">Hồ sơ cá nhân</span>
        </div>
        <h1 className="text-2xl font-black text-[#06091a] tracking-tight">Trung tâm tài khoản</h1>
        <p className="text-xs text-[#737373] font-medium mt-0.5">
          Quản lý thông tin cá nhân, bảo mật và quyền truy cập tài khoản của bạn.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5 shrink-0">
        {isInstructor && (
          <button
            type="button"
            onClick={handleGoToInstructor}
            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Dashboard Giảng viên</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
          isStatusActive 
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
            : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          {isStatusActive ? 'Đang hoạt động' : status}
        </span>
      </div>
    </div>
  );
};
