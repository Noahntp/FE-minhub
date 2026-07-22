import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as UserType, Course, Notification, Order, Banner } from '@/shared/types';
import { INITIAL_USER, INITIAL_BANNERS } from '@/shared/data';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';

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

  const [courses, setCourses] = useState<Course[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
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
