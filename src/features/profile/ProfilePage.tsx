import React from 'react';
import { User as UserType } from '@/shared/types';
import { StudentProfilePage } from '@/components/student-profile/StudentProfilePage';

interface ProfilePageProps {
  currentUser: UserType;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserType>>;
  navigateTo: (route: string) => void;
  onLogout?: () => void;
}

export function ProfilePage({ currentUser, setCurrentUser, navigateTo, onLogout }: ProfilePageProps) {
  return (
    <StudentProfilePage
      currentUser={currentUser}
      onUpdateUser={(updated) => setCurrentUser(updated)}
      navigateTo={navigateTo}
      onLogout={onLogout}
    />
  );
}

