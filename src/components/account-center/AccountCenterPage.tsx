import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { ProfileHeader } from './ProfileHeader';
import { AccountSidebar, AccountTabKey } from './AccountSidebar';
import { AvatarSection } from './AvatarSection';
import { PersonalInformationCard } from './PersonalInformationCard';
import { AccountVerificationCard } from './AccountVerificationCard';
import { WorkspaceSwitcher } from './WorkspaceSwitcher';
import { ProfessionalProfileTab } from './ProfessionalProfileTab';
import { SecurityTab } from './SecurityTab';
import { RolesPermissionsTab } from './RolesPermissionsTab';
import { ApiService } from '../../services/api';
import { useApp } from '../../app/AppContext';

interface AccountCenterPageProps {
  currentUser: any;
  onUpdateUser?: (updated: any) => void;
  navigateTo?: (route: string) => void;
  onLogout?: () => void;
}

export const AccountCenterPage: React.FC<AccountCenterPageProps> = ({
  currentUser,
  onUpdateUser,
  navigateTo,
  onLogout
}) => {
  const { setCurrentUser } = useApp();

  // Parse initial active tab from URL query param if present
  const getTabFromUrl = (): AccountTabKey => {
    if (typeof window === 'undefined') return 'profile';
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab === 'professional' || tab === 'security' || tab === 'roles') return tab as AccountTabKey;
    return 'profile';
  };

  const [activeTab, setActiveTab] = useState<AccountTabKey>(getTabFromUrl());
  const [userState, setUserState] = useState(currentUser);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Sync prop changes
  useEffect(() => {
    if (currentUser && JSON.stringify(currentUser) !== JSON.stringify(userState)) {
      setUserState(currentUser);
    }
  }, [currentUser]);

  // Fetch latest profile from DB on component mount
  useEffect(() => {
    let isMounted = true;
    const fetchFreshProfile = async () => {
      try {
        const res = await ApiService.getInstructorProfile();
        const data = res?.data || res;
        if (data && isMounted) {
          const fresh = {
            ...userState,
            id: data.id || userState?.id,
            name: data.full_name || data.name || userState?.name,
            full_name: data.full_name || data.name || userState?.full_name,
            email: data.email || userState?.email,
            phone: data.phone ?? userState?.phone,
            bio: data.bio ?? userState?.bio,
            expertise: data.expertise ?? userState?.expertise,
            avatar: data.avatar_url || data.avatar || userState?.avatar,
            avatar_url: data.avatar_url || data.avatar || userState?.avatar_url,
            role: data.role || userState?.role
          };
          if (JSON.stringify(fresh) !== JSON.stringify(currentUser)) {
            setUserState(fresh);
            setCurrentUser(fresh);
            try {
              localStorage.setItem('mindhub_current_user', JSON.stringify(fresh));
            } catch (e) {}
            if (onUpdateUser) {
              onUpdateUser(fresh);
            }
          }
        }
      } catch (e) {
        /* fallback */
      }
    };

    fetchFreshProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync browser URL search params when tab changes
  const handleTabChange = (newTab: AccountTabKey) => {
    setActiveTab(newTab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('tab', newTab);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleProfileUpdated = (updatedUser: any) => {
    const normalized = {
      ...userState,
      ...updatedUser,
      name: updatedUser.full_name || updatedUser.name || userState?.name,
      full_name: updatedUser.full_name || updatedUser.name || userState?.full_name,
      avatar: updatedUser.avatar_url || updatedUser.avatar || userState?.avatar,
      avatar_url: updatedUser.avatar_url || updatedUser.avatar || userState?.avatar_url
    };
    setUserState(normalized);
    setCurrentUser(normalized);
    localStorage.setItem('mindhub_current_user', JSON.stringify(normalized));
    if (onUpdateUser) {
      onUpdateUser(normalized);
    }
  };

  const handleAvatarUpdated = (newAvatarUrl: string | null) => {
    const updated = {
      ...userState,
      avatar: newAvatarUrl,
      avatar_url: newAvatarUrl,
      avatarUrl: newAvatarUrl
    };
    setUserState(updated);
    setCurrentUser(updated);
    localStorage.setItem('mindhub_current_user', JSON.stringify(updated));
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
  };

  return (
    <div className="w-full text-left relative pb-12 font-sans bg-slate-50/40 min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Toast Overlay */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-300 border text-white ${
          toast.type === 'error' ? 'bg-red-950 border-red-800' : 'bg-[#121b4b] border-slate-700'
        }`}>
          <Sparkles className={`w-4 h-4 ${toast.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`} />
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <ProfileHeader status={userState?.status} role={userState?.role} onNavigateTo={navigateTo} />

      {/* Main 2-Column Layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Sticky Sidebar */}
        <AccountSidebar
          currentUser={userState}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          onLogout={onLogout}
        />

        {/* Right Main Content */}
        <main className="flex-1 w-full min-w-0">
          {/* TAB 1: Profile */}
          {activeTab === 'profile' && (
            <div>
              <AvatarSection
                currentAvatarUrl={userState?.avatarUrl || userState?.avatar_url || userState?.avatar}
                userName={userState?.name || userState?.full_name}
                onAvatarUpdated={handleAvatarUpdated}
                showToast={showToast}
              />

              <PersonalInformationCard
                currentUser={userState}
                onProfileUpdated={handleProfileUpdated}
                showToast={showToast}
              />

              <AccountVerificationCard
                currentUser={userState}
                showToast={showToast}
              />

              <WorkspaceSwitcher
                currentUser={userState}
                onNavigateTo={navigateTo}
              />
            </div>
          )}

          {/* TAB 2: Professional (Instructor) */}
          {activeTab === 'professional' && (
            <ProfessionalProfileTab
              currentUser={userState}
              onProfileUpdated={handleProfileUpdated}
              showToast={showToast}
            />
          )}

          {/* TAB 3: Security */}
          {activeTab === 'security' && (
            <SecurityTab
              currentUser={userState}
              showToast={showToast}
            />
          )}

          {/* TAB 4: Roles & Permissions */}
          {activeTab === 'roles' && (
            <RolesPermissionsTab
              currentUser={userState}
            />
          )}
        </main>
      </div>
    </div>
  );
};
