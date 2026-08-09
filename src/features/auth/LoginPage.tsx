import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthScreens from './components/AuthScreens';
import { User } from '@/shared/types';
import { useApp } from '@/app/AppContext';
import { getDashboardRouteByRole } from '@/router/routes';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentUser, setIsLoggedIn } = useApp();

  const isVerified = searchParams.get('verified') === '1';
  const verifyError = searchParams.get('verified') === '0';

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    localStorage.setItem('mindhub_current_user', JSON.stringify(user));
    localStorage.setItem('mindhub_is_logged_in', 'true');
    const targetPath = getDashboardRouteByRole(user.role);
    navigate(targetPath, { replace: true });
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <AuthScreens 
        onLoginSuccess={handleLoginSuccess}
        onClose={() => navigate('/')}
        initialMode="login"
        initialSuccessMsg={isVerified ? 'Xác thực email thành công! Tài khoản của bạn đã được kích hoạt. Vui lòng đăng nhập.' : undefined}
        initialErrorMsg={verifyError ? 'Link xác thực email không hợp lệ hoặc đã hết hạn.' : undefined}
        navigateTo={(path) => {
          const target = path.startsWith('/') ? path : `/${path}`;
          navigate(target, { replace: true });
        }}
      />
    </div>
  );
}
