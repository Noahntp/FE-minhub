import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { apiFetch, setAuthToken } from '@/shared/lib/api-client';
import { toast } from 'sonner';
import { getDashboardRouteByRole } from '@/router/routes';

export default function GoogleCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setCurrentUser, setIsLoggedIn } = useApp();

  useEffect(() => {
    const status = searchParams.get('status');
    const token = searchParams.get('token');
    const errorMsg = searchParams.get('error') || searchParams.get('message');

    if (status === 'error' || errorMsg) {
      toast.error(errorMsg || 'Đăng nhập Google thất bại');
      navigate('/login', { replace: true });
      return;
    }

    if (token) {
      setAuthToken(token);
      localStorage.setItem('mindhub_api_token', token);
      localStorage.setItem('token', token);

      // Fetch logged-in user profile from Backend API
      apiFetch<any>('/auth/me')
        .catch(() => apiFetch<any>('/users/me'))
        .catch(() => apiFetch<any>('/account/profile'))
        .then((res) => {
          const u = res?.data?.user || res?.user || res?.data || res;
          const userObj = {
            id: String(u?.id || '1'),
            name: u?.full_name || u?.name || 'Học viên Google',
            full_name: u?.full_name || u?.name || 'Học viên Google',
            email: u?.email || '',
            avatar: u?.avatar_url || u?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
            avatar_url: u?.avatar_url || u?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
            role: (u?.role as any) || 'learner',
            streak: 1,
            lastActiveDate: new Date().toISOString().split('T')[0],
            interestedTopics: [],
            notificationSettings: {
              email: true,
              push: true,
              app: true,
              scheduleReminders: true,
            },
          };

          setCurrentUser(userObj as any);
          setIsLoggedIn(true);
          localStorage.setItem('mindhub_is_logged_in', 'true');
          localStorage.setItem('mindhub_current_user', JSON.stringify(userObj));

          toast.success('Đăng nhập bằng Google thành công!');
          const targetPath = getDashboardRouteByRole(userObj.role);
          navigate(targetPath, { replace: true });
        })
        .catch((err) => {
          console.error('Fetch user error after Google OAuth:', err);
          toast.error('Không thể lấy thông tin người dùng từ máy chủ.');
          navigate('/login', { replace: true });
        });
    } else {
      toast.error('Không tìm thấy token xác thực từ Google.');
      navigate('/login', { replace: true });
    }
  }, [searchParams, navigate, setCurrentUser, setIsLoggedIn]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto text-blue-600" />
        <h2 className="text-lg font-bold text-slate-800">Đang hoàn tất đăng nhập bằng Google...</h2>
        <p className="text-sm text-slate-500">Vui lòng chờ trong giây lát</p>
      </div>
    </div>
  );
}
