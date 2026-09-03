import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  INSTRUCTOR_NAVIGATION_ITEMS, 
  InstructorNavItem 
} from '../../config/instructorNavigation';
import { HelpCircle, ChevronRight, X } from 'lucide-react';

interface InstructorSidebarProps {
  activeKey: string;
  onNavigate: (item: InstructorNavItem) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const InstructorSidebar: React.FC<InstructorSidebarProps> = ({
  activeKey,
  onNavigate,
  isOpenMobile = false,
  onCloseMobile
}) => {
  // Listen for Esc key to close mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpenMobile && onCloseMobile) {
        onCloseMobile();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpenMobile, onCloseMobile]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpenMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpenMobile]);

  const renderContent = () => (
    <div className="flex flex-col h-full justify-between">
      <div className="space-y-6">
        {/* LOGO BRANDING */}
        <div className="flex items-center justify-between px-2 pb-5 border-b border-slate-100">
          <Link 
            to="/instructor/dashboard" 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              const dashboardItem = INSTRUCTOR_NAVIGATION_ITEMS.find(i => i.key === 'dashboard');
              if (dashboardItem && onNavigate) {
                onNavigate(dashboardItem);
              }
              if (onCloseMobile) onCloseMobile();
            }}
          >
            <img src="/mindhub-logo.png" alt="MindHub Instructor Logo" className="h-10 w-auto object-contain shrink-0" />
          </Link>

          {/* Close button for mobile drawer */}
          {onCloseMobile && (
            <button 
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 text-stone-400 hover:text-stone-700 hover:bg-slate-100 rounded-lg cursor-pointer transition-colors"
              aria-label="Close Mobile Menu"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* NAVIGATION MENU ITEMS LIST */}
        <nav className="space-y-1 text-left" aria-label="Instructor Sidebar Navigation">
          {INSTRUCTOR_NAVIGATION_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeKey === item.key;

            return (
              <button
                key={item.key}
                type="button"
                aria-current={isActive ? 'page' : undefined}
                onClick={() => {
                  onNavigate(item);
                  if (onCloseMobile) onCloseMobile();
                }}
                className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center gap-2.5 transition-all cursor-pointer select-none ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 font-bold' 
                    : 'text-stone-600 hover:bg-slate-50 hover:text-stone-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-700' : 'text-stone-500'}`} aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* FOOTER SECTION: HELP CENTER */}
      <div className="mt-auto pt-4 border-t border-slate-100">
        <div 
          onClick={() => window.open('https://help.mindhub.test', '_blank')}
          className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl text-stone-500 hover:text-stone-850 transition-colors cursor-pointer text-[10px] font-bold text-left"
        >
          <span className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-stone-400 shrink-0" />
            <div>
              <p className="leading-none text-stone-700 font-bold">Trung tâm hỗ trợ</p>
              <p className="text-[8px] text-stone-400 font-medium mt-0.5">help.mindhub.vn</p>
            </div>
          </span>
          <ChevronRight className="w-3 h-3 text-stone-450 shrink-0" />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* DESKTOP FIXED SIDEBAR */}
      <aside className="hidden lg:flex w-[240px] min-w-[240px] shrink-0 sticky top-0 h-screen bg-white border-r border-slate-100 p-4 flex-col justify-between overflow-y-auto z-30 select-none">
        {renderContent()}
      </aside>

      {/* MOBILE / TABLET OVERLAY & DRAWER */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          {/* Dark Overlay Background */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" 
            onClick={onCloseMobile} 
            aria-hidden="true"
          />

          {/* Sliding Drawer Panel */}
          <aside className="fixed inset-y-0 left-0 w-[280px] max-w-[85vw] bg-white h-full shadow-2xl p-4 flex flex-col justify-between overflow-y-auto z-50 animate-in slide-in-from-left duration-300">
            {renderContent()}
          </aside>
        </div>
      )}
    </>
  );
};
