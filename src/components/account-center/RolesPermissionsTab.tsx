import React from 'react';
import { Award, ShieldCheck, Lock, AlertTriangle, CheckCircle2, FileText } from 'lucide-react';

interface RolesPermissionsTabProps {
  currentUser: any;
}

export const RolesPermissionsTab: React.FC<RolesPermissionsTabProps> = ({
  currentUser
}) => {
  const role = currentUser?.role || 'learner';
  const isInstructor = role === 'instructor';
  const isAdmin = role === 'admin';

  const roleTitle = isInstructor ? 'Giảng viên chính thức (Instructor)' : isAdmin ? 'Quản trị viên hệ thống (Administrator)' : 'Học viên (Learner)';
  const roleDesc = isInstructor 
    ? 'Quyền tạo khóa học, tải tài nguyên giảng dạy, theo dõi doanh thu và tương tác với học viên.'
    : isAdmin 
    ? 'Quyền toàn năng quản trị người dùng, duyệt rút tiền, kiểm duyệt khóa học và xem báo cáo tài chính.'
    : 'Quyền tham gia các khóa học đã đăng ký, gửi câu hỏi thảo luận và nhận chứng chỉ hoàn thành.';

  const permissionsList = isInstructor ? [
    { title: 'Tạo & Quản lý khóa học', desc: 'Được phép tạo bản nháp, xuất bản khóa học và tải video bài giảng.' },
    { title: 'Xem báo cáo doanh thu', desc: 'Xem chi tiết chia sẻ doanh thu và lịch sử payout định kỳ.' },
    { title: 'Yêu cầu thanh toán sớm', desc: 'Được gửi yêu cầu rút tiền sớm kèm xác thực OTP email.' },
    { title: 'Giải đáp thắc mắc Q&A', desc: 'Trả lời thắc mắc và tương tác với học viên trong từng bài học.' },
    { title: 'Tạo mã giảm giá Promo', desc: 'Được tạo coupon khuyến mãi cho khóa học cá nhân.' },
  ] : isAdmin ? [
    { title: 'Quản trị người dùng & Giảng viên', desc: 'Khóa/mở khóa tài khoản, duyệt yêu cầu nâng cấp giảng viên.' },
    { title: 'Duyệt thanh toán Payout', desc: 'Duyệt các khoản chi trả doanh thu hàng tháng cho giảng viên.' },
    { title: 'Kiểm duyệt nội dung khóa học', desc: 'Phê duyệt hoặc từ chối các khóa học mới gửi lên hệ thống.' },
    { title: 'Cấu hình tỷ lệ hoa hồng', desc: 'Thiết lập quy tắc chia sẻ doanh thu Udemy style.' },
  ] : [
    { title: 'Đăng ký & Học tập', desc: 'Được truy cập bài giảng video, tài liệu PDF và quiz trắc nghiệm.' },
    { title: 'Đặt câu hỏi thảo luận', desc: 'Gửi câu hỏi cho giảng viên trong từng bài học.' },
    { title: 'Đánh giá & Review khóa học', desc: 'Gửi phản hồi và xếp hạng sao sau khi tham gia học.' },
    { title: 'Tải chứng chỉ hoàn thành', desc: 'Nhận chứng chỉ trực tuyến khi hoàn thành 100% khóa học.' },
  ];

  return (
    <div className="space-y-6">
      {/* Warning Alert Banner */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex items-start gap-3 text-xs text-amber-900">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-extrabold text-amber-950">Lưu ý về Phân bổ Quyền hạn</h4>
          <p className="mt-0.5 leading-relaxed font-medium text-amber-800">
            Người dùng không thể tự thay đổi vai trò hoặc cấp thêm quyền hạn trên hệ thống. 
            Nếu bạn muốn trở thành Giảng viên hoặc gửi yêu cầu nâng cấp tài khoản, vui lòng truy cập trang đăng ký Giảng viên.
          </p>
        </div>
      </div>

      {/* Section 1: Current Role Overview */}
      <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a] mb-4 pb-2 border-b border-[#e7e8ed]">
          Vai trò hệ thống hiện tại
        </h2>

        <div className="p-4 bg-slate-50/80 rounded-xl border border-[#e7e8ed] flex items-start gap-4">
          <div className={`p-3 rounded-2xl shrink-0 ${isInstructor ? 'bg-purple-600 text-white' : isAdmin ? 'bg-blue-600 text-white' : 'bg-[#007A64] text-white'}`}>
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-[#06091a] text-sm">{roleTitle}</h3>
              <span className="bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-2 py-0.5 rounded text-[10px] uppercase">
                Active
              </span>
            </div>
            <p className="text-xs text-[#595959] font-medium leading-relaxed mt-1">
              {roleDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Permissions Matrix */}
      <div className="bg-white rounded-2xl border border-[#e7e8ed] p-5 shadow-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-[#06091a] mb-4 pb-2 border-b border-[#e7e8ed]">
          Danh sách quyền hạn được cấp (Read-only)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {permissionsList.map((perm, idx) => (
            <div key={idx} className="p-3.5 bg-slate-50/60 rounded-xl border border-[#e7e8ed] flex items-start gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#007A64] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[#06091a]">{perm.title}</h4>
                <p className="text-[11px] text-[#737373] font-medium leading-relaxed mt-0.5">{perm.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
