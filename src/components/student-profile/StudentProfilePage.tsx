import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { StudentProfileHeader } from './StudentProfileHeader';
import { StudentAvatarCard } from './StudentAvatarCard';
import { StudentStreakCard } from './StudentStreakCard';
import { StudentPersonalInfoCard } from './StudentPersonalInfoCard';
import { StudentAccountStatusCard } from './StudentAccountStatusCard';
import { StudentInstructorWorkspaceCard } from './StudentInstructorWorkspaceCard';
import { StudentSecurityCard } from './StudentSecurityCard';

import { resolveMediaUrl } from '@/shared/utils/format';

interface StudentProfilePageProps {
  currentUser: any;
  onUpdateUser?: (updated: any) => void;
  navigateTo?: (route: string) => void;
  onLogout?: () => void;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = ({
  currentUser,
  onUpdateUser,
  navigateTo,
  onLogout
}) => {
  const [userState, setUserState] = useState(currentUser);
  const [toast, setToast] = useState<{ message: string; type?: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (currentUser && JSON.stringify(currentUser) !== JSON.stringify(userState)) {
      setUserState(currentUser);
    }
  }, [currentUser]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleProfileUpdated = (updatedUser: any) => {
    setUserState(updatedUser);
    try {
      localStorage.setItem('mindhub_current_user', JSON.stringify(updatedUser));
    } catch (e) {}
    if (onUpdateUser) {
      onUpdateUser(updatedUser);
    }
  };

  const handleAvatarUpdated = (newAvatarUrl: string | null) => {
    const resolved = newAvatarUrl ? resolveMediaUrl(newAvatarUrl) : null;
    const updated = {
      ...userState,
      avatar: resolved,
      avatar_url: resolved,
      avatarUrl: resolved
    };
    setUserState(updated);
    try {
      localStorage.setItem('mindhub_current_user', JSON.stringify(updated));
    } catch (e) {}
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
  };

  return (
    <div className="w-full text-left relative pb-16 font-sans bg-slate-50/60 min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Floating Toast Notification */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300 border text-white ${
          toast.type === 'error' ? 'bg-rose-950 border-rose-800' : 'bg-slate-900 border-slate-700'
        }`}>
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span className="text-xs font-bold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <StudentProfileHeader
        status={userState?.status}
        role={userState?.role}
        onNavigateTo={navigateTo}
      />

      {/* Instructor Workspace Prompt (ONLY rendered if user has instructor role) */}
      <StudentInstructorWorkspaceCard
        currentUser={userState}
        onNavigateTo={navigateTo}
      />

      {/* Main Grid Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Avatar & Account Verification) */}
        <div className="lg:col-span-5 w-full space-y-6">
          <StudentAvatarCard
            currentAvatarUrl={userState?.avatarUrl || userState?.avatar_url || userState?.avatar}
            userName={userState?.name || userState?.full_name}
            userEmail={userState?.email}
            onAvatarUpdated={handleAvatarUpdated}
            showToast={showToast}
          />

          <StudentStreakCard
            currentStreak={userState?.streak_count ?? 0}
            longestStreak={userState?.longest_streak ?? 0}
            totalActiveDays={userState?.total_active_days ?? 0}
          />

          <StudentAccountStatusCard
            currentUser={userState}
            showToast={showToast}
          />
        </div>

        {/* Right Column (Personal Details & Security) */}
        <div className="lg:col-span-7 w-full space-y-6">
          <StudentPersonalInfoCard
            currentUser={userState}
            onProfileUpdated={handleProfileUpdated}
            showToast={showToast}
          />

          <StudentSecurityCard
            currentUser={userState}
            showToast={showToast}
          />
        </div>
      </div>
    </div>
  );
};

export default StudentProfilePage;
