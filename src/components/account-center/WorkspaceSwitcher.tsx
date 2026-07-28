import React from 'react';
import { BookOpen, GraduationCap, ArrowRight, LayoutDashboard, ShieldAlert } from 'lucide-react';
import { ROUTES } from '../../utils/routes';

interface WorkspaceSwitcherProps {
  currentUser: any;
  onNavigateTo?: (route: string) => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  currentUser,
  onNavigateTo
}) => {
  // STRICT ROLE CHECK: Only show instructor workspace controls if backend user is instructor/admin
  const role = currentUser?.role || '';
  const roles = Array.isArray(currentUser?.roles) ? currentUser.roles : [];
  const isInstructor = role === 'instructor' || role === 'admin' || roles.includes('instructor') || roles.includes('admin');

  // If user does NOT have instructor role, do not render instructor workspace card at all
  if (!isInstructor) {
    return null;
  }

  const handleGoToInstructorDashboard = () => {
    if (onNavigateTo) {
      onNavigateTo(ROUTES.instructor.dashboard);
    } else {
      window.history.pushState({}, '', ROUTES.instructor.dashboard);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const handleGoToStudentWorkspace = () => {
    if (onNavigateTo) {
      onNavigateTo(ROUTES.home);
    } else {
      window.history.pushState({}, '', ROUTES.home);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-[#e7e8ed]">
        <div>
          <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a]">
            Chuyển không gian làm việc
          </h2>
          <p className="text-[11px] text-[#737373] font-medium mt-0.5">
            Tài khoản của bạn hỗ trợ điều hướng nhanh giữa Không gian Giảng viên và Học viên
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* Workspace 1: Giảng viên */}
        <div className="p-4 bg-purple-50/60 rounded-xl border border-purple-200 flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-2xs shrink-0 mt-0.5">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-[#06091a] text-xs">Không gian Giảng viên</h3>
              <p className="text-[11px] text-[#595959] font-medium leading-relaxed mt-0.5">
                Quản lý khóa học, học viên, doanh thu và thanh toán.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-purple-200/60">
            <button
              type="button"
              onClick={handleGoToInstructorDashboard}
              className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Đi đến Dashboard Giảng viên</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Workspace 2: Học viên */}
        <div className="p-4 bg-slate-50/80 rounded-xl border border-[#e7e8ed] flex flex-col justify-between space-y-3">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#007A64] text-white rounded-xl shadow-2xs shrink-0 mt-0.5">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-[#06091a] text-xs">Không gian Học viên</h3>
              <p className="text-[11px] text-[#595959] font-medium leading-relaxed mt-0.5">
                Tham gia học tập, xem tiến độ bài giảng và chứng chỉ.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-[#e7e8ed]">
            <button
              type="button"
              onClick={handleGoToStudentWorkspace}
              className="w-full sm:w-auto px-4 py-2 bg-white border border-[#dbdde4] hover:bg-slate-100 text-[#06091a] text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>Về trang chủ Học viên</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#007A64]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
