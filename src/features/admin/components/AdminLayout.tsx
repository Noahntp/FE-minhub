import React, { useState } from 'react';
import Sidebar from '@/features/admin/components/Sidebar';
import Topbar from '@/features/admin/components/Topbar';

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  breadcrumbLabel: string;
}

export default function AdminLayout({ children, activeTab, onTabChange, breadcrumbLabel }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('mindhub-sidebar-collapsed') === 'true';
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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
        <main className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 lg:p-8 bg-canvas">
          {children}
        </main>
      </div>
    </div>
  );
}
