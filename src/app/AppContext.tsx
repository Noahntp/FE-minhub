import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as UserType, Course, Notification, Order, Banner } from '@/shared/types';
import { INITIAL_USER, INITIAL_BANNERS, INITIAL_COURSES } from '@/shared/data';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { ApiService } from '@/services/api';
import { apiFetch } from '@/shared/lib/api-client';

interface AppContextType {
  currentUser: UserType;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserType>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  courses: Course[];
  setCourses: React.Dispatch<React.SetStateAction<Course[]>>;
  favorites: string[];
  setFavorites: React.Dispatch<React.SetStateAction<string[]>>;
  cart: string[];
  setCart: React.Dispatch<React.SetStateAction<string[]>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  enrolledCourseIds: string[];
  setEnrolledCourseIds: React.Dispatch<React.SetStateAction<string[]>>;
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  banners: Banner[];
  setBanners: React.Dispatch<React.SetStateAction<Banner[]>>;
  
  // Audio state
  isPlayingMusic: boolean;
  setIsPlayingMusic: React.Dispatch<React.SetStateAction<boolean>>;
  musicVolume: number;
  setMusicVolume: React.Dispatch<React.SetStateAction<number>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserType>(() => {
    try {
      const stored = localStorage.getItem('mindhub_current_user');
      if (stored) return JSON.parse(stored);
    } catch (e) {}
    return INITIAL_USER;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('mindhub_is_logged_in');
      return stored === null || stored === 'undefined' || stored === 'null'
        ? true
        : stored === 'true';
    } catch (e) {
      return true;
    }
  });

  // Fetch fresh profile from Backend database on app mount/reload if token exists
  useEffect(() => {
    const token = localStorage.getItem('mindhub_api_token');
    if (token) {
      apiFetch<any>('/users/me')
        .then(res => {
          const profileData = res?.data || res;
          if (profileData) {
            setCurrentUser(prev => {
              const updated = {
                ...prev,
                id: profileData.id || prev?.id,
                name: profileData.full_name || profileData.name || prev?.name,
                full_name: profileData.full_name || profileData.name || prev?.full_name,
                email: profileData.email || prev?.email,
                phone: profileData.phone ?? prev?.phone,
                bio: profileData.bio ?? prev?.bio,
                expertise: profileData.expertise ?? prev?.expertise,
                avatar: profileData.avatar_url || profileData.avatar || prev?.avatar,
                avatar_url: profileData.avatar_url || profileData.avatar || prev?.avatar_url,
                role: profileData.role || prev?.role
              };
              if (JSON.stringify(updated) === JSON.stringify(prev)) {
                return prev;
              }
              try {
                localStorage.setItem('mindhub_current_user', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
          }
        })
        .catch(err => {
          console.warn('Could not fetch fresh user profile on app load:', err);
        });
    }
  }, []);

  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('mindhub_enrolled_courses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('mindhub_enrolled_courses', JSON.stringify(enrolledCourseIds));
    } catch (e) {}
  }, [enrolledCourseIds]);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);

  // Audio State
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.25);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoggedIn,
        setIsLoggedIn,
        courses,
        setCourses,
        favorites,
        setFavorites,
        cart,
        setCart,
        notifications,
        setNotifications,
        enrolledCourseIds,
        setEnrolledCourseIds,
        orders,
        setOrders,
        banners,
        setBanners,
        isPlayingMusic,
        setIsPlayingMusic,
        musicVolume,
        setMusicVolume
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
