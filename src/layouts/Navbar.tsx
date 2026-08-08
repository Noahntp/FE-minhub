import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, LogOut, Settings, User, Calendar, Heart, BookOpen } from "lucide-react";
import { useApp } from "@/app/AppContext";
import { apiFetch } from "@/shared/lib/api-client";

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
  const { currentUser, isLoggedIn, setIsLoggedIn } = useApp();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

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
    navigate("/");
  };
  
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img src="/header-logo.png" alt="MindHub" className="h-7 sm:h-8 w-auto object-contain" />
        </Link>
        
        <nav className="hidden lg:flex items-center gap-6 ml-6">
          <Link to="/courses" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Khám phá</Link>
          <Link to="/roadmaps" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Lộ trình</Link>
          <Link to="/services" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors">Dịch vụ</Link>
        </nav>

        {/* Search */}
        <div className="flex-1 flex justify-center px-4 md:px-6 relative">
          <form 
            className="relative w-full max-w-[400px]"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                setIsSearchFocused(false);
                navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
              }
            }}
          >
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground z-10" />
             <Input 
               placeholder="Tìm kiếm khoá học, giảng viên..."
               className="w-full bg-muted shadow-none appearance-none pl-9 rounded-full h-10 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
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
                   className="w-full text-center py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border-t border-slate-100 cursor-pointer"
                 >
                   Xem tất cả kết quả cho "{searchQuery}" →
                 </button>
               </div>
             )}
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto shrink-0">
          {isLoggedIn ? (
            <>
              <Link to="/my-courses" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors hidden lg:block mr-2">Khóa học của tôi</Link>
              
              {/* Favorites Heart Icon Quick Link */}
              <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-rose-500 transition-colors" title="Khóa học yêu thích">
                <Link to="/favorites">
                  <Heart className="h-5 w-5 text-rose-500 fill-rose-500/20" />
                </Link>
              </Button>

              <Button asChild variant="ghost" size="icon" className="text-muted-foreground relative">
                <Link to="/notifications">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-background"></span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <img 
                      src={currentUser?.avatar || "https://i.pravatar.cc/150?u=a042581f4e29026704d"} 
                      alt="Avatar" 
                      className="w-8 h-8 rounded-full border object-cover"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-semibold leading-none text-slate-900">{currentUser?.full_name || currentUser?.name || 'Tài khoản'}</p>
                      {currentUser?.email && (
                        <p className="text-xs leading-none text-slate-500 font-normal">{currentUser.email}</p>
                      )}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Hồ sơ cá nhân
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/favorites")}>
                    <Heart className="mr-2 h-4 w-4 text-rose-500 fill-rose-500" />
                    Khóa học yêu thích
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/my-courses")}>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Khóa học của tôi
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/calendar")}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Lịch học
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Cài đặt
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate("/login")}>Đăng nhập</Button>
              <Button onClick={() => navigate("/register")} className="rounded-full px-6">Đăng ký</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
