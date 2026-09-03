import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as UserType, Course, Notification, Order, Banner } from '@/shared/types';
import { INITIAL_USER, INITIAL_BANNERS, INITIAL_COURSES } from '@/shared/data';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { ApiService } from '@/services/api';
import { apiFetch } from '@/shared/lib/api-client';

export interface TrialLessonItem {
  id: string | number;
  title: string;
  duration?: string;
  videoUrl?: string;
  courseTitle?: string;
  courseId?: string | number;
  instructorName?: string;
}

interface AppContextType {
  currentUser: UserType;
  setCurrentUser: React.Dispatch<React.SetStateAction<UserType>>;
  isLoggedIn: boolean;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  isInitializingAuth: boolean;
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

  // Trial Preview Modal State
  trialModalOpen: boolean;
  setTrialModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeTrialLesson: TrialLessonItem | null;
  setActiveTrialLesson: React.Dispatch<React.SetStateAction<TrialLessonItem | null>>;
  openTrialModal: (lesson?: Partial<TrialLessonItem>) => void;
  closeTrialModal: () => void;

  // AI Roadmap Modal State
  aiModalOpen: boolean;
  setAiModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openAiModal: () => void;
  closeAiModal: () => void;
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
      const token = localStorage.getItem('mindhub_api_token') || localStorage.getItem('token');
      return stored === 'true' && !!token;
    } catch (e) {
      return false;
    }
  });

  const [isInitializingAuth, setIsInitializingAuth] = useState<boolean>(true);

  // Fetch fresh profile from Backend database on app mount/reload if token exists
  useEffect(() => {
    const token = localStorage.getItem('mindhub_api_token') || localStorage.getItem('token');
    if (token) {
      apiFetch<any>('/users/me')
        .then(res => {
          const profileData = res?.data || res;
          if (profileData) {
            const role = profileData.role || 'learner';
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
                role: role
              };
              if (JSON.stringify(updated) === JSON.stringify(prev)) {
                return prev;
              }
              try {
                localStorage.setItem('mindhub_current_user', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            });
            setIsLoggedIn(true);
            localStorage.setItem('mindhub_is_logged_in', 'true');

            // Only fetch learner courses if user is a learner
            if (role === 'learner' || role === 'student') {
              apiFetch<any>('/me/courses')
                .then((courseRes) => {
                  const list = Array.isArray(courseRes) ? courseRes : (courseRes?.data || []);
                  if (Array.isArray(list)) {
                    const ids = list
                      .flatMap((item: any) => [
                        item.course_id,
                        item.course?.id,
                        item.course?.slug,
                      ])
                      .filter(Boolean)
                      .map(String);
                    if (ids.length > 0) {
                      setEnrolledCourseIds((prev) => Array.from(new Set([...prev, ...ids])));
                    }
                  }
                })
                .catch(() => {});
            }
          }
        })
        .catch(err => {
          console.warn('Could not fetch fresh user profile on app load:', err);
          setIsLoggedIn(false);
          setCurrentUser(INITIAL_USER);
          setEnrolledCourseIds([]);
          localStorage.removeItem('mindhub_api_token');
          localStorage.removeItem('token');
          localStorage.removeItem('mindhub_is_logged_in');
          localStorage.removeItem('mindhub_current_user');
          localStorage.removeItem('mindhub_enrolled_courses');
        })
        .finally(() => {
          setIsInitializingAuth(false);
        });
    } else {
      setIsLoggedIn(false);
      setIsInitializingAuth(false);
      setEnrolledCourseIds([]);
      localStorage.removeItem('mindhub_enrolled_courses');
    }
  }, []);

  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>(() => {
    try {
      const storedToken = localStorage.getItem('mindhub_api_token') || localStorage.getItem('token');
      const isLogged = localStorage.getItem('mindhub_is_logged_in') === 'true' && !!storedToken;
      if (!isLogged) return [];
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
      if (isLoggedIn) {
        localStorage.setItem('mindhub_enrolled_courses', JSON.stringify(enrolledCourseIds));
      } else {
        localStorage.removeItem('mindhub_enrolled_courses');
      }
    } catch (e) {}
  }, [enrolledCourseIds, isLoggedIn]);
  const [banners, setBanners] = useState<Banner[]>(INITIAL_BANNERS);

  // Audio State
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [musicVolume, setMusicVolume] = useState<number>(0.25);

  // Trial Preview Modal State
  const [trialModalOpen, setTrialModalOpen] = useState<boolean>(false);
  const [activeTrialLesson, setActiveTrialLesson] = useState<TrialLessonItem | null>(null);

  const openTrialModal = (lesson?: Partial<TrialLessonItem>) => {
    if (lesson && lesson.title) {
      setActiveTrialLesson({
        id: lesson.id || 'trial-custom',
        title: lesson.title,
        duration: lesson.duration || '12:00',
        videoUrl: lesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        courseTitle: lesson.courseTitle || 'Khóa học xem thử',
        courseId: lesson.courseId,
        instructorName: lesson.instructorName,
      });
    } else {
      setActiveTrialLesson(null);
    }
    setTrialModalOpen(true);
  };

  const closeTrialModal = () => {
    setTrialModalOpen(false);
  };

  // AI Roadmap Modal State
  const [aiModalOpen, setAiModalOpen] = useState<boolean>(false);

  const openAiModal = () => {
    setAiModalOpen(true);
  };

  const closeAiModal = () => {
    setAiModalOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoggedIn,
        setIsLoggedIn,
        isInitializingAuth,
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
        setMusicVolume,
        trialModalOpen,
        setTrialModalOpen,
        activeTrialLesson,
        setActiveTrialLesson,
        openTrialModal,
        closeTrialModal,
        aiModalOpen,
        setAiModalOpen,
        openAiModal,
        closeAiModal
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
