import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthScreens from '@/components/AuthScreens';
import { User } from '@/types';

export default function RegisterPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = (user: User) => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <AuthScreens 
        onLoginSuccess={handleLoginSuccess}
        onClose={() => navigate('/')}
        initialMode="register"
        navigateTo={(path) => {
          if (path === 'login') navigate('/login');
          // Add other mappings if needed
        }}
      />
    </div>
  );
}
