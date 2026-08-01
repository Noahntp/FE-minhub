import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScreens from './components/AuthScreens';
import { User } from '@/shared/types';
import { useApp } from '@/app/AppContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { setCurrentUser, setIsLoggedIn } = useApp();

  const handleLoginSuccess = (user: User) => {
    // Update global context state
    setCurrentUser(user);
    setIsLoggedIn(true);
    // Also save to localStorage just in case context initialization misses it
    localStorage.setItem('mindhub_current_user', JSON.stringify(user));
    localStorage.setItem('mindhub_is_logged_in', 'true');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <AuthScreens 
        onLoginSuccess={handleLoginSuccess}
        onClose={() => navigate('/')}
        initialMode="register"
        navigateTo={(path) => {
          navigate(path);
        }}
      />
    </div>
  );
}
