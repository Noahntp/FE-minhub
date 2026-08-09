import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthScreens from './components/AuthScreens';
import { User } from '@/shared/types';
import { useApp } from '@/app/AppContext';
import { getDashboardRouteByRole } from '@/router/routes';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentUser, setIsLoggedIn } = useApp();

  const token = searchParams.get('token') || '';
  const email = searchParams.get('email') || '';

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
        initialMode="reset-password"
        initialEmail={email}
        initialToken={token}
        navigateTo={(path) => {
          const target = path.startsWith('/') ? path : `/${path}`;
          navigate(target, { replace: true });
        }}
      />
    </div>
  );
}
