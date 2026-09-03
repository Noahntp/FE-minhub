import React, { useRef, useEffect } from 'react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isCollapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleCollapse?: () => void;
}

export default function Sidebar({
  activeTab,
  onTabChange,
  isCollapsed,
  mobileOpen,
  onCloseMobile,
  onToggleCollapse
}: SidebarProps) {
  const sidebarScrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (sidebarScrollRef.current) {
      const activeEl = sidebarScrollRef.current.querySelector('[data-active="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeTab]);


  return (
    <aside 
      data-sidebar 
      className={`fixed inset-y-0 left-0 z-50 flex flex-col w-[248px] border-r border-hairline bg-surface-alt transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 lg:flex shrink-0 h-full ${
        isCollapsed ? 'sidebar-collapsed' : ''
      } ${mobileOpen ? 'mobile-open translate-x-0' : '-translate-x-full'}`}
    >
      {/* Sidebar Header */}
      <div className="flex h-16 shrink-0 items-center justify-between px-5 border-b border-hairline sidebar-logo-container">
        <button 
          onClick={() => onTabChange('dashboard')} 
          type="button"
          className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-none p-0 select-none text-left"
          title="Về Dashboard"
        >
          <div className="h-8 w-8 rounded-lg bg-ink text-white flex items-center justify-center font-bold text-sm tracking-tight shrink-0 shadow-sm group-hover:bg-ink/90 transition-colors">
            M
          </div>
          <div className="flex flex-col sidebar-logo-text min-w-0">
            <span className="text-xs font-bold text-ink tracking-tight leading-none truncate">MindHub</span>
            <span className="text-[9px] font-semibold text-mid-gray tracking-wider uppercase leading-none mt-1">Admin Panel</span>
          </div>
        </button>
        {/* Close Mobile Sidebar (Mobile Only) */}
        <button onClick={onCloseMobile} type="button" className="rounded-full border border-hairline p-1.5 hover:bg-paper lg:hidden transition-colors" aria-label="Đóng Menu">
          <svg className="w-4 h-4 text-ink" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      {/* Sidebar Navigation */}
      <div ref={sidebarScrollRef} className="flex-1 overflow-y-auto py-4 px-3 space-y-3 custom-scrollbar">
        {/* Nhóm: Tổng quan */}
        <div>
          <div className="sidebar-group-title px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-mid-gray transition-opacity duration-300">Tổng quan</div>
          <div className="space-y-0.5">
            <button 
              onClick={() => onTabChange('dashboard')} 
              data-active={activeTab === 'dashboard' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect width="7" height="9" x="3" y="3" rx="1.5"/>
                <rect width="7" height="5" x="14" y="3" rx="1.5"/>
                <rect width="7" height="9" x="14" y="12" rx="1.5"/>
                <rect width="7" height="5" x="3" y="16" rx="1.5"/>
              </svg>
              <span className="sidebar-text truncate">Dashboard</span>
              <span className="sidebar-tooltip">Dashboard</span>
            </button>
          </div>
        </div>

        {/* Nhóm: Người dùng */}
        <div>
          <div className="sidebar-group-title px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-mid-gray transition-opacity duration-300">Người dùng</div>
          <div className="space-y-0.5">
            <button 
              onClick={() => onTabChange('users')} 
              data-active={activeTab === 'users' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <span className="sidebar-text truncate">Quản lý người dùng</span>
              <span className="sidebar-tooltip">Quản lý người dùng</span>
            </button>
            <button 
              onClick={() => onTabChange('instructor-upgrades')} 
              data-active={activeTab === 'instructor-upgrades' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="m16 11 2 2 4-4"/>
              </svg>
              <span className="sidebar-text truncate">Yêu cầu lên giảng viên</span>
              <span className="sidebar-tooltip">Yêu cầu lên giảng viên</span>
            </button>
          </div>
        </div>

        {/* Nhóm: Khóa học */}
        <div>
          <div className="sidebar-group-title px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-mid-gray transition-opacity duration-300">Khóa học</div>
          <div className="space-y-0.5">
            <button 
              onClick={() => onTabChange('courses')} 
              data-active={activeTab === 'courses' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
              </svg>
              <span className="sidebar-text truncate">Quản lý khóa học</span>
              <span className="sidebar-tooltip">Quản lý khóa học</span>
            </button>
            <button 
              onClick={() => onTabChange('course-reviews')} 
              data-active={activeTab === 'course-reviews' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="m9 12 2 2 4-4"/>
              </svg>
              <span className="sidebar-text truncate">Kiểm duyệt khóa học</span>
              <span className="sidebar-tooltip">Kiểm duyệt khóa học</span>
            </button>
            <button 
              onClick={() => onTabChange('categories')} 
              data-active={activeTab === 'categories' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z"/>
              </svg>
              <span className="sidebar-text truncate">Quản lý danh mục</span>
              <span className="sidebar-tooltip">Quản lý danh mục</span>
            </button>
            <button 
              onClick={() => onTabChange('moderation')} 
              data-active={activeTab === 'moderation' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <path d="m10 8.5 2 1.5 4-4"/>
              </svg>
              <span className="sidebar-text truncate">Kiểm duyệt bình luận</span>
              <span className="sidebar-tooltip">Kiểm duyệt bình luận</span>
            </button>
            <button 
              onClick={() => onTabChange('faqs')} 
              data-active={activeTab === 'faqs' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" x2="12.01" y1="17" y2="17"/>
              </svg>
              <span className="sidebar-text truncate">Quản lý FAQ</span>
              <span className="sidebar-tooltip">Quản lý FAQ</span>
            </button>
          </div>
        </div>

        {/* Nhóm: Kinh doanh */}
        <div>
          <div className="sidebar-group-title px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-mid-gray transition-opacity duration-300">Kinh doanh</div>
          <div className="space-y-0.5">
            <button 
              onClick={() => onTabChange('orders')} 
              data-active={activeTab === 'orders' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <line x1="2" x2="22" y1="10" y2="10"/>
              </svg>
              <span className="sidebar-text truncate">Đơn hàng / Thanh toán</span>
              <span className="sidebar-tooltip">Đơn hàng / Thanh toán</span>
            </button>
            <button 
              onClick={() => onTabChange('revenues')} 
              data-active={activeTab === 'revenues' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <line x1="18" x2="18" y1="20" y2="10"/>
                <line x1="12" x2="12" y1="20" y2="4"/>
                <line x1="6" x2="6" y1="20" y2="14"/>
              </svg>
              <span className="sidebar-text truncate">Doanh thu / Chia sẻ</span>
              <span className="sidebar-tooltip">Doanh thu / Chia sẻ</span>
            </button>
            <button 
              onClick={() => onTabChange('withdrawals')} 
              data-active={activeTab === 'withdrawals' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect width="20" height="14" x="2" y="5" rx="2"/>
                <path d="M12 17V9"/>
                <path d="m9 12 3-3 3 3"/>
              </svg>
              <span className="sidebar-text truncate">Yêu cầu rút tiền</span>
              <span className="sidebar-tooltip">Yêu cầu rút tiền</span>
            </button>
          </div>
        </div>

        {/* Nhóm: Báo cáo */}
        <div>
          <div className="sidebar-group-title px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-mid-gray transition-opacity duration-300">Báo cáo</div>
          <div className="space-y-0.5">
            <button 
              onClick={() => onTabChange('reports')} 
              data-active={activeTab === 'reports' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
                <path d="M22 12A10 10 0 0 0 12 2v10z"/>
              </svg>
              <span className="sidebar-text truncate">Báo cáo và thống kê</span>
              <span className="sidebar-tooltip">Báo cáo và thống kê</span>
            </button>
          </div>
        </div>

        {/* Nhóm: Nội dung trang chủ */}
        <div>
          <div className="sidebar-group-title px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-mid-gray transition-opacity duration-300">Trang chủ</div>
          <div className="space-y-0.5">
            <button 
              onClick={() => onTabChange('banners')} 
              data-active={activeTab === 'banners' ? 'true' : 'false'}
              className="w-full sidebar-item relative flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-full text-mid-gray hover:bg-paper hover:text-ink border border-transparent transition-all duration-200 cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
                <circle cx="9" cy="9" r="2"/>
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
              </svg>
              <span className="sidebar-text truncate">Banner / Trang chủ</span>
              <span className="sidebar-tooltip">Banner / Trang chủ</span>
            </button>
          </div>
        </div>

      </div>

      {/* Sidebar Footer */}
      <div className="p-4 shrink-0 border-t border-hairline sidebar-logo-text bg-surface-alt">
        <div className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-full bg-canvas/60 text-[10px] font-medium text-mid-gray">
          <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          <span>Hệ thống ổn định (v1.0.0)</span>
        </div>
      </div>

      {/* Toggle Button */}
      <button 
        type="button" 
        onClick={onToggleCollapse}
        className="absolute top-1/2 -right-4 -translate-y-1/2 z-50 h-8 w-8 rounded-full border border-hairline bg-paper text-ink shadow-sm flex items-center justify-center cursor-pointer hover:bg-canvas transition-colors hidden lg:flex" 
        aria-label="Thu gọn sidebar" 
        aria-expanded={!isCollapsed}
      >
        <svg 
          className={`w-4 h-4 text-ink transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5"/>
        </svg>
      </button>
    </aside>
  );
}
