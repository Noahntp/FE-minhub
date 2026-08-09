import React, { useState, useEffect } from 'react';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { 
  Bell, 
  CheckCircle2, 
  Flame, 
  AlertCircle, 
  Info, 
  Check, 
  CheckCheck, 
  Trash2, 
  RotateCcw, 
  Sparkles, 
  Gift, 
  MessageSquare, 
  BookOpen, 
  X, 
  ExternalLink,
  Search,
  Filter,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { apiFetch } from '@/shared/lib/api-client';

export interface NotificationItem {
  id: string | number;
  type: string;
  category?: string;
  title: string;
  message: string;
  created_at?: string;
  time_ago?: string;
  is_read: boolean;
  read_at?: string | null;
  action_url?: string;
}

export default function NotificationPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const fetchNotifications = async () => {
    setLoading(true);
    let localList: NotificationItem[] = [];
    try {
      const saved = localStorage.getItem('mindhub_user_notifications');
      if (saved) {
        const parsed = JSON.parse(saved);
        localList = parsed.map((item: any) => ({
          id: item.id,
          type: item.type || 'payment',
          category: item.category || 'course',
          title: item.title || 'Thông báo mới',
          message: item.message || '',
          created_at: item.created_at,
          time_ago: item.time_ago || 'Vừa xong',
          is_read: Boolean(item.is_read || item.read_at),
          read_at: item.read_at,
          action_url: item.action_url || '/courses'
        }));
      }
    } catch (e) {}

    try {
      const res = await apiFetch<any>(`/notifications?status=${statusFilter}&type=${categoryFilter}`);
      const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
      
      const apiMapped: NotificationItem[] = list.map((item: any) => ({
        id: item.id,
        type: item.type || 'info',
        category: item.category || item.channel || 'system',
        title: item.title || 'Thông báo mới',
        message: item.message || '',
        created_at: item.created_at,
        time_ago: item.time_ago || 'Gần đây',
        is_read: Boolean(item.is_read || item.read_at),
        read_at: item.read_at,
        action_url: item.action_url || '/courses'
      }));

      const mergedMap = new Map();
      [...localList, ...apiMapped].forEach((n) => {
        if (n && n.id) mergedMap.set(String(n.id), n);
      });

      const combined = Array.from(mergedMap.values());
      setNotifications(combined);
    } catch (error) {
      setNotifications(localList);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const handleNotifUpdate = () => {
      fetchNotifications();
    };

    window.addEventListener('mindhub_notification_updated', handleNotifUpdate);
    window.addEventListener('storage', handleNotifUpdate);
    return () => {
      window.removeEventListener('mindhub_notification_updated', handleNotifUpdate);
      window.removeEventListener('storage', handleNotifUpdate);
    };
  }, [statusFilter, categoryFilter]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleMarkAllAsRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH' });
    } catch (e) {}

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    toast.success('Đã đánh dấu đọc tất cả thông báo');
  };

  const handleMarkAsRead = async (notif: NotificationItem) => {
    if (!notif.is_read) {
      try {
        await apiFetch(`/notifications/${notif.id}/read`, { method: 'PATCH' });
      } catch (e) {}

      setNotifications(prev =>
        prev.map(n => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    }

    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string | number) => {
    e.stopPropagation();
    try {
      await apiFetch(`/notifications/${id}`, { method: 'DELETE' });
    } catch (e) {}

    setNotifications(prev => prev.filter(n => n.id !== id));
    toast.success('Đã xóa thông báo');
  };

  const handleClearAll = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa tất cả thông báo không?')) return;
    try {
      await apiFetch('/notifications/clear-all', { method: 'DELETE' });
    } catch (e) {}

    setNotifications([]);
    toast.success('Đã xóa toàn bộ thông báo');
  };

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case 'challenge':
      case 'reminder':
        return {
          icon: <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />,
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-700',
          badge: 'bg-amber-100 text-amber-800'
        };
      case 'payment':
      case 'enrollment':
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700',
          badge: 'bg-emerald-100 text-emerald-800'
        };
      case 'assignment':
      case 'feedback':
        return {
          icon: <MessageSquare className="w-5 h-5 text-cyan-500" />,
          bg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-700',
          badge: 'bg-cyan-100 text-cyan-800'
        };
      case 'promo':
      case 'discount':
        return {
          icon: <Gift className="w-5 h-5 text-purple-500" />,
          bg: 'bg-purple-500/10 border-purple-500/20 text-purple-700',
          badge: 'bg-purple-100 text-purple-800'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-5 h-5 text-rose-500" />,
          bg: 'bg-rose-500/10 border-rose-500/20 text-rose-700',
          badge: 'bg-rose-100 text-rose-800'
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-indigo-500" />,
          bg: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-700',
          badge: 'bg-indigo-100 text-indigo-800'
        };
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesStatus = statusFilter === 'all' ? true : (statusFilter === 'unread' ? !n.is_read : n.is_read);
    const matchesCategory = categoryFilter === 'all' ? true : n.category === categoryFilter;
    const matchesSearch = !searchQuery.trim() || 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      n.message.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  return (
    <PageTransition>
      <div className="min-h-screen bg-slate-50/50 pb-16">
        
        {/* Header Hero Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white py-10 px-4 sm:px-6 lg:px-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg">
                  <Bell className="w-7 h-7 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Trung tâm Thông báo
                    </h1>
                    {unreadCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-white animate-pulse shadow">
                        {unreadCount} chưa đọc
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium">
                    Cập nhật tiến độ học tập, kết quả bài tập & ưu đãi độc quyền dành cho bạn.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-extrabold flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
                  >
                    <CheckCheck className="w-4 h-4 text-emerald-300" />
                    <span>Đánh dấu đọc tất cả</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-extrabold transition-all cursor-pointer"
                    title="Xóa tất cả thông báo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6 text-left">
          
          {/* Controls Bar: Search & Filters */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto no-scrollbar">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả ({notifications.length})
              </button>

              <button
                onClick={() => setStatusFilter('unread')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  statusFilter === 'unread'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>Chưa đọc</span>
                {unreadCount > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    statusFilter === 'unread' ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setStatusFilter('read')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  statusFilter === 'read'
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Đã đọc
              </button>
            </div>

            {/* Search Input Box */}
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm thông báo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

          </div>

          {/* Notifications List Stream */}
          {loading ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
              <p className="text-xs font-semibold">Đang tải thông báo từ hệ thống...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-extrabold text-slate-800">Không có thông báo nào</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  {searchQuery ? `Không tìm thấy thông báo nào khớp với từ khóa "${searchQuery}".` : 'Bạn đã xem hết tất cả thông báo. Chúng tôi sẽ cập nhật khi có tin tức mới.'}
                </p>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notif) => {
                const styles = getNotificationStyles(notif.type);
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif)}
                    className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                      notif.is_read
                        ? 'bg-white border-slate-200/80 hover:border-slate-300 hover:shadow-md'
                        : 'bg-emerald-50/40 border-emerald-300/80 shadow-md hover:bg-emerald-50/80'
                    }`}
                  >
                    {/* Left Icon Badge */}
                    <div className={`p-3 rounded-2xl shrink-0 ${styles.bg}`}>
                      {styles.icon}
                    </div>

                    {/* Notification Main Info */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className={`text-sm font-extrabold leading-snug ${notif.is_read ? 'text-slate-800' : 'text-slate-900 font-black'}`}>
                          {notif.title}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-400 shrink-0">
                          {notif.time_ago}
                        </span>
                      </div>

                      <p className={`text-xs mt-1 leading-relaxed ${notif.is_read ? 'text-slate-600' : 'text-slate-700 font-medium'}`}>
                        {notif.message}
                      </p>

                      {notif.action_url && (
                        <div className="mt-2.5 flex items-center gap-1 text-[11px] font-bold text-emerald-600 group-hover:text-emerald-700">
                          <span>Xem chi tiết</span>
                          <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      )}
                    </div>

                    {/* Right Unread Dot Indicator */}
                    {!notif.is_read && (
                      <div className="shrink-0 self-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
                      </div>
                    )}

                    {/* Delete Icon Button (Visible on Hover) */}
                    <button
                      onClick={(e) => handleDeleteNotification(e, notif.id)}
                      className="absolute right-3 top-3 p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                      title="Xóa thông báo"
                    >
                      <X className="w-4 h-4" />
                    </button>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>
    </PageTransition>
  );
}
