import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LayoutDashboard, Eye, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { resolveMediaUrl as formatResolveMediaUrl } from '@/shared/utils/format';
import { ApiService } from '../../services/api';
import { useApp } from '../../app/AppContext';

const UserAvatar = ({ name, src, size = 'sm' }: { name?: string; src?: string; size?: 'sm' | 'md' | 'lg' }) => {
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setImgError(false);
  }, [src]);

  const resolvedSrc = src ? formatResolveMediaUrl(src) : '';
  const sizeClasses = size === 'lg' ? 'w-12 h-12 text-sm' : size === 'md' ? 'w-10 h-10 text-xs' : 'w-8 h-8 text-[11px]';

  const getInitials = (str?: string) => {
    if (!str) return 'GV';
    const parts = str.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  if (!resolvedSrc || imgError) {
    return (
      <div className={`${sizeClasses} rounded-full bg-[#007A64] text-white font-bold flex items-center justify-center shrink-0 border border-emerald-600/30 select-none`}>
        {getInitials(name)}
      </div>
    );
  }

  return (
    <img
      src={resolvedSrc}
      alt={name || 'Avatar'}
      onError={() => setImgError(true)}
      className={`${sizeClasses} rounded-full object-cover shrink-0 border border-slate-200 select-none`}
    />
  );
};

interface InstructorUserDropdownProps {
  currentUser: any;
  onNavigateProfile?: () => void;
  onNavigateDashboard?: () => void;
  onCloseParent?: () => void;
}

export const InstructorUserDropdown: React.FC<InstructorUserDropdownProps> = ({
  currentUser,
  onNavigateProfile,
  onNavigateDashboard,
  onCloseParent
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { setCurrentUser, setIsLoggedIn } = useApp();

  // Close dropdown when clicking outside or pressing Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  const handleGoProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onNavigateProfile) {
      onNavigateProfile();
    } else {
      navigate('/instructor/profile');
    }
  };

  const handleGoDashboard = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onNavigateDashboard) {
      onNavigateDashboard();
    } else {
      navigate('/instructor/dashboard');
    }
  };

  const handleGoLearnerSite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    if (onCloseParent) {
      onCloseParent();
    } else {
      navigate('/');
    }
  };

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(false);
    try {
      await ApiService.logout();
    } catch {
      /* ignore */
    }
    ApiService.setAuthToken(null);
    localStorage.removeItem('mindhub_api_token');
    localStorage.removeItem('mindhub_current_user');
    localStorage.setItem('mindhub_is_logged_in', 'false');
    if (setCurrentUser) {
      setCurrentUser(null);
    }
    if (setIsLoggedIn) {
      setIsLoggedIn(false);
    }
    navigate('/login', { replace: true });
  };

  const displayName = currentUser?.name || currentUser?.full_name || 'Giảng viên';
  const displayEmail = currentUser?.email || 'instructor@mindhub.edu.vn';
  const roleLabel = currentUser?.role === 'admin' ? 'Quản trị viên' : 'Giảng viên';

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* TRIGGER BUTTON */}
      <button
        type="button"
        aria-label="Mở menu tài khoản"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        onClick={handleToggle}
        className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100/80 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <UserAvatar name={displayName} src={currentUser?.avatar || currentUser?.avatar_url} size="sm" />
        <div className="text-left hidden sm:block">
          <p className="text-[10.5px] font-extrabold text-stone-850 leading-none max-w-[140px] truncate">
            {displayName}
          </p>
          <span className="text-[8px] bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold px-1.5 py-0.2 rounded mt-0.5 inline-block uppercase">
            {roleLabel}
          </span>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div 
          role="menu"
          aria-orientation="vertical"
          className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 text-left"
        >
          {/* USER INFO HEADER */}
          <div className="p-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center gap-3">
            <UserAvatar name={displayName} src={currentUser?.avatar || currentUser?.avatar_url} size="md" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black text-stone-900 truncate">{displayName}</p>
              <p className="text-[10px] text-stone-500 truncate mt-0.5">{displayEmail}</p>
              <span className="text-[8px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.5 rounded-full inline-flex items-center gap-1 mt-1 uppercase">
                <ShieldCheck className="w-2.5 h-2.5" />
                {roleLabel}
              </span>
            </div>
          </div>

          {/* MENU ITEMS */}
          <div className="p-1.5 space-y-0.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleGoProfile}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-slate-100/70 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-stone-500 shrink-0" />
              <span>Hồ sơ cá nhân</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleGoDashboard}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-slate-100/70 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4 text-stone-500 shrink-0" />
              <span>Tổng quan Dashboard</span>
            </button>

            <button
              type="button"
              role="menuitem"
              onClick={handleGoLearnerSite}
              className="w-full text-left px-3 py-2 text-xs font-semibold text-stone-700 hover:text-stone-900 hover:bg-slate-100/70 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <Eye className="w-4 h-4 text-stone-500 shrink-0" />
              <span>Xem trang học viên</span>
            </button>
          </div>

          <div className="border-t border-slate-100 p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
              <span>Đăng xuất tài khoản</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
