import { useState, useEffect, useCallback } from 'react';
import { Course, Lesson, StudentProgress } from '@/shared/types';
import { INITIAL_COURSES } from '@/shared/data';
import { useApp } from '@/app/AppContext';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { FALLBACK_COURSES_MAP } from '@/features/courses/hooks/useCourseDetail';
import { resolveCourseById } from '@/features/cart/CartAndCheckout';
import { classroomApi } from '../api';

export type TabType = 'overview' | 'qa' | 'notes' | 'resources';

export interface UseClassroomResult {
  course: Course | null;
  activeLesson: Lesson | null;
  progress: StudentProgress | null;
  isSidebarOpen: boolean;
  activeTab: TabType;
  isLoading: boolean;
  error: Error | null;
  toggleSidebar: () => void;
  selectLesson: (lessonId: string) => void;
  markAsCompleted: (lessonId: string) => void;
  toggleLessonCompletion: (lessonId: string, forceStatus?: boolean) => void;
  setTab: (tab: TabType) => void;
}

export function useClassroom(courseId: string | undefined): UseClassroomResult {
  const { courses } = useApp();
  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const timeout = setTimeout(() => {
      if (!isMounted) return;
      try {
        if (!courseId) throw new Error("Course ID is missing");
        
        const foundCourse = resolveCourseById(courseId, courses);

        // Ensure foundCourse has chapters populated
        if (!foundCourse.chapters || foundCourse.chapters.length === 0) {
          const fallback = FALLBACK_COURSES_MAP[courseId];
          if (fallback && fallback.chapters && fallback.chapters.length > 0) {
            foundCourse.chapters = fallback.chapters as any;
          } else {
            foundCourse.chapters = [
              {
                id: 'ch1',
                title: 'Chương 1: Giới thiệu & Môi trường phát triển',
                lessons: [
                  { id: 'l1', title: '1.1 Tổng quan về khóa học', type: 'video', duration: '10:15', isPreview: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
                  { id: 'l2', title: '1.2 Cài đặt các phần mềm cần thiết', type: 'video', duration: '14:30', isPreview: true, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
                  { id: 'l3', title: '1.3 Tạo dự án đầu tiên', type: 'video', duration: '12:45', isPreview: false }
                ]
              },
              {
                id: 'ch2',
                title: 'Chương 2: Kiến thức thực chiến & Dự án',
                lessons: [
                  { id: 'l4', title: '2.1 Cấu trúc ứng dụng & Luồng dữ liệu', type: 'video', duration: '15:20', isPreview: false },
                  { id: 'l5', title: '2.2 Tích hợp API & Triển khai', type: 'video', duration: '18:10', isPreview: false }
                ]
              }
            ];
          }
        }

        setCourse(foundCourse);

        // Load stored progress from localStorage
        const storageKey = `mindhub_lesson_progress_${foundCourse.id}`;
        let savedCompletedIds: string[] = [];
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed.completedLessonIds)) {
              savedCompletedIds = parsed.completedLessonIds;
            }
          } catch (e) {}
        }

        // Find first lesson if exists
        let firstLesson: Lesson | null = null;
        if (foundCourse.chapters && foundCourse.chapters.length > 0 && foundCourse.chapters[0].lessons.length > 0) {
          firstLesson = foundCourse.chapters[0].lessons[0];
        }

        setActiveLesson(firstLesson);

        setProgress({
          courseId: foundCourse.id,
          currentLessonId: firstLesson?.id || '',
          completedLessonIds: savedCompletedIds,
          notes: [],
          bookmarks: [],
          lastWatchedProgressSec: 0
        });

      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [courseId, courses]);

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const setTab = (tab: TabType) => setActiveTab(tab);

  const selectLesson = (lessonId: string) => {
    if (!course) return;
    for (const chapter of course.chapters) {
      const lesson = chapter.lessons.find(l => l.id === lessonId);
      if (lesson) {
        setActiveLesson(lesson);
        if (progress) {
          setProgress(prev => prev ? { ...prev, currentLessonId: lessonId } : null);
        }
        return;
      }
    }
  };

  const toggleLessonCompletion = useCallback((lessonId: string, forceStatus?: boolean) => {
    if (!course) return;
    setProgress(prev => {
      if (!prev) return prev;
      const isAlreadyCompleted = prev.completedLessonIds.includes(lessonId);
      let newCompletedIds: string[];

      if (typeof forceStatus === 'boolean') {
        if (forceStatus) {
          newCompletedIds = Array.from(new Set([...prev.completedLessonIds, lessonId]));
        } else {
          newCompletedIds = prev.completedLessonIds.filter(id => id !== lessonId);
        }
      } else {
        if (isAlreadyCompleted) {
          newCompletedIds = prev.completedLessonIds.filter(id => id !== lessonId);
        } else {
          newCompletedIds = Array.from(new Set([...prev.completedLessonIds, lessonId]));
        }
      }

      const updatedProgress: StudentProgress = {
        ...prev,
        completedLessonIds: newCompletedIds
      };

      // Persist locally for instant reload retention
      const storageKey = `mindhub_lesson_progress_${course.id}`;
      localStorage.setItem(storageKey, JSON.stringify(updatedProgress));

      // Async sync with API in background
      try {
        classroomApi.markLessonAsComplete(lessonId).catch(() => {});
        classroomApi.updateStudentProgress(course.id, {
          completedLessonIds: newCompletedIds,
        }).catch(() => {});
      } catch (e) {}

      return updatedProgress;
    });
  }, [course]);

  const markAsCompleted = (lessonId: string) => {
    toggleLessonCompletion(lessonId, true);
  };

  return {
    course,
    activeLesson,
    progress,
    isSidebarOpen,
    activeTab,
    isLoading,
    error,
    toggleSidebar,
    selectLesson,
    markAsCompleted,
    toggleLessonCompletion,
    setTab
  };
}
