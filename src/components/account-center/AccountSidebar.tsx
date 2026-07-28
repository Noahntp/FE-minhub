import React from 'react';
import { User, ShieldCheck, Lock, Award, LogOut, CheckCircle2, Briefcase } from 'lucide-react';

export type AccountTabKey = 'profile' | 'professional' | 'security' | 'roles';

interface AccountSidebarProps {
  currentUser: any;
  activeTab: AccountTabKey;
  onTabChange: (tab: AccountTabKey) => void;
  onLogout?: () => void;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onLogout
}) => {
  const isInstructor = currentUser?.role === 'instructor';
  const isAdmin = currentUser?.role === 'admin';
  const roleLabel = isInstructor ? 'Giảng viên' : isAdmin ? 'Quản trị viên' : 'Học viên';
  const roleBadgeColor = isInstructor ? 'bg-purple-50 text-purple-700 border-purple-200' : isAdmin ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200';

  const avatarUrl = currentUser?.avatarUrl || currentUser?.avatar_url || currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || currentUser?.full_name || 'User')}&background=007A64&color=fff&bold=true`;

  const menuItems: { key: AccountTabKey; label: string; icon: React.ReactNode; show: boolean }[] = [
    {
      key: 'profile',
      label: 'Hồ sơ cá nhân',
      icon: <User className="w-4 h-4" />,
      show: true
    },
    {
      key: 'professional',
      label: 'Hồ sơ chuyên môn',
      icon: <Briefcase className="w-4 h-4" />,
      show: isInstructor
    },
    {
      key: 'security',
      label: 'Bảo mật & Phiên',
      icon: <Lock className="w-4 h-4" />,
      show: true
    },
    {
      key: 'roles',
      label: 'Vai trò & Quyền',
      icon: <Award className="w-4 h-4" />,
      show: true
    }
  ];

  return (
    <aside className="w-full lg:w-64 shrink-0 bg-white rounded-2xl border border-[#e7e8ed] shadow-xs p-5 flex flex-col justify-between self-start sticky top-6">
      <div>
        {/* User Card inside Sidebar */}
        <div className="flex flex-col items-center text-center pb-5 mb-5 border-b border-[#e7e8ed]">
          <div className="relative mb-3">
            <img
              src={avatarUrl}
              alt={currentUser?.name || 'User Avatar'}
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || currentUser?.full_name || 'User')}&background=007A64&color=fff&bold=true`;
              }}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-sm bg-slate-100"
            />
            <span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" title="Đang hoạt động"></span>
          </div>

          <h3 className="font-black text-[#06091a] text-sm leading-snug truncate w-full px-2">
            {currentUser?.name || currentUser?.full_name || 'Người dùng MindHub'}
          </h3>
          <p className="text-[11px] text-[#737373] font-medium truncate w-full px-2 mt-0.5">
            {currentUser?.email || 'user@mindhub.vn'}
          </p>

          <span className={`inline-flex items-center gap-1 mt-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${roleBadgeColor}`}>
            <ShieldCheck className="w-3 h-3" />
            {roleLabel}
          </span>
        </div>

        {/* Sidebar Menu Options */}
        <nav className="space-y-1">
          {menuItems.filter(item => item.show).map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onTabChange(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#007A64] text-white shadow-2xs'
                    : 'text-[#595959] hover:bg-slate-50 hover:text-[#06091a]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white/90" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout button at bottom */}
      {onLogout && (
        <div className="pt-5 mt-5 border-t border-[#e7e8ed]">
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất tài khoản</span>
          </button>
        </div>
      )}
    </aside>
  );
};
