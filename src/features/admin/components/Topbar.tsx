import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '@/features/admin/api';
import { 
  Bell, 
  BookOpen, 
  UserCheck, 
  ArrowDownToLine, 
  CreditCard, 
  ChevronRight, 
  CheckCircle2,
  ExternalLink 
} from 'lucide-react';

interface TopbarProps {
  onToggleSidebarDesktop: () => void;
  onToggleSidebarMobile: () => void;
  breadcrumbLabel: string;
}

export default function Topbar({
  onToggleSidebarDesktop,
  onToggleSidebarMobile,
  breadcrumbLabel
}: TopbarProps) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  // User state from localStorage
  const [currentUser, setCurrentUser] = useState<any>(() => {
    try {
      const stored = localStorage.getItem('mindhub_user') || localStorage.getItem('mindhub_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Action required backlog data for notification
  const [actionItems, setActionItems] = useState<{
    pending_course_reviews: number;
    pending_instructor_upgrades: number;
    pending_withdrawals: number;
    pending_payout_accounts: number;
  }>({
    pending_course_reviews: 0,
    pending_instructor_upgrades: 0,
    pending_withdrawals: 0,
    pending_payout_accounts: 0,
  });
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const fetchBacklog = async () => {
    try {
      setLoadingNotifications(true);
      const res = await adminApi.getDashboardOverview();
      // Handle unwrapped API response (res.action_required) and wrapped response (res.data.action_required)
      const actions = (res && res.action_required) || (res && res.data && res.data.action_required);
      if (actions) {
        setActionItems({
          pending_course_reviews: Number(actions.pending_course_reviews || 0),
          pending_instructor_upgrades: Number(actions.pending_instructor_upgrades || 0),
          pending_withdrawals: Number(actions.pending_withdrawals || 0),
          pending_payout_accounts: Number(actions.pending_payout_accounts || 0),
        });
      }
    } catch (err) {
      console.warn('Could not load notification backlog:', err);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    fetchBacklog();

    const handleTaskUpdated = () => {
      fetchBacklog();
    };
    window.addEventListener('mindhub-admin-task-updated', handleTaskUpdated);
    return () => {
      window.removeEventListener('mindhub-admin-task-updated', handleTaskUpdated);
    };
  }, []);

  const totalPending = 
    (actionItems.pending_course_reviews || 0) +
    (actionItems.pending_instructor_upgrades || 0) +
    (actionItems.pending_withdrawals || 0) +
    (actionItems.pending_payout_accounts || 0);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleNavigateAction = (url: string) => {
    setNotificationOpen(false);
    navigate(url);
  };

  const notificationList = [
    {
      id: 'courses',
      count: actionItems.pending_course_reviews || 0,
      title: 'Khóa học chờ duyệt',
      desc: 'khóa học mới gửi yêu cầu phê duyệt nội dung',
      url: '/admin/courses?status=pending_review',
      icon: BookOpen,
      iconBg: 'bg-amber-100 text-amber-700',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'upgrades',
      count: actionItems.pending_instructor_upgrades || 0,
      title: 'Yêu cầu lên giảng viên',
      desc: 'hồ sơ ứng tuyển giảng viên đang chờ xử lý',
      url: '/admin/instructor-upgrades?status=pending',
      icon: UserCheck,
      iconBg: 'bg-blue-100 text-blue-700',
      badgeBg: 'bg-blue-100 text-blue-800 border-blue-200',
    },
    {
      id: 'withdrawals',
      count: actionItems.pending_withdrawals || 0,
      title: 'Yêu cầu rút tiền',
      desc: 'lệnh rút tiền từ giảng viên cần phê duyệt & chi trả',
      url: '/admin/withdrawals?status=pending',
      icon: ArrowDownToLine,
      iconBg: 'bg-emerald-100 text-emerald-700',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    },
    {
      id: 'payouts',
      count: actionItems.pending_payout_accounts || 0,
      title: 'Tài khoản nhận tiền',
      desc: 'tài khoản ngân hàng/MoMo cần xác minh thông tin',
      url: '/admin/payout-accounts?status=pending_verification',
      icon: CreditCard,
      iconBg: 'bg-purple-100 text-purple-700',
      badgeBg: 'bg-purple-100 text-purple-800 border-purple-200',
    },
  ];

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-hairline bg-paper px-4 md:px-6 relative z-30">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        {/* Toggle Mobile Sidebar */}
        <button
          onClick={onToggleSidebarMobile}
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink hover:bg-canvas lg:hidden transition-colors"
          aria-label="Mở Sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        {/* Toggle Desktop Sidebar */}
        <button
          onClick={onToggleSidebarDesktop}
          type="button"
          className="hidden lg:flex h-9 w-9 items-center justify-center rounded-full border border-hairline text-ink hover:bg-canvas transition-colors"
          aria-label="Thu gọn Sidebar"
        >
          <svg className="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
          </svg>
        </button>

        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-xs md:text-sm" aria-label="Breadcrumb">
          <span className="text-mid-gray font-medium">Admin</span>
          <svg className="w-3 h-3 text-mid-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7"/>
          </svg>
          <span className="font-semibold text-ink">{breadcrumbLabel}</span>
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2.5 md:gap-3">
        {/* Notification Button & Dropdown */}
        <div className="relative" ref={notificationRef}>
          <button 
            type="button" 
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="relative flex items-center justify-center h-9 w-9 rounded-full border border-hairline hover:bg-canvas text-ink transition-colors cursor-pointer" 
            aria-label="Xem thông báo nhiệm vụ cần xử lý"
          >
            <Bell className="w-4 h-4 text-ink" />
            {totalPending > 0 && (
              <span className="absolute -top-1 -right-1 flex min-w-5 h-5 items-center justify-center px-1 rounded-full bg-rose-600 text-white text-[10px] font-bold border-2 border-paper animate-pulse">
                {totalPending > 99 ? '99+' : totalPending}
              </span>
            )}
          </button>

          {/* Notification Dropdown Panel */}
          {notificationOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 bg-paper border border-hairline rounded-xl shadow-xl flex flex-col overflow-hidden origin-top-right animate-scaleUp">
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-canvas/40">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-ink" />
                  <span className="text-sm font-bold text-ink">Nhiệm vụ cần xử lý</span>
                </div>
                <div className="flex items-center gap-2">
                  {totalPending > 0 ? (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                      {totalPending} việc tồn đọng
                    </span>
                  ) : (
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hoàn tất
                    </span>
                  )}
                  {/* Close button X */}
                  <button
                    type="button"
                    onClick={() => setNotificationOpen(false)}
                    className="p-1 rounded-md text-mid-gray hover:text-ink hover:bg-canvas transition-colors border-none cursor-pointer"
                    aria-label="Đóng thông báo"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="max-h-[380px] overflow-y-auto divide-y divide-hairline">
                {totalPending === 0 ? (
                  <div className="p-6 text-center text-mid-gray">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                    <p className="text-xs font-semibold text-ink">Tuyệt vời! Không có nhiệm vụ nào cần xử lý.</p>
                    <p className="text-[11px] text-mid-gray mt-1">Hệ thống đang hoạt động ổn định và trơn tru.</p>
                  </div>
                ) : (
                  notificationList
                    .filter((item) => item.count > 0)
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleNavigateAction(item.url)}
                          className="w-full flex items-start gap-3 p-3.5 text-left hover:bg-canvas/80 transition-colors border-none cursor-pointer bg-paper"
                        >
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${item.iconBg}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold text-ink truncate">{item.title}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${item.badgeBg}`}>
                                {item.count} chờ xử lý
                              </span>
                            </div>
                            <p className="text-[11px] text-mid-gray mt-0.5 line-clamp-2">
                              Có <strong className="text-ink font-semibold">{item.count}</strong> {item.desc}
                            </p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-mid-gray/50 shrink-0 self-center" />
                        </button>
                      );
                    })
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-hairline bg-canvas/30 text-center">
                <button
                  onClick={() => {
                    setNotificationOpen(false);
                    navigate('/admin/dashboard');
                  }}
                  className="text-[11px] font-semibold text-ink hover:text-emerald-700 transition-colors inline-flex items-center gap-1 cursor-pointer bg-transparent border-none py-1"
                >
                  <span>Xem chi tiết trên Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            type="button"
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border border-hairline hover:bg-canvas transition-colors shrink-0 cursor-pointer"
          >
            <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-ink text-white font-semibold text-xs shrink-0 select-none">
              {currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'AD'}
            </div>
            <span className="hidden md:inline text-xs font-semibold text-ink">
              {currentUser?.full_name || 'Admin MindHub'}
            </span>
            <svg className={`w-3.5 h-3.5 text-mid-gray transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-11 z-50 w-56 bg-paper border border-hairline rounded-xl p-1.5 shadow-xl flex flex-col origin-top-right animate-scaleUp">
              <div className="px-3.5 py-2.5">
                <p className="text-xs font-bold text-ink leading-none">{currentUser?.full_name || 'Admin MindHub'}</p>
                <p className="text-[10px] text-mid-gray mt-1 truncate">{currentUser?.email || 'admin@mindhub.vn'}</p>
              </div>
              <div className="h-[1px] bg-hairline my-1 mx-2"></div>
              <button
                onClick={() => {
                  setProfileOpen(false);
                  navigate('/admin/dashboard');
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-ink hover:bg-canvas rounded-lg transition-colors cursor-pointer bg-transparent border-none text-left"
              >
                <BookOpen className="w-4 h-4 text-mid-gray" />
                <span>Bảng điều khiển</span>
              </button>
              <div className="h-[1px] bg-hairline my-1 mx-2"></div>
              <button
                onClick={() => {
                  localStorage.removeItem('mindhub_api_token');
                  localStorage.removeItem('mindhub_user'); 
                  localStorage.removeItem('mindhub_current_user'); 
                  localStorage.removeItem('mindhub_is_logged_in');
                  window.location.href = '/login';
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-lg transition-colors cursor-pointer bg-transparent border-none text-left"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
                <span className="font-semibold">Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
