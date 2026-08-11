import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, LogOut, Settings, User, Heart, BookOpen, HelpCircle, CheckCheck, ArrowRight, Sparkles } from "lucide-react";
import { useApp } from "@/app/AppContext";
import { apiFetch } from "@/shared/lib/api-client";
import { resolveMediaUrl } from "@/shared/utils/format";

// Try to use shadcn if available, otherwise fallback to native tags for now
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, isLoggedIn, setIsLoggedIn, enrolledCourseIds = [] } = useApp();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Notification Bell Dropdown State
  const [navNotifications, setNavNotifications] = useState<any[]>([]);
  const [navUnreadCount, setNavUnreadCount] = useState<number>(0);
  const [hasEnrolledCourses, setHasEnrolledCourses] = useState<boolean>(false);

  const fetchNavNotifications = async () => {
    const token = localStorage.getItem('mindhub_api_token');

    if (token) {
      try {
        const [notifRes, courseRes] = await Promise.all([
          apiFetch<any>('/notifications').catch(() => []),
          apiFetch<any>('/me/courses').catch(() => [])
        ]);

        const apiList = Array.isArray(notifRes?.data) ? notifRes.data : (Array.isArray(notifRes) ? notifRes : []);
        setNavNotifications(apiList);
        setNavUnreadCount(apiList.filter((n: any) => !n.is_read && !n.read_at).length);

        const courseList = Array.isArray(courseRes?.data) ? courseRes.data : (Array.isArray(courseRes) ? courseRes : []);
        setHasEnrolledCourses(courseList.length > 0);
        return;
      } catch (e) {
        console.warn('Navbar notification API fetch error:', e);
      }
    }

    let localList: any[] = [];
    try {
      const saved = localStorage.getItem('mindhub_user_notifications');
      if (saved) localList = JSON.parse(saved);
    } catch (e) {}

    setNavNotifications(localList);
    setNavUnreadCount(localList.filter((n: any) => !n.is_read && !n.read_at).length);
    setHasEnrolledCourses(enrolledCourseIds.length > 0 || localList.length > 0);
  };

  useEffect(() => {
    fetchNavNotifications();

    const handleNotifUpdate = () => {
      fetchNavNotifications();
    };

    window.addEventListener('mindhub_notification_updated', handleNotifUpdate);
    window.addEventListener('storage', handleNotifUpdate);
    return () => {
      window.removeEventListener('mindhub_notification_updated', handleNotifUpdate);
      window.removeEventListener('storage', handleNotifUpdate);
    };
  }, [isLoggedIn, location.pathname]);

  const handleMarkAllNavAsRead = async () => {
    try {
      await apiFetch('/notifications/read-all', { method: 'PATCH' });
    } catch (e) {}
    setNavNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
    setNavUnreadCount(0);
  };

  const handleNavNotifClick = async (notif: any) => {
    if (!notif.is_read) {
      try {
        await apiFetch(`/notifications/${notif.id}/read`, { method: 'PATCH' });
      } catch (e) {}
      setNavNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, is_read: true } : n));
      setNavUnreadCount(prev => Math.max(0, prev - 1));
    }
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  // Sync searchQuery with URL q param if on /search page
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const qParam = params.get('q');
    if (location.pathname === '/search' && qParam) {
      setSearchQuery(qParam);
    }
  }, [location]);

  // Live search suggestions fetch
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    let isMounted = true;
    setIsSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await apiFetch<any>(`/courses?search=${encodeURIComponent(searchQuery)}`);
        const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
        if (isMounted) {
          const q = searchQuery.toLowerCase();
          const filtered = list.filter((c: any) =>
            (c.title || '').toLowerCase().includes(q) ||
            (c.instructor?.full_name || '').toLowerCase().includes(q)
          );
          setSuggestions(filtered.slice(0, 5));
        }
      } catch (err) {
        if (isMounted) setSuggestions([]);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem("access_token");
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const rawAvatar = currentUser?.avatar_url || currentUser?.avatar;
  const avatarUrl = rawAvatar ? resolveMediaUrl(rawAvatar) : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4 md:px-8 max-w-7xl mx-auto gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 shrink-0">
          <img 
            src="/mindhub-logo.png" 
            alt="MindHub Logo" 
            className="h-11 md:h-12 w-auto object-contain py-1" 
          />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-extrabold mx-4">
          <Link to="/courses" className="text-slate-600 hover:text-emerald-600 transition-colors">Khóa học</Link>
          <Link to="/roadmaps" className="text-slate-600 hover:text-emerald-600 transition-colors">Lộ trình</Link>
          <Link to="/instructors" className="text-slate-600 hover:text-emerald-600 transition-colors">Giảng viên</Link>
          <Link to="/services" className="text-slate-600 hover:text-emerald-600 transition-colors">Dịch vụ</Link>
          <Link to="/faq" className="text-slate-600 hover:text-emerald-600 transition-colors">Hỏi đáp</Link>
        </nav>

        {/* Global Live Search Bar */}
        <div className="flex-1 max-w-md hidden sm:block relative">
           <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setIsSearchFocused(false);
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
          >
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-10" />
             <Input 
               placeholder="Tìm kiếm khoá học, giảng viên..."
               className="w-full bg-slate-100/80 shadow-none appearance-none pl-9 rounded-full h-10 border-transparent focus-visible:ring-2 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/50 transition-all text-xs font-semibold placeholder:text-slate-400"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               onFocus={() => setIsSearchFocused(true)}
               onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
             />

             {/* Live Search Suggestions Dropdown */}
             {isSearchFocused && searchQuery.trim().length > 0 && (
               <div className="absolute top-12 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden z-50 text-left p-2 space-y-1">
                 <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                   Gợi ý tìm kiếm ({suggestions.length})
                 </div>
                 
                 {isSearching ? (
                   <div className="px-4 py-3 text-xs text-slate-400 italic flex items-center gap-2">
                     <span className="w-3 h-3 rounded-full border-2 border-slate-400 border-t-transparent animate-spin" />
                     <span>Đang tìm kiếm...</span>
                   </div>
                 ) : suggestions.length > 0 ? (
                   suggestions.map((item: any) => (
                     <div
                       key={item.id || item.slug}
                       onMouseDown={() => {
                         setIsSearchFocused(false);
                         navigate(`/courses/${item.slug || item.id}`);
                       }}
                       className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                     >
                       <img
                         src={item.thumbnail_url || item.thumbnail || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=150&q=80'}
                         alt={item.title}
                         className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                       />
                       <div className="min-w-0 flex-1">
                         <div className="text-xs font-bold text-slate-900 truncate">{item.title}</div>
                         <div className="text-[11px] text-slate-400 truncate">
                           {item.instructor?.full_name || 'Giảng viên MindHub'} • {item.price ? `${Number(item.price).toLocaleString('vi-VN')}đ` : 'Miễn phí'}
                         </div>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="px-4 py-3 text-xs text-slate-500 italic">
                     Không tìm thấy kết quả cho "{searchQuery}"
                   </div>
                 )}

                 <button
                   type="button"
                   onMouseDown={() => {
                     setIsSearchFocused(false);
                     navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
                   }}
                   className="w-full text-center py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors border-t border-slate-100 cursor-pointer"
                 >
                   Xem tất cả kết quả cho "{searchQuery}" →
                 </button>
               </div>
             )}
          </form>
        </div>

        {/* Premium Actions Bar */}
        <div className="flex items-center gap-2.5 ml-auto shrink-0">
          {isLoggedIn ? (
            <>
              {/* My Courses Link - Only display "Khóa học của tôi" if account has purchased courses */}
              {hasEnrolledCourses ? (
                <Link
                  to="/my-courses"
                  className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-50/90 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs border border-emerald-200/80 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Khóa học của tôi</span>
                </Link>
              ) : (
                <Link
                  to="/courses"
                  className="hidden lg:inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-95"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Khám phá khóa học</span>
                </Link>
              )}
              
              {/* Favorites Heart Button */}
              <Link
                to="/favorites"
                className="w-9 h-9 rounded-2xl bg-rose-50/90 hover:bg-rose-100 text-rose-600 border border-rose-200/80 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                title="Khóa học yêu thích"
              >
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
              </Link>

              {/* Notification Bell Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="w-9 h-9 rounded-2xl bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 border border-slate-200/80 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm relative cursor-pointer focus:outline-none"
                    title="Thông báo"
                  >
                    <Bell className="w-4 h-4 text-slate-600" />
                    {navUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[10px] font-black bg-rose-500 text-white rounded-full border-2 border-white shadow-sm animate-pulse">
                        {navUnreadCount > 9 ? '9+' : navUnreadCount}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80 sm:w-96 p-0 rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden text-left">
                  {/* Dropdown Header */}
                  <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-emerald-400" />
                      <span className="font-extrabold text-xs">Thông báo mới</span>
                      {navUnreadCount > 0 && (
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                          {navUnreadCount} chưa đọc
                        </span>
                      )}
                    </div>
                    {navUnreadCount > 0 && (
                      <button
                        onClick={handleMarkAllNavAsRead}
                        className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-3.5 h-3.5" />
                        <span>Đã đọc tất cả</span>
                      </button>
                    )}
                  </div>

                  {/* Dropdown Items List */}
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 bg-white">
                    {navNotifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500 space-y-1.5">
                        <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-700">Chưa có thông báo mới</p>
                        <p className="text-[11px] text-slate-400">Bạn chưa đăng ký khóa học nào. Hãy đăng ký khóa học để nhận thông báo mới!</p>
                      </div>
                    ) : (
                      navNotifications.slice(0, 5).map((n) => (
                        <DropdownMenuItem
                          key={n.id}
                          onClick={() => handleNavNotifClick(n)}
                          className={`p-3 text-xs flex items-start gap-3 hover:bg-slate-50 focus:bg-slate-50 transition-colors cursor-pointer outline-none ${
                            !n.is_read ? 'bg-emerald-50/40 font-semibold' : 'opacity-80'
                          }`}
                        >
                          <div className="p-2 rounded-xl bg-slate-100 text-emerald-600 shrink-0 mt-0.5">
                            <Sparkles className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 truncate">{n.title}</div>
                            <div className="text-slate-600 text-[11px] line-clamp-2 mt-0.5">{n.message}</div>
                            <div className="text-[10px] text-slate-400 mt-1 font-mono">{n.time_ago || 'Vừa xong'}</div>
                          </div>
                          {!n.is_read && (
                            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          )}
                        </DropdownMenuItem>
                      ))
                    )}
                  </div>

                  {/* Dropdown Footer Link */}
                  <div className="p-1 bg-slate-50 border-t border-slate-100 text-center">
                    <DropdownMenuItem
                      onClick={() => navigate('/notifications')}
                      className="w-full text-xs font-extrabold text-emerald-600 hover:text-emerald-700 focus:bg-emerald-50 justify-center gap-1 py-2 cursor-pointer outline-none rounded-xl"
                    >
                      <span>Xem tất cả thông báo</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-0.5 rounded-full ring-2 ring-emerald-500/20 hover:ring-emerald-500 transition-all duration-200 hover:scale-105 active:scale-95 shadow-md cursor-pointer focus:outline-none ml-1">
                    <img 
                      src={avatarUrl} 
                      alt="Avatar" 
                      className="w-9 h-9 rounded-full object-cover bg-slate-100"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80';
                      }}
                    />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border border-slate-200/80 shadow-2xl space-y-1">
                  <DropdownMenuLabel className="p-3 bg-slate-50/80 rounded-xl mb-1 border border-slate-100">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-xs font-black text-slate-900 truncate">{currentUser?.full_name || currentUser?.name || 'Tài khoản'}</p>
                      {currentUser?.email && (
                        <p className="text-[11px] text-slate-500 font-semibold truncate">{currentUser.email}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  
                  <DropdownMenuItem onClick={() => navigate("/profile")} className="p-2.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-100">
                    <User className="mr-2.5 h-4 w-4 text-emerald-600" />
                    Hồ sơ cá nhân
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/favorites")} className="p-2.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-rose-50 text-rose-700">
                    <Heart className="mr-2.5 h-4 w-4 text-rose-500 fill-rose-500" />
                    Khóa học yêu thích
                  </DropdownMenuItem>

                  {hasEnrolledCourses ? (
                    <DropdownMenuItem onClick={() => navigate("/my-courses")} className="p-2.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-100">
                      <BookOpen className="mr-2.5 h-4 w-4 text-emerald-600" />
                      Khóa học của tôi
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => navigate("/courses")} className="p-2.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-emerald-50 text-emerald-700 font-extrabold">
                      <Sparkles className="mr-2.5 h-4 w-4 text-emerald-600" />
                      Khám phá khóa học
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={() => navigate("/faq")} className="p-2.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-100">
                    <HelpCircle className="mr-2.5 h-4 w-4 text-teal-600" />
                    Hỏi đáp (FAQ)
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={() => navigate("/settings")} className="p-2.5 rounded-xl font-bold text-xs cursor-pointer hover:bg-slate-100">
                    <Settings className="mr-2.5 h-4 w-4 text-slate-600" />
                    Cài đặt
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="my-1 border-slate-100" />

                  <DropdownMenuItem className="p-2.5 rounded-xl font-bold text-xs text-rose-600 hover:bg-rose-50 cursor-pointer" onClick={handleLogout}>
                    <LogOut className="mr-2.5 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")} className="rounded-full text-xs font-bold hover:bg-slate-100">
                Đăng nhập
              </Button>
              <Button onClick={() => navigate("/register")} className="rounded-full px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20">
                Đăng ký
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
