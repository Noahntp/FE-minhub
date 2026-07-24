import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Bell, LogOut, Settings, User, Calendar } from "lucide-react";
import { useApp } from "@/app/AppContext";

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
        </nav>

        {/* Search */}
        <div className="flex-1 flex justify-center px-4 md:px-6">
          <form 
            className="relative w-full max-w-[400px]"
            onSubmit={(e) => {
              e.preventDefault();
              if (searchQuery.trim()) {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
              }
            }}
          >
             <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input 
               placeholder="Tìm kiếm khoá học, giảng viên..."
               className="w-full bg-muted shadow-none appearance-none pl-9 rounded-full h-10 border-transparent focus-visible:ring-primary/20 focus-visible:border-primary/50 transition-all"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </form>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 md:gap-2 ml-auto shrink-0">
          {isLoggedIn ? (
            <>
              <Link to="/my-courses" className="text-sm font-bold text-muted-foreground hover:text-primary transition-colors hidden lg:block mr-2">Khóa học của tôi</Link>
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
                      className="w-8 h-8 rounded-full border"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    <User className="mr-2 h-4 w-4" />
                    Hồ sơ
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
