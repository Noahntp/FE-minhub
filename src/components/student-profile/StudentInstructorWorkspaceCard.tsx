import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ArrowRight, Sparkles, BookOpen } from 'lucide-react';

interface StudentInstructorWorkspaceCardProps {
  currentUser: any;
  onNavigateTo?: (route: string) => void;
}

export const StudentInstructorWorkspaceCard: React.FC<StudentInstructorWorkspaceCardProps> = ({
  currentUser,
  onNavigateTo
}) => {
  const navigate = useNavigate();
  // Enforce strict authorization check: roles array includes 'instructor' or role string equals 'instructor'
  const hasInstructorRole =
    currentUser?.role === 'instructor' ||
    (Array.isArray(currentUser?.roles) && currentUser.roles.includes('instructor'));

  if (!hasInstructorRole) {
    return null;
  }

  const handleGoToInstructorDashboard = () => {
    if (onNavigateTo) {
      onNavigateTo('/instructor/dashboard');
    } else {
      navigate('/instructor/dashboard');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-md border border-indigo-900/50 mb-6 relative overflow-hidden group">
      {/* Glow highlight effect */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-500/30">
              <LayoutDashboard className="w-5 h-5" />
            </span>
            <h3 className="text-lg font-black text-white tracking-tight">
              Không gian Giảng viên
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Instructor Role
            </span>
          </div>
          <p className="text-xs text-slate-300 font-medium leading-relaxed pl-1 sm:pl-11">
            Quản lý khóa học, học viên, doanh thu và thanh toán.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoToInstructorDashboard}
          className="shrink-0 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-2 group-hover:translate-x-0.5 border border-indigo-400/30"
        >
          <span>Đi đến Dashboard Giảng viên</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
};
