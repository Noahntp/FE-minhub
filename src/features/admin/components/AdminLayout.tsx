import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import Sidebar from '@/features/admin/components/Sidebar';
import Topbar from '@/features/admin/components/Topbar';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  breadcrumbLabel: string;
}

const TITLE_MAP: Record<string, string> = {
  'dashboard': 'Dashboard',
  'users': 'Quản lý người dùng',
  'courses': 'Quản lý khóa học',
  'course-reviews': 'Kiểm duyệt khóa học',
  'categories': 'Quản lý danh mục',
  'orders': 'Quản lý đơn hàng',
  'revenues': 'Doanh thu & Đối soát',
  'withdrawals': 'Yêu cầu rút tiền',
  'payout-accounts': 'Tài khoản nhận tiền',
  'instructor-upgrades': 'Yêu cầu lên giảng viên',
  'moderation': 'Kiểm duyệt bình luận',
  'faqs': 'Quản lý FAQ',
  'reports': 'Báo cáo & Thống kê',
  'banners': 'Quản lý Banner',
};

export default function AdminLayout({ children, activeTab, onTabChange, breadcrumbLabel }: AdminLayoutProps) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const mainScrollRef = useRef<HTMLElement | null>(null);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('mindhub-sidebar-collapsed') === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // 1. Set Document Title: MindHub Admin | <Tên trang>
  useEffect(() => {
    const pageTitle = TITLE_MAP[activeTab] || breadcrumbLabel || 'Dashboard';
    document.title = `MindHub Admin | ${pageTitle}`;
  }, [activeTab, breadcrumbLabel]);

  // 2. Scroll Restoration on POP (Back / Forward), Reset to top on PUSH
  const currentPathKey = location.pathname + location.search;
  const isRestoringRef = useRef(false);

  useEffect(() => {
    const scrollContainer = mainScrollRef.current;
    if (!scrollContainer) return;

    if (navigationType === 'POP') {
      const savedYStr = sessionStorage.getItem(`admin_scroll_${currentPathKey}`);
      const savedY = savedYStr !== null ? parseInt(savedYStr, 10) : null;

      if (savedY !== null && savedY > 0) {
        isRestoringRef.current = true;
        let attempts = 0;
        const maxAttempts = 30; // 30 * 50ms = 1.5s tối đa để đợi API load và render DOM

        const intervalId = setInterval(() => {
          attempts++;
          if (!scrollContainer) {
            clearInterval(intervalId);
            isRestoringRef.current = false;
            return;
          }

          // Cố gắng đặt lại vị trí cuộn đã lưu
          scrollContainer.scrollTop = savedY;

          // Nếu vị trí cuộn đã đạt được (sai số <= 5px) hoặc đã hết số lần thử
          if (Math.abs(scrollContainer.scrollTop - savedY) <= 5 || attempts >= maxAttempts) {
            clearInterval(intervalId);
            setTimeout(() => {
              isRestoringRef.current = false;
            }, 100);
          }
        }, 50);

        return () => {
          clearInterval(intervalId);
          isRestoringRef.current = false;
        };
      } else {
        scrollContainer.scrollTop = 0;
      }
    } else {
      isRestoringRef.current = false;
      scrollContainer.scrollTop = 0;
    }
  }, [currentPathKey, navigationType]);

  const handleScroll = () => {
    if (mainScrollRef.current && !isRestoringRef.current) {
      sessionStorage.setItem(
        `admin_scroll_${currentPathKey}`,
        String(mainScrollRef.current.scrollTop)
      );
    }
  };

  const handleToggleCollapse = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('mindhub-sidebar-collapsed', String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen w-screen bg-canvas overflow-hidden font-sans text-ink selection:bg-ink selection:text-white">
      {/* Sidebar Overlay for Mobile */}
      {mobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-ink/20 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar component */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={(tabId) => {
          onTabChange(tabId);
          setMobileSidebarOpen(false);
        }} 
        isCollapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
        onToggleCollapse={handleToggleCollapse}
      />

      {/* Main Content Wrapper */}
      <div className="flex flex-1 flex-col min-w-0 transition-all duration-300">
        <Topbar 
          onToggleSidebarDesktop={handleToggleCollapse}
          onToggleSidebarMobile={() => setMobileSidebarOpen(true)}
          breadcrumbLabel={breadcrumbLabel}
        />

        {/* Scrollable Main Area */}
        <main 
          ref={mainScrollRef} 
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 bg-canvas"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
