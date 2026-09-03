import { useState, useEffect, useCallback } from 'react';
import { Course, Lesson, StudentProgress } from '@/shared/types';
import { INITIAL_COURSES } from '@/shared/data';
import { useApp } from '@/app/AppContext';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import { FALLBACK_COURSES_MAP } from '@/features/courses/hooks/useCourseDetail';
import { resolveCourseById } from '@/features/cart/CartAndCheckout';
import { classroomApi } from '../api';
import { apiFetch } from '@/shared/lib/api-client';
import bunnyVideosData from '@/shared/data/bunny_videos.json';

const BUNNY_TITLE_MAP: Record<string, string> = {};
Object.values(bunnyVideosData).forEach((vids: any) => {
  if (Array.isArray(vids)) {
    vids.forEach((v: any) => {
      if (v.title && v.video_id) {
        const normKey = v.title.toLowerCase().replace(/[^a-z0-9]/g, '');
        BUNNY_TITLE_MAP[normKey] = `https://iframe.mediadelivery.net/embed/724015/${v.video_id}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;
      }
    });
  }
});

export type TabType = 'overview' | 'qa' | 'notes' | 'resources' | 'reviews';

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

function generateTopicSyllabus(title: string, category: string): any[] {
  const lower = (title || '').toLowerCase();
  
  if (lower.includes('react')) {
    return [
      {
        id: 'ch1',
        title: 'Chương 1: Khởi tạo & Cấu trúc Dự án React.js',
        lessons: [
          { id: 'l1', title: '1.1 Tổng quan về React.js & Virtual DOM', type: 'video', duration: '10:15', isPreview: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: '1.2 Cài đặt Node.js & Tạo ứng dụng với Vite', type: 'video', duration: '14:30', isPreview: true, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
          { id: 'l3', title: '1.3 Cấu trúc thư mục & JSX Syntax', type: 'video', duration: '12:45', isPreview: false }
        ]
      },
      {
        id: 'ch2',
        title: 'Chương 2: Components, State & Hooks',
        lessons: [
          { id: 'l4', title: '2.1 Props & Reusable Components', type: 'video', duration: '15:20', isPreview: false },
          { id: 'l5', title: '2.2 Quản lý trạng thái với useState', type: 'video', duration: '18:10', isPreview: false },
          { id: 'l6', title: '2.3 Xử lý Side Effects với useEffect & Custom Hooks', type: 'video', duration: '20:05', isPreview: false }
        ]
      },
      {
        id: 'ch3',
        title: 'Chương 3: Real-world Project & Deployment',
        lessons: [
          { id: 'l7', title: '3.1 Tích hợp RESTful API & Async Fetch', type: 'video', duration: '22:15', isPreview: false },
          { id: 'l8', title: '3.2 Triển khai Production lên Vercel/Netlify', type: 'video', duration: '16:40', isPreview: false }
        ]
      }
    ];
  }

  if (lower.includes('python')) {
    return [
      {
        id: 'ch1',
        title: 'Chương 1: Cú pháp Nền tảng Python',
        lessons: [
          { id: 'l1', title: '1.1 Giới thiệu về Python & Cài đặt môi trường', type: 'video', duration: '09:40', isPreview: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: '1.2 Biến, Kiểu dữ liệu & Toán tử', type: 'video', duration: '13:10', isPreview: true, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
          { id: 'l3', title: '1.3 Câu lệnh điều kiện & Vòng lặp For/While', type: 'video', duration: '15:50', isPreview: false }
        ]
      },
      {
        id: 'ch2',
        title: 'Chương 2: Hàm & Lập trình Hướng đối tượng (OOP)',
        lessons: [
          { id: 'l4', title: '2.1 Định nghĩa Hàm, Tham số & Lambda Functions', type: 'video', duration: '14:25', isPreview: false },
          { id: 'l5', title: '2.2 Class, Object, Thuộc tính & Phương thức', type: 'video', duration: '19:30', isPreview: false },
          { id: 'l6', title: '2.3 Tính Đóng gói, Kế thừa & Đa hình', type: 'video', duration: '17:45', isPreview: false }
        ]
      }
    ];
  }

  if (lower.includes('node') || lower.includes('express')) {
    return [
      {
        id: 'ch1',
        title: 'Chương 1: Nền tảng Node.js Runtime',
        lessons: [
          { id: 'l1', title: '1.1 Khái niệm Event Loop & V8 Engine', type: 'video', duration: '11:20', isPreview: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: '1.2 Quản lý thư viện với NPM & Package.json', type: 'video', duration: '12:45', isPreview: true, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
          { id: 'l3', title: '1.3 Xây dựng HTTP Web Server đầu tiên', type: 'video', duration: '14:15', isPreview: false }
        ]
      },
      {
        id: 'ch2',
        title: 'Chương 2: Xây dựng RESTful API với Express.js',
        lessons: [
          { id: 'l4', title: '2.1 Routing & Middleware trong Express', type: 'video', duration: '16:40', isPreview: false },
          { id: 'l5', title: '2.2 Kết nối Database & ORM Query', type: 'video', duration: '21:10', isPreview: false },
          { id: 'l6', title: '2.3 Bảo mật với JWT Authentication & Password Hashing', type: 'video', duration: '18:50', isPreview: false }
        ]
      }
    ];
  }

  if (lower.includes('figma') || lower.includes('ui/ux') || lower.includes('design') || lower.includes('thiết kế')) {
    return [
      {
        id: 'ch1',
        title: 'Chương 1: Tư duy Thiết kế UI/UX & Figma Basics',
        lessons: [
          { id: 'l1', title: '1.1 Tổng quan về Quy trình Thiết kế Sản phẩm UI/UX', type: 'video', duration: '10:00', isPreview: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: '1.2 Công cụ Figma & Cấu trúc Canvas, Frame, Vector', type: 'video', duration: '15:20', isPreview: true, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
          { id: 'l3', title: '1.3 Typography, Color Palette & Design Tokens', type: 'video', duration: '13:45', isPreview: false }
        ]
      },
      {
        id: 'ch2',
        title: 'Chương 2: Design System & Interactive Prototype',
        lessons: [
          { id: 'l4', title: '2.1 Components, Variants & Auto Layout 5.0', type: 'video', duration: '17:30', isPreview: false },
          { id: 'l5', title: '2.2 Xây dựng Prototype tương tác chuyển động', type: 'video', duration: '19:15', isPreview: false }
        ]
      }
    ];
  }

  if (lower.includes('laravel') || lower.includes('php')) {
    return [
      {
        id: 'ch1',
        title: 'Chương 1: Giới thiệu & Cấu trúc Laravel Framework',
        lessons: [
          { id: 'l1', title: '1.1 Cài đặt Composer, PHP & Laravel Framework', type: 'video', duration: '12:00', isPreview: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: '1.2 Architecture Concepts: Routing, Middleware & Controllers', type: 'video', duration: '16:15', isPreview: true, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
          { id: 'l3', title: '1.3 Blade Templating Engine & Layout Components', type: 'video', duration: '14:50', isPreview: false }
        ]
      },
      {
        id: 'ch2',
        title: 'Chương 2: Eloquent ORM & REST API Development',
        lessons: [
          { id: 'l4', title: '2.1 Database Migrations, Seeders & Factories', type: 'video', duration: '18:30', isPreview: false },
          { id: 'l5', title: '2.2 Eloquent Relationships & Performance Optimization', type: 'video', duration: '22:10', isPreview: false },
          { id: 'l6', title: '2.3 Laravel Sanctum Authentication & API Resources', type: 'video', duration: '19:40', isPreview: false }
        ]
      }
    ];
  }

  return [
    {
      id: 'ch1',
      title: 'Chương 1: Giới thiệu & Môi trường phát triển',
      lessons: [
        { id: 'l1', title: '1.1 Tổng quan về khóa học & Mục tiêu', type: 'video', duration: '10:15', isPreview: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        { id: 'l2', title: '1.2 Cài đặt các công cụ & Phần mềm cần thiết', type: 'video', duration: '14:30', isPreview: true, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
        { id: 'l3', title: '1.3 Thực hành bài tập đầu tiên', type: 'video', duration: '12:45', isPreview: false }
      ]
    },
    {
      id: 'ch2',
      title: 'Chương 2: Kiến thức nâng cao & Dự án thực tế',
      lessons: [
        { id: 'l4', title: '2.1 Kiến trúc cốt lõi & Quy trình làm việc', type: 'video', duration: '15:20', isPreview: false },
        { id: 'l5', title: '2.2 Xây dựng dự án thực chiến & Tối ưu hóa', type: 'video', duration: '18:10', isPreview: false }
      ]
    }
  ];
}

const INSTRUCTOR_CATALOG_MAP: Record<string, { name: string; avatar: string; bio: string }> = {
  'fav-1': { name: 'Nguyễn Văn A', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80', bio: 'Senior Frontend Architect với hơn 8 năm kinh nghiệm giảng dạy React và phát triển Web App.' },
  'fav-2': { name: 'Trần Quang Huy', avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80', bio: 'Backend Tech Lead chuyên sâu Node.js, Express.js và Hệ thống phân tán Microservices.' },
  'fav-3': { name: 'Phạm Minh Đức', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80', bio: 'Chuyên gia JavaScript ES6+, Web APIs và Tối ưu hóa hiệu năng ứng dụng Front-end.' },
  'fav-4': { name: 'Lê Hoàng Nam', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&q=80', bio: 'UI Engineer đam mê thiết kế CSS, Tailwind CSS và Xây dựng Design System chuyên nghiệp.' },
  'fav-5': { name: 'Đỗ Thu Trang', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80', bio: 'Lead Product Designer với 6+ năm thiết kế sản phẩm ứng dụng di động và trải nghiệm người dùng UI/UX.' },
  'fav-6': { name: 'Nguyễn Hoài An', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80', bio: 'Senior Figma Instructor & UX Researcher đào tạo hơn 15.000+ học viên thiết kế.' },
  'fav-7': { name: 'Vũ Đức Anh', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&q=80', bio: 'Full-stack Laravel Developer & Solution Architect với 10 năm kinh nghiệm phát triển Web Enterprise.' },
  'fav-8': { name: 'Phan Quốc Huy', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&q=80', bio: 'Data Engineer & Python Instructor chuyên về Phân tích dữ liệu, Automation và AI Backend.' },
};

function getInstructorInfo(foundCourse: Course, courseId: string): { name: string; avatar: string; bio: string } {
  // 1. Check direct instructor attributes from Backend API
  const apiInst = (foundCourse as any).instructor;
  if (apiInst && (apiInst.full_name || apiInst.name)) {
    return {
      name: apiInst.full_name || apiInst.name,
      avatar: apiInst.avatar_url || apiInst.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80',
      bio: apiInst.bio || 'Senior Software Engineer với nhiều năm kinh nghiệm giảng dạy và phát triển sản phẩm thực tế.',
    };
  }

  // 2. Check course object if instructorName is provided
  if (foundCourse.instructorName && foundCourse.instructorName !== 'Nguyễn Văn A') {
    return {
      name: foundCourse.instructorName,
      avatar: foundCourse.instructorAvatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80',
      bio: (foundCourse as any).instructorBio || 'Senior Software Engineer với nhiều năm kinh nghiệm giảng dạy và phát triển sản phẩm thực tế.',
    };
  }

  // 3. Check catalog map by course ID
  if (INSTRUCTOR_CATALOG_MAP[courseId]) {
    return INSTRUCTOR_CATALOG_MAP[courseId];
  }

  // 4. Fallback matching by title & topic keywords
  const title = (foundCourse.title || '').toLowerCase();
  if (title.includes('react') || title.includes('next')) return INSTRUCTOR_CATALOG_MAP['fav-1'];
  if (title.includes('node') || title.includes('express')) return INSTRUCTOR_CATALOG_MAP['fav-2'];
  if (title.includes('javascript') || title.includes('js')) return INSTRUCTOR_CATALOG_MAP['fav-3'];
  if (title.includes('tailwind') || title.includes('css')) return INSTRUCTOR_CATALOG_MAP['fav-4'];
  if (title.includes('ui/ux') || title.includes('giao diện')) return INSTRUCTOR_CATALOG_MAP['fav-5'];
  if (title.includes('figma')) return INSTRUCTOR_CATALOG_MAP['fav-6'];
  if (title.includes('laravel') || title.includes('php')) return INSTRUCTOR_CATALOG_MAP['fav-7'];
  if (title.includes('python') || title.includes('ai')) return INSTRUCTOR_CATALOG_MAP['fav-8'];
  if (title.includes('mvp') || title.includes('web') || title.includes('project') || title.includes('sản phẩm')) {
    return {
      name: 'ThS. Nguyễn Quang Minh',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
      bio: 'Senior Technical Architect với hơn 10 năm kinh nghiệm thiết kế sản phẩm Web App và tư duy xây dựng MVP thực chiến.',
    };
  }

  return {
    name: 'Dr. Lê Quốc Khánh',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80',
    bio: 'Dr. Lê Quốc Khánh có hơn 12 năm kinh nghiệm trong ngành phát triển phần mềm và nghiên cứu hạ tầng AI tại Google Brain.',
  };
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

    const loadCourseClassroom = async () => {
      try {
        if (!courseId) throw new Error("Course ID is missing");

        // 1. Resolve base course details from App Context / Local Storage
        let foundCourse: Course = resolveCourseById(courseId, courses);
        let match: any = null;

        // 2. Fetch fresh course details from Backend API /courses or /courses/:id
        try {
          // A. Try direct detail API: GET /courses/:id
          try {
            const directRes = await apiFetch<any>(`/courses/${courseId}`);
            if (directRes && (directRes.title || directRes.name || directRes.data)) {
              match = directRes.data || directRes;
            }
          } catch (errDirect) {}

          // B. Try catalog list API: GET /courses
          if (!match) {
            const apiRes = await apiFetch<any>(`/courses`);
            const list = Array.isArray(apiRes?.data) ? apiRes.data : (Array.isArray(apiRes) ? apiRes : []);
            match = list.find((c: any) => String(c.id) === String(courseId) || Number(c.id) === Number(courseId) || c.slug === courseId);
          }

          // C. Fallback map check
          if (!match && FALLBACK_COURSES_MAP[courseId]) {
            match = FALLBACK_COURSES_MAP[courseId];
          }

          if (match) {
            const inst = match.instructor || {};
            foundCourse = {
              ...foundCourse,
              id: String(match.id || match.slug || foundCourse.id),
              title: match.title || match.name || foundCourse.title,
              description: match.description || match.summary || match.short_description || foundCourse.description,
              level: match.level || foundCourse.level,
              category: match.category?.name || match.category || foundCourse.category,
              sections: match.sections || match.data?.sections || (foundCourse as any).sections,
              instructorName: inst.full_name || inst.name || match.instructor_name || foundCourse.instructorName,
              instructorAvatar: inst.avatar_url || inst.avatar || match.instructor_avatar || foundCourse.instructorAvatar,
              instructorBio: inst.bio || match.instructor_bio || (foundCourse as any).instructorBio,
              rating: Number(match.average_rating || match.rating || foundCourse.rating || 4.9),
              instructor: inst,
            } as any;
          }
        } catch (e) {
          console.warn('Backend course query fallback:', e);
        }

        // 3. Resolve exact matching instructor info (name, avatar, bio)
        const instInfo = getInstructorInfo(foundCourse, courseId);
        foundCourse.instructorName = instInfo.name;
        foundCourse.instructorAvatar = instInfo.avatar;
        (foundCourse as any).instructorBio = instInfo.bio;

        // 3. Try to fetch outline syllabus from Backend API (/learn/courses/:id/outline)
        const numericId = parseInt(String(courseId).replace(/\D/g, ''), 10);
        let apiChapters: any[] = [];
        let backendCompletedLessonIds: string[] = [];
        let hasBackendOutline = false;

        if (!isNaN(numericId) && numericId > 0) {
          try {
            const outlineRes = await classroomApi.getStudentCourseOutline(String(numericId));
            const rawSections = Array.isArray(outlineRes?.data) ? outlineRes.data : (Array.isArray(outlineRes) ? outlineRes : []);
            if (rawSections.length > 0) {
              hasBackendOutline = true;
              apiChapters = rawSections.map((sec: any, idx: number) => ({
                id: String(sec.id || `sec-${idx}`),
                title: sec.title || sec.name || `Chương ${idx + 1}`,
                lessons: (sec.lessons || sec.items || []).map((l: any, lIdx: number) => {
                  const lessonIdStr = String(l.id || `l-${idx}-${lIdx}`);
                  if (l.progress?.status === 'completed' || l.progress?.completed_at) {
                    backendCompletedLessonIds.push(lessonIdStr);
                  }
                  const rawSecs = l.video_duration_seconds ?? l.duration_seconds ?? l.duration ?? l.video_duration;
                  let parsedDuration = '';
                  if (typeof rawSecs === 'number' && rawSecs > 0) {
                    const m = Math.floor(rawSecs / 60);
                    const s = Math.floor(rawSecs % 60);
                    parsedDuration = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                  } else if (typeof rawSecs === 'string' && rawSecs.trim()) {
                    parsedDuration = rawSecs;
                  } else {
                    parsedDuration = '05:00';
                  }

                  return {
                    id: lessonIdStr,
                    title: l.title || l.name || `Bài ${lIdx + 1}`,
                    type: 'video',
                    duration: parsedDuration,
                    isPreview: Boolean(l.is_preview),
                    videoUrl: (l.video_id && !String(l.video_id).includes('seed-bunny'))
                      ? `https://iframe.mediadelivery.net/embed/724015/${l.video_id}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`
                      : (l.video_url && !l.video_url.includes('seed-bunny'))
                        ? l.video_url
                        : 'https://iframe.mediadelivery.net/embed/724015/3a3c6a0d-c691-4a82-afaa-d8824fc73ce1?autoplay=true&loop=false&muted=false&preload=true&responsive=true',
                    content: l.description || l.summary,
                  };
                })
              }));
            }
          } catch (e) {
            console.warn('Backend outline query fallback:', e);
          }
        }

        // 4. If outline endpoint didn't return chapters, map from match.sections if present
        const rawSecs = match?.sections || match?.data?.sections || (foundCourse as any).sections || (foundCourse as any).chapters;
        if (apiChapters.length === 0 && Array.isArray(rawSecs) && rawSecs.length > 0) {
          apiChapters = rawSecs.map((sec: any, idx: number) => ({
            id: String(sec.id || `sec-${idx}`),
            title: sec.title || sec.name || `Chương ${idx + 1}`,
            lessons: (sec.lessons || sec.items || []).map((l: any, lIdx: number) => {
              const lessonIdStr = String(l.id || `l-${idx}-${lIdx}`);
              const rawDuration = l.video_duration_seconds ?? l.duration_seconds ?? l.duration ?? l.video_duration;
              let parsedDuration = '';
              if (typeof rawDuration === 'number' && rawDuration > 0) {
                const m = Math.floor(rawDuration / 60);
                const s = Math.floor(rawDuration % 60);
                parsedDuration = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
              } else if (typeof rawDuration === 'string' && rawDuration.trim()) {
                parsedDuration = rawDuration;
              } else {
                parsedDuration = '10:00';
              }
              const normTitle = (l.title || l.name || '').toLowerCase().replace(/[^a-z0-9]/g, '');
              const directBunnyEmbed = BUNNY_TITLE_MAP[normTitle] || '';
              const videoEmbedUrl = l.video_id
                ? `https://iframe.mediadelivery.net/embed/724015/${l.video_id}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`
                : (directBunnyEmbed || l.video_url || l.stream_url || '');

              return {
                id: lessonIdStr,
                title: l.title || l.name || `Bài ${lIdx + 1}`,
                type: 'video',
                duration: parsedDuration,
                isPreview: Boolean(l.is_preview || l.is_free_preview || l.isPreview),
                videoUrl: videoEmbedUrl,
                content: l.description || l.summary,
              };
            })
          }));
        }

        // 5. Fallback/Ensure tailored chapters exist for each specific course topic
        if (apiChapters.length > 0) {
          foundCourse.chapters = apiChapters;
        } else if (!foundCourse.chapters || foundCourse.chapters.length === 0) {
          foundCourse.chapters = generateTopicSyllabus(foundCourse.title, foundCourse.category || '');
        }

        if (isMounted) {
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

          // If backend provided progress, prioritize real DB progress and merge
          const finalCompletedIds = hasBackendOutline 
            ? Array.from(new Set([...backendCompletedLessonIds, ...savedCompletedIds]))
            : savedCompletedIds;

          // Compute all lessons flat list
          const flatLessons = (foundCourse.chapters || []).flatMap((c: any) => c.lessons || []);

          // Find saved current lesson ID if any
          let savedCurrentLessonId: string | null = null;
          if (saved) {
            try {
              const parsed = JSON.parse(saved);
              if (parsed.currentLessonId) {
                savedCurrentLessonId = String(parsed.currentLessonId);
              }
            } catch (e) {}
          }

          // Pick optimal resume lesson:
          // 1. If savedCurrentLessonId exists and valid, resume that lesson
          // 2. Otherwise find the first uncompleted lesson in the course
          // 3. Otherwise if all completed, pick the last lesson (or first)
          let optimalLesson: Lesson | null = null;
          if (savedCurrentLessonId) {
            optimalLesson = flatLessons.find((l: any) => String(l.id) === savedCurrentLessonId) || null;
          }

          if (!optimalLesson && flatLessons.length > 0) {
            const completedSet = new Set(finalCompletedIds.map(String));
            // First uncompleted lesson
            const firstUncompleted = flatLessons.find((l: any) => !completedSet.has(String(l.id)));
            optimalLesson = firstUncompleted || flatLessons[flatLessons.length - 1] || flatLessons[0];
          }

          if (!optimalLesson && foundCourse.chapters && foundCourse.chapters.length > 0 && foundCourse.chapters[0].lessons.length > 0) {
            optimalLesson = foundCourse.chapters[0].lessons[0];
          }

          setActiveLesson(optimalLesson);

          setProgress({
            courseId: foundCourse.id,
            currentLessonId: optimalLesson?.id || '',
            completedLessonIds: finalCompletedIds,
            notes: [],
            bookmarks: [],
            lastWatchedProgressSec: 0
          });
        }
      } catch (err: any) {
        if (isMounted) setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCourseClassroom();
    return () => {
      isMounted = false;
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
        const strLessonId = String(lessonId);
        setProgress(prev => {
          if (!prev) return null;
          const updated = { ...prev, currentLessonId: strLessonId };
          const storageKey = `mindhub_lesson_progress_${course.id}`;
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
          } catch (e) {}
          return updated;
        });
        return;
      }
    }
  };

  const toggleLessonCompletion = useCallback((lessonId: string, forceStatus?: boolean) => {
    if (!course) return;
    setProgress(prev => {
      if (!prev) return prev;
      const strIds = (prev.completedLessonIds || []).map(String);
      const strLessonId = String(lessonId);
      const isAlreadyCompleted = strIds.includes(strLessonId);
      let newCompletedIds: string[];

      if (typeof forceStatus === 'boolean') {
        if (forceStatus) {
          newCompletedIds = Array.from(new Set([...strIds, strLessonId]));
        } else {
          newCompletedIds = strIds.filter(id => id !== strLessonId);
        }
      } else {
        if (isAlreadyCompleted) {
          newCompletedIds = strIds.filter(id => id !== strLessonId);
        } else {
          newCompletedIds = Array.from(new Set([...strIds, strLessonId]));
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
        const isNowCompleted = newCompletedIds.includes(lessonId);
        classroomApi.markLessonAsComplete(lessonId, isNowCompleted).catch(() => {});
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
