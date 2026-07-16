import React, { useState, useRef, useEffect } from 'react';

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
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
          <span className="text-mid-gray">Admin</span>
          <svg className="w-3 h-3 text-mid-gray/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 5l7 7-7 7"/>
          </svg>
          <span className="font-medium text-ink">{breadcrumbLabel}</span>
        </nav>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-2.5 md:gap-3">
        {/* Search */}
        <div className="relative flex items-center bg-canvas hover:bg-hairline/60 transition-colors duration-200 text-mid-gray px-3 py-1.5 rounded-full text-xs font-normal cursor-pointer w-32 sm:w-44 md:w-56 gap-2">
          <svg className="w-3.5 h-3.5 text-mid-gray shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
          </svg>
          <span className="truncate">Tìm kiếm...</span>
          <kbd className="hidden md:inline-flex h-4 select-none items-center gap-0.5 rounded border border-hairline bg-paper px-1.5 font-mono text-[9px] font-medium text-mid-gray absolute right-1.5">⌘K</kbd>
        </div>

        {/* Notification */}
        <button type="button" className="relative p-2 rounded-full border border-hairline hover:bg-canvas text-ink shrink-0 transition-colors" aria-label="Xem thông báo">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
          </svg>
          <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-ember"></span>
        </button>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button 
            onClick={() => setProfileOpen(!profileOpen)}
            type="button" 
            className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5 rounded-full border border-hairline hover:bg-canvas transition-colors shrink-0"
          >
            <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-ink text-white font-semibold text-xs shrink-0 select-none">
              AD
            </div>
            <span className="hidden md:inline text-xs font-semibold text-ink">Administrator</span>
            <svg className={`w-3.5 h-3.5 text-mid-gray transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-11 z-50 w-52 bg-paper border border-hairline rounded-[6px] p-1.5 shadow-subtle flex flex-col origin-top-right animate-scaleUp">
              <div className="px-3.5 py-2.5">
                <p className="text-xs font-semibold text-ink leading-none">Admin MindHub</p>
                <p className="text-[10px] text-mid-gray mt-1 truncate">admin@mindhub.edu.vn</p>
              </div>
              <div className="h-[1px] bg-hairline my-1 mx-2"></div>
              <a href="#" className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-ink hover:bg-canvas rounded-full transition-colors">
                <svg className="w-4 h-4 text-mid-gray" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                </svg>
                <span>Cấu hình tài khoản</span>
              </a>
              <a href="#" className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-ink hover:bg-canvas rounded-full transition-colors">
                <svg className="w-4 h-4 text-mid-gray" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
                </svg>
                <span>Trung tâm trợ giúp</span>
              </a>
              <div className="h-[1px] bg-hairline my-1 mx-2"></div>
              <button onClick={() => window.location.href = '/'} className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs text-ember hover:bg-red-50 hover:text-ember rounded-full transition-colors cursor-pointer">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
                </svg>
                <span>Đăng xuất</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
