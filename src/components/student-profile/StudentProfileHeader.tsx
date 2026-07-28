import React from 'react';
import { User, ShieldCheck, ChevronRight, Sparkles } from 'lucide-react';

interface StudentProfileHeaderProps {
  status?: string;
  role?: string;
  onNavigateTo?: (route: string) => void;
}

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  status = 'active',
  role = 'student',
  onNavigateTo
}) => {
  return (
    <header className="mb-8">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3">
        <button
          type="button"
          onClick={() => onNavigateTo && onNavigateTo('/')}
          className="hover:text-emerald-700 transition-colors cursor-pointer"
        >
          Trang chủ
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">Hồ sơ cá nhân</span>
      </nav>

      {/* Title & Description Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-7 rounded-3xl shadow-lg border border-slate-800 relative overflow-hidden">
        {/* Background Subtle Ambient Glow */}
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Hồ sơ cá nhân
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Học viên
            </span>
          </div>
          <p className="text-sm text-slate-300 max-w-xl font-medium leading-relaxed">
            Quản lý thông tin tài khoản, ảnh đại diện, xác minh thông tin và cài đặt mật khẩu của bạn.
          </p>
        </div>

        {/* Status Badge */}
        <div className="shrink-0 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700 text-xs font-bold text-slate-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Tài khoản hoạt động</span>
          </div>
        </div>
      </div>
    </header>
  );
};
