import React from 'react';
import { AccountCenterPage } from '../account-center/AccountCenterPage';

interface Props {
  currentUser: any;
  onUpdateUser?: (updated: any) => void;
  navigateTo?: (route: string) => void;
  onLogout?: () => void;
}

export default function InstructorProfilePage({ currentUser, onUpdateUser, navigateTo, onLogout }: Props) {
  return (
    <AccountCenterPage
      currentUser={currentUser}
      onUpdateUser={onUpdateUser}
      navigateTo={navigateTo}
      onLogout={onLogout}
    />
  );
}
