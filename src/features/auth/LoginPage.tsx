import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScreens from './components/AuthScreens';
import { User } from '@/shared/types';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = (user: User) => {
    // Session token is already saved inside auth.service login method.
    // If we need to sync state or redirect:
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <AuthScreens 
        onLoginSuccess={handleLoginSuccess}
        onClose={() => navigate('/')}
        initialMode="login"
        navigateTo={(path) => {
          if (path === 'register') navigate('/register');
          // Add other mappings if needed
        }}
      />
    </div>
  );
}
