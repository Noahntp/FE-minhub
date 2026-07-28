import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, ChevronRight, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { ApiService } from '../../services/api';

interface InstructorNotificationDropdownProps {
  unreadCount: number;
  onUnreadCountChange: (newCount: number) => void;
  onViewAllNotifications: () => void;
}

export const InstructorNotificationDropdown: React.FC<InstructorNotificationDropdownProps> = ({
  unreadCount,
  onUnreadCountChange,
  onViewAllNotifications
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
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

  // Load notifications when dropdown is opened
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        const res = await ApiService.getInstructorNotifications();
        const items = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        if (isMounted && Array.isArray(items)) {
          const mapped = items.slice(0, 6).map((item: any, idx: number) => ({
            id: item.id || idx + 1,
            title: item.title || 'Thông báo hệ thống',
            content: item.message || item.content || item.desc || '',
            time: item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : 'Gần đây',
            read: Boolean(item.read_at)
          }));
          setNotifications(mapped);
        }
      } catch {
        if (isMounted) {
          setNotifications([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchNotifications();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await ApiService.markAllInstructorNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      onUnreadCountChange(0);
    } catch {
      onUnreadCountChange(0);
    } finally {
      setMarkingAll(false);
    }
  };

  const handleItemClick = async (id: number | string) => {
    try {
      await ApiService.markInstructorNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      onUnreadCountChange(Math.max(0, unreadCount - 1));
    } catch {
      // Ignore
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* BELL BUTTON */}
      <button
        type="button"
        aria-label="Mở thông báo hệ thống"
        aria-expanded={isOpen}
        onClick={handleToggle}
        className="relative p-2 text-stone-600 hover:text-stone-900 hover:bg-slate-100 rounded-full transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        <Bell className="w-4.5 h-4.5 text-stone-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 px-1 min-w-[16px] h-4 bg-rose-500 border-2 border-white rounded-full flex items-center justify-center text-[8px] text-white font-black leading-none shadow-2xs pointer-events-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* DROPDOWN POPOVER */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xs text-stone-850">Thông báo hệ thống</h3>
              {unreadCount > 0 && (
                <span className="bg-emerald-100 text-emerald-800 font-bold text-[9px] px-1.5 py-0.5 rounded-full">
                  {unreadCount} chưa đọc
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                disabled={markingAll}
                className="text-[10px] text-emerald-700 font-bold hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                {markingAll ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                Đã đọc tất cả
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {loading ? (
              <div className="py-8 flex flex-col items-center justify-center text-stone-400 gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                <span className="text-[10px] font-medium">Đang tải thông báo...</span>
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-stone-400 space-y-1">
                <Bell className="w-6 h-6 text-stone-300 mx-auto" />
                <p className="text-[11px] font-bold text-stone-600">Không có thông báo mới</p>
                <p className="text-[9.5px] text-stone-400">Bạn đã cập nhật toàn bộ thông báo hệ thống.</p>
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`p-3 text-left transition-colors cursor-pointer flex gap-2.5 items-start ${
                    item.read ? 'bg-white hover:bg-slate-50/70' : 'bg-emerald-50/30 hover:bg-emerald-50/60'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${item.read ? 'bg-stone-300' : 'bg-emerald-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-[11px] leading-snug ${item.read ? 'font-semibold text-stone-750' : 'font-extrabold text-stone-900'}`}>
                      {item.title}
                    </p>
                    {item.content && (
                      <p className="text-[10px] text-stone-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {item.content}
                      </p>
                    )}
                    <span className="text-[8.5px] text-stone-400 font-medium block mt-1">{item.time}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50/80 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
                onViewAllNotifications();
              }}
              className="w-full py-1.5 text-center text-[10.5px] font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50/50 rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              Xem tất cả thông báo <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
