import { useState, useEffect } from 'react';
import { Course, Lesson, StudentProgress } from '@/shared/types';
import { INITIAL_COURSES } from '@/shared/data';
import { useApp } from '@/app/AppContext';

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
  setTab: (tab: TabType) => void;
}

export function useClassroom(courseId: string | undefined): UseClassroomResult {
  const { currentUser } = useApp();
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
        
        const foundCourse = INITIAL_COURSES.find(c => c.id === courseId);
        if (!foundCourse) throw new Error("Course not found");

        setCourse(foundCourse);

        // Find first lesson if exists
        let firstLesson: Lesson | null = null;
        if (foundCourse.chapters.length > 0 && foundCourse.chapters[0].lessons.length > 0) {
          firstLesson = foundCourse.chapters[0].lessons[0];
        }

        setActiveLesson(firstLesson);

        // Mock initial progress
        setProgress({
          courseId: foundCourse.id,
          currentLessonId: firstLesson?.id || '',
          completedLessonIds: [],
          notes: [],
          bookmarks: [],
          lastWatchedProgressSec: 0
        });

      } catch (err: any) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }, 500); // Simulate API loading

    return () => {
      isMounted = false;
      clearTimeout(timeout);
    };
  }, [courseId]);

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

  const markAsCompleted = (lessonId: string) => {
    setProgress(prev => {
      if (!prev) return prev;
      if (prev.completedLessonIds.includes(lessonId)) {
        // Toggle off for testing purposes if desired, but usually we just keep it completed
        return {
          ...prev,
          completedLessonIds: prev.completedLessonIds.filter(id => id !== lessonId)
        };
      }
      return {
        ...prev,
        completedLessonIds: [...prev.completedLessonIds, lessonId]
      };
    });
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
    setTab
  };
}
