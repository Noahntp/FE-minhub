import React from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import AuthScreens from './components/AuthScreens';
import { User } from '@/shared/types';
import { useApp } from '@/app/AppContext';
import { getDashboardRouteByRole } from '@/router/routes';

export default function RegisterPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setCurrentUser, setIsLoggedIn } = useApp();

  const isInstructorRole = 
    searchParams.get('role') === 'instructor' || 
    location.pathname.includes('/instructor');

  const initialRole = isInstructorRole ? 'instructor' : 'student';

  const isVerifyEmail = 
    location.pathname.includes('/verify-email') || 
    searchParams.get('mode') === 'verify-email';

  const initialMode = isVerifyEmail ? 'verify-email' : 'register';

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
        initialMode={initialMode}
        initialRole={initialRole}
        navigateTo={(path) => {
          const target = path.startsWith('/') ? path : `/${path}`;
          navigate(target, { replace: true });
        }}
      />
    </div>
  );
}
