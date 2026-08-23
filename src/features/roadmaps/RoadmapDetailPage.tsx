import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PageTransition } from '@/shared/components/ui/PageTransition';
import { roadmapsApi } from './api';
import { safeLocalStorage as localStorage } from '@/shared/utils/safeStorage';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Share2,
  Users,
  BookOpen,
  Clock,
  Award,
  Layers,
  Star,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Code2,
  FileText,
  TrendingUp,
  Loader2,
  Server,
  Database,
  Smartphone,
  Palette,
} from 'lucide-react';
import { toast } from 'sonner';

// Detailed data for roadmap detail view
const ROADMAP_DATA = {
  frontend: {
    title: 'Frontend Developer',
    description:
      'Lộ trình học Frontend từ cơ bản đến nâng cao, giúp bạn xây dựng giao diện web chuyên nghiệp và sẵn sàng đi làm.',
    stats: {
      stagesCount: 5,
      coursesCount: 12,
      lessonsCount: 168,
      totalHours: '120 giờ',
      level: 'Beginner → Advanced',
    },
    overallProgress: 0,
    progressDetails: {
      completedCourses: '0/12',
      completedStages: '0/5',
      completedLessons: '0/168',
      totalTimeSpent: '0 giờ',
      lastStudied: 'Chưa học',
    },
    nextCourse: {
      id: 'html5-fundamentals',
      title: 'HTML5 Fundamentals',
      currentLesson: 'Bài 1: Giới thiệu HTML5',
      iconBg: 'bg-orange-500',
    },
    stages: [
      {
        id: 1,
        title: 'Kiến thức nền tảng',
        description: 'Tìm hiểu về Web, Internet và các công nghệ nền tảng.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'web-basics',
            title: 'Internet & Web Basics',
            duration: '2 giờ 30 phút',
            lessons: 15,
            level: 'Beginner',
            status: 'start',
            rating: 4.7,
            students: '12.4K',
            badgeBg: 'bg-purple-100 text-purple-600',
            badgeText: 'WWW',
          },
          {
            id: 'html5-fundamentals',
            title: 'HTML5 Fundamentals',
            duration: '6 giờ 45 phút',
            lessons: 32,
            level: 'Beginner',
            status: 'start',
            rating: 4.8,
            students: '18.6K',
            badgeBg: 'bg-orange-500 text-white font-black text-xs',
            badgeText: 'HTML 5',
          },
        ],
      },
      {
        id: 2,
        title: 'HTML, CSS và JavaScript',
        description: 'Xây dựng nền tảng vững chắc với HTML, CSS và JavaScript.',
        completedCount: 0,
        totalCount: 3,
        progressPercent: 0,
        courses: [
          {
            id: 'css3-styling',
            title: 'CSS3 Styling & Flexbox',
            duration: '8 giờ 15 phút',
            lessons: 36,
            level: 'Beginner',
            status: 'start',
            rating: 4.9,
            students: '22.1K',
            badgeBg: 'bg-blue-600 text-white font-black text-xs',
            badgeText: 'CSS 3',
          },
          {
            id: 'js-basic-advanced',
            title: 'JavaScript Basic to Advanced',
            duration: '12 giờ 40 phút',
            lessons: 68,
            level: 'Beginner',
            status: 'start',
            rating: 4.8,
            students: '25.3K',
            badgeBg: 'bg-amber-400 text-slate-900 font-black text-xs',
            badgeText: 'JS',
          },
          {
            id: 'dom-bom',
            title: 'DOM & BOM Manipulation',
            duration: '4 giờ 30 phút',
            lessons: 18,
            level: 'Intermediate',
            status: 'start',
            rating: 4.6,
            students: '9.8K',
            badgeBg: 'bg-indigo-600 text-white font-bold text-[10px]',
            badgeText: 'DOM',
          },
        ],
      },
      {
        id: 3,
        title: 'Frontend Framework (React.js)',
        description: 'Làm chủ các framework hiện đại như React và Next.js.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'react-zero-hero',
            title: 'React.js From Zero to Hero',
            duration: '18 giờ 20 phút',
            lessons: 82,
            level: 'Intermediate',
            status: 'start',
            rating: 4.9,
            students: '31.2K',
            badgeBg: 'bg-sky-500 text-white font-bold text-[10px]',
            badgeText: 'REACT',
          },
          {
            id: 'nextjs-app-router',
            title: 'Next.js App Router & SSR',
            duration: '14 giờ',
            lessons: 50,
            level: 'Intermediate',
            status: 'start',
            rating: 4.9,
            students: '19.8K',
            badgeBg: 'bg-slate-900 text-white font-bold text-[10px]',
            badgeText: 'NEXT',
          },
        ],
      },
      {
        id: 4,
        title: 'Quản lý State & REST API',
        description: 'Tương tác với REST API, GraphQL và quản lý state tập trung.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'redux-zustand',
            title: 'State Management with Redux Toolkit',
            duration: '9 giờ 15 phút',
            lessons: 40,
            level: 'Advanced',
            status: 'start',
            rating: 4.8,
            students: '15.4K',
            badgeBg: 'bg-purple-600 text-white font-bold text-[10px]',
            badgeText: 'REDUX',
          },
        ],
      },
      {
        id: 5,
        title: 'Testing & Deployment',
        description: 'Viết Unit Test, E2E Test và triển khai sản phẩm thực tế.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'testing-deployment',
            title: 'Vitest & CI/CD Deployment',
            duration: '7 giờ 30 phút',
            lessons: 30,
            level: 'Advanced',
            status: 'start',
            rating: 4.7,
            students: '8.2K',
            badgeBg: 'bg-emerald-600 text-white font-bold text-[10px]',
            badgeText: 'TEST',
          },
        ],
      },
    ],
  },
  backend: {
    title: 'Backend Developer',
    description:
      'Xây dựng hệ thống backend mạnh mẽ với Laravel, Node.js, Microservices, Security và System Design.',
    stats: {
      stagesCount: 5,
      coursesCount: 15,
      lessonsCount: 210,
      totalHours: '150 giờ',
      level: 'Beginner → Advanced',
    },
    overallProgress: 0,
    progressDetails: {
      completedCourses: '0/15',
      completedStages: '0/5',
      completedLessons: '0/210',
      totalTimeSpent: '0 giờ',
      lastStudied: 'Chưa học',
    },
    nextCourse: {
      id: 'laravel-rest-api-tu-co-ban-den-trien-khai',
      title: 'Laravel REST API nâng cao',
      currentLesson: 'Bài 1: Tổng quan Laravel Framework',
      iconBg: 'bg-rose-600',
    },
    stages: [
      {
        id: 1,
        title: 'Kiến thức nền tảng Backend & SQL',
        description: 'Cơ chế HTTP/HTTPS, CSDL quan hệ MySQL và PostgreSQL.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'cs-network-basics',
            title: 'Computer Networking & HTTP Fundamentals',
            duration: '4 giờ 15 phút',
            lessons: 20,
            level: 'Beginner',
            status: 'start',
            rating: 4.8,
            students: '15.2K',
            badgeBg: 'bg-blue-600 text-white font-black text-xs',
            badgeText: 'HTTP',
          },
          {
            id: 'sql-database-design',
            title: 'SQL & Database Design từ cơ bản',
            duration: '8 giờ 30 phút',
            lessons: 34,
            level: 'Beginner',
            status: 'start',
            rating: 4.9,
            students: '20.1K',
            badgeBg: 'bg-emerald-600 text-white font-black text-xs',
            badgeText: 'SQL',
          },
        ],
      },
      {
        id: 2,
        title: 'Lập trình PHP & Laravel Framework',
        description: 'Làm chủ Laravel REST API, Eloquent ORM và Middleware.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'laravel-rest-api-tu-co-ban-den-trien-khai',
            title: 'Laravel REST API nâng cao',
            duration: '16 giờ 00 phút',
            lessons: 75,
            level: 'Intermediate',
            status: 'start',
            rating: 4.9,
            students: '18.4K',
            badgeBg: 'bg-rose-600 text-white font-black text-xs',
            badgeText: 'LARAVEL',
          },
          {
            id: 'php-oop-clean-code',
            title: 'Lập trình PHP OOP & Clean Code',
            duration: '10 giờ',
            lessons: 40,
            level: 'Intermediate',
            status: 'start',
            rating: 4.8,
            students: '12.6K',
            badgeBg: 'bg-indigo-600 text-white font-black text-xs',
            badgeText: 'PHP',
          },
        ],
      },
      {
        id: 3,
        title: 'Node.js & Microservices',
        description: 'Xây dựng API hiệu năng cao với Node.js, Express và NestJS.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'nodejs-express-api',
            title: 'Node.js & Express RESTful API',
            duration: '14 giờ',
            lessons: 50,
            level: 'Intermediate',
            status: 'start',
            rating: 4.8,
            students: '22.3K',
            badgeBg: 'bg-emerald-700 text-white font-black text-xs',
            badgeText: 'NODE',
          },
        ],
      },
      {
        id: 4,
        title: 'Redis Caching & Queue System',
        description: 'Tối ưu hiệu năng ứng dụng với Redis Caching và Queue Worker.',
        completedCount: 0,
        totalCount: 1,
        progressPercent: 0,
        courses: [
          {
            id: 'redis-queues',
            title: 'High Performance Redis & Message Queue',
            duration: '10 giờ 20 phút',
            lessons: 40,
            level: 'Advanced',
            status: 'start',
            rating: 4.8,
            students: '11.3K',
            badgeBg: 'bg-red-600 text-white font-black text-xs',
            badgeText: 'REDIS',
          },
        ],
      },
      {
        id: 5,
        title: 'System Design & Security',
        description: 'Thiết kế hệ thống chịu tải lớn, Docker & Kubernetes.',
        completedCount: 0,
        totalCount: 1,
        progressPercent: 0,
        courses: [
          {
            id: 'system-design-docker',
            title: 'System Design & Microservices Docker',
            duration: '16 giờ',
            lessons: 55,
            level: 'Advanced',
            status: 'start',
            rating: 4.9,
            students: '9.4K',
            badgeBg: 'bg-sky-600 text-white font-black text-xs',
            badgeText: 'DOCKER',
          },
        ],
      },
    ],
  },
  data: {
    title: 'Data Engineering',
    description:
      'Xử lý dữ liệu lớn, xây dựng Data Pipeline với Python, SQL, PostgreSQL và Apache Spark.',
    stats: {
      stagesCount: 4,
      coursesCount: 10,
      lessonsCount: 140,
      totalHours: '110 giờ',
      level: 'Beginner → Advanced',
    },
    overallProgress: 0,
    progressDetails: {
      completedCourses: '0/10',
      completedStages: '0/4',
      completedLessons: '0/140',
      totalTimeSpent: '0 giờ',
      lastStudied: 'Chưa học',
    },
    nextCourse: {
      id: 'python-data-analysis',
      title: 'Python for Data Analysis',
      currentLesson: 'Bài 1: Nhập môn Python & NumPy',
      iconBg: 'bg-amber-500',
    },
    stages: [
      {
        id: 1,
        title: 'Nền tảng Python & SQL cho Data',
        description: 'Thạo Python cơ bản, NumPy, Pandas và SQL truy vấn nâng cao.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'python-data-analysis',
            title: 'Python for Data Analysis',
            duration: '12 giờ 30 phút',
            lessons: 45,
            level: 'Beginner',
            status: 'start',
            rating: 4.8,
            students: '19.2K',
            badgeBg: 'bg-amber-500 text-white font-black text-xs',
            badgeText: 'PY',
          },
          {
            id: 'sql-advanced-analytics',
            title: 'Advanced SQL Queries & Analytics',
            duration: '10 giờ',
            lessons: 38,
            level: 'Beginner',
            status: 'start',
            rating: 4.9,
            students: '16.7K',
            badgeBg: 'bg-blue-600 text-white font-black text-xs',
            badgeText: 'SQL',
          },
        ],
      },
      {
        id: 2,
        title: 'Xử lý Dữ liệu với PySpark & Distributed Systems',
        description: 'Phân tích dữ liệu lớn trên máy chủ phân tán với Apache Spark.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'pyspark-big-data',
            title: 'PySpark & Distributed Data Processing',
            duration: '16 giờ',
            lessons: 50,
            level: 'Intermediate',
            status: 'start',
            rating: 4.9,
            students: '14.3K',
            badgeBg: 'bg-orange-600 text-white font-black text-xs',
            badgeText: 'SPARK',
          },
        ],
      },
      {
        id: 3,
        title: 'Xây dựng Data Pipeline & ETL với Airflow',
        description: 'Tự động hóa luồng xử lý ETL/ELT chuyên nghiệp.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'apache-airflow-pipeline',
            title: 'Data Pipeline Automation with Airflow',
            duration: '14 giờ',
            lessons: 42,
            level: 'Advanced',
            status: 'start',
            rating: 4.8,
            students: '11.8K',
            badgeBg: 'bg-teal-600 text-white font-black text-xs',
            badgeText: 'ETL',
          },
        ],
      },
      {
        id: 4,
        title: 'Data Warehousing & Cloud Data Lake',
        description: 'Quản trị Data Warehouse trên Snowflake, BigQuery & Cloud.',
        completedCount: 0,
        totalCount: 1,
        progressPercent: 0,
        courses: [
          {
            id: 'cloud-data-warehouse',
            title: 'Cloud Data Warehouse & Snowflake',
            duration: '12 giờ',
            lessons: 35,
            level: 'Advanced',
            status: 'start',
            rating: 4.9,
            students: '8.9K',
            badgeBg: 'bg-indigo-600 text-white font-black text-xs',
            badgeText: 'CLOUD',
          },
        ],
      },
    ],
  },
  mobile: {
    title: 'Mobile Developer',
    description:
      'Phát triển ứng dụng di động đa nền tảng với Flutter, React Native và Native Features.',
    stats: {
      stagesCount: 4,
      coursesCount: 8,
      lessonsCount: 120,
      totalHours: '90 giờ',
      level: 'Beginner → Advanced',
    },
    overallProgress: 0,
    progressDetails: {
      completedCourses: '0/8',
      completedStages: '0/4',
      completedLessons: '0/120',
      totalTimeSpent: '0 giờ',
      lastStudied: 'Chưa học',
    },
    nextCourse: {
      id: 'flutter-cross-platform',
      title: 'Flutter Cross-Platform Mastery',
      currentLesson: 'Bài 1: Giới thiệu Flutter & Dart SDK',
      iconBg: 'bg-sky-600',
    },
    stages: [
      {
        id: 1,
        title: 'Nền tảng Lập trình Di động',
        description: 'Học ngôn ngữ Dart & TypeScript cho ứng dụng di động.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'flutter-cross-platform',
            title: 'Flutter Cross-Platform Mastery',
            duration: '18 giờ',
            lessons: 60,
            level: 'Beginner',
            status: 'start',
            rating: 4.9,
            students: '14.1K',
            badgeBg: 'bg-sky-600 text-white font-black text-xs',
            badgeText: 'FLUTTER',
          },
          {
            id: 'dart-programming-basics',
            title: 'Lập trình Dart OOP cơ bản',
            duration: '8 giờ',
            lessons: 30,
            level: 'Beginner',
            status: 'start',
            rating: 4.8,
            students: '10.5K',
            badgeBg: 'bg-blue-500 text-white font-black text-xs',
            badgeText: 'DART',
          },
        ],
      },
      {
        id: 2,
        title: 'React Native & Mobile State Management',
        description: 'Phát triển ứng dụng iOS / Android với React Native & Expo.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'react-native-expo',
            title: 'React Native & Expo App Development',
            duration: '16 giờ',
            lessons: 50,
            level: 'Intermediate',
            status: 'start',
            rating: 4.9,
            students: '18.7K',
            badgeBg: 'bg-indigo-600 text-white font-black text-xs',
            badgeText: 'RN',
          },
        ],
      },
      {
        id: 3,
        title: 'Tích hợp Firebase & Rest API Mobile',
        description: 'Quản lý thông báo Push Notification, Authentication & Realtime Database.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'firebase-mobile-integration',
            title: 'Firebase Services & Push Notification',
            duration: '10 giờ',
            lessons: 35,
            level: 'Intermediate',
            status: 'start',
            rating: 4.8,
            students: '12.3K',
            badgeBg: 'bg-amber-600 text-white font-black text-xs',
            badgeText: 'FIREBASE',
          },
        ],
      },
      {
        id: 4,
        title: 'Publishing & App Store / Google Play CI/CD',
        description: 'Quy trình đóng gói, kiểm thử và đăng tải ứng dụng lên Store.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'app-store-publishing',
            title: 'App Store & Google Play Publishing',
            duration: '8 giờ',
            lessons: 25,
            level: 'Advanced',
            status: 'start',
            rating: 4.9,
            students: '9.1K',
            badgeBg: 'bg-emerald-600 text-white font-black text-xs',
            badgeText: 'STORE',
          },
        ],
      },
    ],
  },
  uiux: {
    title: 'UI/UX Designer',
    description:
      'Thiết kế trải nghiệm người dùng ấn tượng với Figma, Design System và User Research.',
    stats: {
      stagesCount: 4,
      coursesCount: 9,
      lessonsCount: 110,
      totalHours: '80 giờ',
      level: 'Beginner → Advanced',
    },
    overallProgress: 0,
    progressDetails: {
      completedCourses: '0/9',
      completedStages: '0/4',
      completedLessons: '0/110',
      totalTimeSpent: '0 giờ',
      lastStudied: 'Chưa học',
    },
    nextCourse: {
      id: 'uiux-fundamentals',
      title: 'UI/UX Design Fundamentals',
      currentLesson: 'Bài 1: Nguyên lý thiết kế giao diện số',
      iconBg: 'bg-teal-600',
    },
    stages: [
      {
        id: 1,
        title: 'Nguyên lý Thiết kế & User Research',
        description: 'Design Thinking, Quy trình xây dựng sản phẩm số.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'uiux-fundamentals',
            title: 'UI/UX Design Fundamentals',
            duration: '10 giờ',
            lessons: 40,
            level: 'Beginner',
            status: 'start',
            rating: 4.9,
            students: '21.5K',
            badgeBg: 'bg-teal-600 text-white font-black text-xs',
            badgeText: 'FIGMA',
          },
          {
            id: 'user-research-wireframing',
            title: 'User Research & Wireframing',
            duration: '8 giờ',
            lessons: 30,
            level: 'Beginner',
            status: 'start',
            rating: 4.8,
            students: '15.2K',
            badgeBg: 'bg-emerald-600 text-white font-black text-xs',
            badgeText: 'UX',
          },
        ],
      },
      {
        id: 2,
        title: 'Figma Component & Design System',
        description: 'Xây dựng bộ thư viện UI Component & Auto Layout chuẩn doanh nghiệp.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'figma-design-system',
            title: 'Figma UI Component & Design System',
            duration: '14 giờ',
            lessons: 50,
            level: 'Intermediate',
            status: 'start',
            rating: 4.9,
            students: '24.1K',
            badgeBg: 'bg-purple-600 text-white font-black text-xs',
            badgeText: 'DESIGN',
          },
        ],
      },
      {
        id: 3,
        title: 'Prototyping & Interactive Micro-Animations',
        description: 'Tạo bản mẫu tương tác sống động và chuyển động UI.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'figma-prototyping-animation',
            title: 'Interactive Prototyping in Figma',
            duration: '12 giờ',
            lessons: 35,
            level: 'Intermediate',
            status: 'start',
            rating: 4.8,
            students: '13.9K',
            badgeBg: 'bg-indigo-600 text-white font-black text-xs',
            badgeText: 'PROTO',
          },
        ],
      },
      {
        id: 4,
        title: 'Design Handoff & Product Analytics',
        description: 'Bàn giao thiết kế cho Developer và đo lường trải nghiệm người dùng.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'design-handoff-dev',
            title: 'Design Handoff & Dev Collaboration',
            duration: '8 giờ',
            lessons: 25,
            level: 'Advanced',
            status: 'start',
            rating: 4.9,
            students: '10.7K',
            badgeBg: 'bg-sky-600 text-white font-black text-xs',
            badgeText: 'HANDOFF',
          },
        ],
      },
    ],
  },
  fullstack: {
    title: 'Fullstack Developer',
    description:
      'Làm chủ cả Frontend và Backend để trở thành Fullstack Developer toàn diện.',
    stats: {
      stagesCount: 5,
      coursesCount: 20,
      lessonsCount: 280,
      totalHours: '200 giờ',
      level: 'Beginner → Advanced',
    },
    overallProgress: 0,
    progressDetails: {
      completedCourses: '0/20',
      completedStages: '0/5',
      completedLessons: '0/280',
      totalTimeSpent: '0 giờ',
      lastStudied: 'Chưa học',
    },
    nextCourse: {
      id: 'fullstack-frontend-core',
      title: 'HTML, CSS & Modern React',
      currentLesson: 'Bài 1: Xây dựng ứng dụng Web đầu tiên',
      iconBg: 'bg-rose-600',
    },
    stages: [
      {
        id: 1,
        title: 'Frontend Core & UI',
        description: 'Xây dựng giao diện web chuyên nghiệp.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'fullstack-frontend-core',
            title: 'HTML, CSS & Modern React',
            duration: '25 giờ',
            lessons: 90,
            level: 'Beginner',
            status: 'start',
            rating: 4.9,
            students: '35.1K',
            badgeBg: 'bg-rose-600 text-white font-black text-xs',
            badgeText: 'FULLSTACK',
          },
        ],
      },
      {
        id: 2,
        title: 'React.js & Next.js Frontend Framework',
        description: 'Làm chủ SSR, SSG và App Router với React & Next.js.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'fullstack-nextjs-app',
            title: 'Next.js App Router & Fullstack SSR',
            duration: '18 giờ',
            lessons: 60,
            level: 'Intermediate',
            status: 'start',
            rating: 4.9,
            students: '26.8K',
            badgeBg: 'bg-slate-900 text-white font-black text-xs',
            badgeText: 'NEXT',
          },
        ],
      },
      {
        id: 3,
        title: 'Backend API với Laravel & Node.js',
        description: 'Xây dựng hệ thống REST API & Microservices mạnh mẽ.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'fullstack-laravel-api',
            title: 'Laravel REST API & Database Integration',
            duration: '20 giờ',
            lessons: 70,
            level: 'Intermediate',
            status: 'start',
            rating: 4.9,
            students: '29.4K',
            badgeBg: 'bg-rose-600 text-white font-black text-xs',
            badgeText: 'LARAVEL',
          },
        ],
      },
      {
        id: 4,
        title: 'Database, Security & Authentication',
        description: 'Quản trị CSDL MySQL, PostgreSQL, JWT Authentication.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'database-auth-security',
            title: 'Relational DB & OAuth2 Authentication',
            duration: '14 giờ',
            lessons: 45,
            level: 'Advanced',
            status: 'start',
            rating: 4.8,
            students: '18.1K',
            badgeBg: 'bg-emerald-600 text-white font-black text-xs',
            badgeText: 'AUTH',
          },
        ],
      },
      {
        id: 5,
        title: 'Docker & DevOps Deployment',
        description: 'Đóng gói Docker Container, CI/CD Deployment lên Vercel & Cloud.',
        completedCount: 0,
        totalCount: 2,
        progressPercent: 0,
        courses: [
          {
            id: 'docker-devops-deployment',
            title: 'Fullstack CI/CD with Docker & Cloud',
            duration: '15 giờ',
            lessons: 40,
            level: 'Advanced',
            status: 'start',
            rating: 4.9,
            students: '15.3K',
            badgeBg: 'bg-sky-600 text-white font-black text-xs',
            badgeText: 'DEVOPS',
          },
        ],
      },
    ],
  },
};

export default function RoadmapDetailPage() {
  const { roadmapId } = useParams();
  const navigate = useNavigate();

  const baseRoadmap = useMemo(() => {
    const key = String(roadmapId || 'frontend').toLowerCase();
    if (key.includes('data')) return ROADMAP_DATA.data;
    if (key.includes('mobile')) return ROADMAP_DATA.mobile;
    if (key.includes('ui') || key.includes('ux')) return ROADMAP_DATA.uiux;
    if (key.includes('full') || key.includes('stack')) return ROADMAP_DATA.fullstack;
    if (key.includes('back')) return ROADMAP_DATA.backend;
    return ROADMAP_DATA[key as keyof typeof ROADMAP_DATA] || ROADMAP_DATA.frontend;
  }, [roadmapId]);

  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [catalogCourses, setCatalogCourses] = useState<any[]>([]);
  const [learningLogs, setLearningLogs] = useState<any[]>([]);
  const [recommendedPath, setRecommendedPath] = useState<any[]>([]);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Load stored enrollment and catalog data on mount / roadmapId change
  useEffect(() => {
    const storageKey = `mindhub_roadmap_detail_${roadmapId || 'frontend'}`;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.enrolledCourses) setEnrolledCourses(parsed.enrolledCourses);
        if (parsed?.catalogCourses) setCatalogCourses(parsed.catalogCourses);
      }
    } catch (e) {}

    const fetchData = async () => {
      setIsLoadingApi(true);
      try {
        const [myCourses, nextPaths, catCourses, logs] = await Promise.all([
          roadmapsApi.getMyCourses(),
          roadmapsApi.getNextLearningPath(),
          roadmapsApi.getCatalogCourses(),
          roadmapsApi.getLearningLogs(),
        ]);

        if (Array.isArray(myCourses) && myCourses.length > 0) {
          setEnrolledCourses(myCourses);
        }
        if (Array.isArray(catCourses) && catCourses.length > 0) {
          setCatalogCourses(catCourses);
        }
        if (Array.isArray(logs) && logs.length > 0) {
          setLearningLogs(logs);
        }
        if (Array.isArray(nextPaths) && nextPaths.length > 0) {
          setRecommendedPath(nextPaths);
        }

        try {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ enrolledCourses: myCourses, catalogCourses: catCourses })
          );
        } catch (e) {}
      } catch (err: any) {
        console.warn('API error loading roadmap details:', err?.message);
      } finally {
        setIsLoadingApi(false);
      }
    };

    fetchData();
  }, [roadmapId]);

  // Compute dynamic roadmap data by merging backend catalog and enrollment progress
  const dynamicRoadmap = useMemo(() => {
    const enrolledMap = new Map<string, any>();
    enrolledCourses.forEach((c: any) => {
      const key = String(c.slug || c.id || '').toLowerCase();
      enrolledMap.set(key, c);
      if (c.title) enrolledMap.set(String(c.title).toLowerCase(), c);
    });

    const catalogMap = new Map<string, any>();
    catalogCourses.forEach((c: any) => {
      const key = String(c.slug || c.id || '').toLowerCase();
      catalogMap.set(key, c);
      if (c.title) catalogMap.set(String(c.title).toLowerCase(), c);
    });

    // Helper to extract badge text
    const getBadgeText = (titleStr: string) => {
      const t = titleStr.toLowerCase();
      if (t.includes('html')) return 'HTML5';
      if (t.includes('css')) return 'CSS3';
      if (t.includes('react')) return 'REACT';
      if (t.includes('laravel')) return 'LARAVEL';
      if (t.includes('php')) return 'PHP';
      if (t.includes('sql')) return 'SQL';
      if (t.includes('python')) return 'PY';
      if (t.includes('flutter')) return 'FLUTTER';
      if (t.includes('figma')) return 'FIGMA';
      if (t.includes('javascript') || t.includes('js')) return 'JS';
      return titleStr.substring(0, 5).toUpperCase();
    };

    const getBadgeBg = (titleStr: string) => {
      const t = titleStr.toLowerCase();
      if (t.includes('laravel') || t.includes('php')) return 'bg-rose-600 text-white font-black text-xs';
      if (t.includes('sql') || t.includes('database')) return 'bg-emerald-600 text-white font-black text-xs';
      if (t.includes('react')) return 'bg-sky-500 text-white font-bold text-[10px]';
      if (t.includes('python')) return 'bg-amber-500 text-white font-black text-xs';
      if (t.includes('flutter')) return 'bg-sky-600 text-white font-black text-xs';
      if (t.includes('figma')) return 'bg-teal-600 text-white font-black text-xs';
      return 'bg-blue-600 text-white font-black text-xs';
    };

    let totalLessonsCount = 0;
    let completedLessonsCount = 0;
    let completedCoursesCount = 0;
    let totalCoursesCount = 0;
    let completedStagesCount = 0;

    let activeNextCourse: any = {
      ...baseRoadmap.nextCourse,
      badgeText: baseRoadmap.nextCourse?.title ? getBadgeText(baseRoadmap.nextCourse.title) : 'NEXT',
      iconBg: baseRoadmap.nextCourse?.iconBg || 'bg-blue-600',
    };

    // Always preserve the full curriculum layout from baseRoadmap.stages
    const updatedStages = baseRoadmap.stages.map((stage) => {
      let stageCompletedCount = 0;
      let stageTotalLessons = 0;
      let stageCompletedLessons = 0;

      const updatedCourses = stage.courses.map((course) => {
        totalCoursesCount += 1;

        // Match real backend catalog course if available
        const matchedCatalog = catalogMap.get(String(course.id).toLowerCase()) || catalogMap.get(String(course.title).toLowerCase());

        const isAvailableInDb = !!matchedCatalog;

        const lessonsInCourse = matchedCatalog?.lessons_count || matchedCatalog?.total_lessons || course.lessons || 20;
        const ratingVal = matchedCatalog?.rating || matchedCatalog?.reviews_avg_rating || course.rating || 4.8;
        const studentsVal = matchedCatalog?.students_count || matchedCatalog?.enrollments_count ? `${matchedCatalog.students_count || matchedCatalog.enrollments_count}` : course.students || '10K';
        const durationVal = matchedCatalog?.duration || course.duration || '8 giờ';
        const courseTitle = matchedCatalog?.title || course.title;

        stageTotalLessons += lessonsInCourse;
        totalLessonsCount += lessonsInCourse;

        const matchedEnrolled = enrolledMap.get(String(course.id).toLowerCase()) || enrolledMap.get(String(course.title).toLowerCase());

        let courseStatus = isAvailableInDb ? 'start' : 'in-development';
        let courseProgressPercent = 0;

        if (matchedEnrolled) {
          const pPercent = matchedEnrolled.progress_percent || matchedEnrolled.progress || 0;
          courseProgressPercent = pPercent;

          if (pPercent >= 100 || matchedEnrolled.status === 'completed') {
            courseStatus = 'completed';
            courseProgressPercent = 100;
            completedCoursesCount += 1;
            stageCompletedCount += 1;
            stageCompletedLessons += lessonsInCourse;
            completedLessonsCount += lessonsInCourse;
          } else if (pPercent > 0 || matchedEnrolled.status === 'in_progress') {
            courseStatus = 'in-progress';
            const calcCompleted = Math.round((lessonsInCourse * pPercent) / 100);
            stageCompletedLessons += calcCompleted;
            completedLessonsCount += calcCompleted;
            activeNextCourse = {
              id: course.id,
              title: courseTitle,
              currentLesson: `Đang học: ${pPercent}%`,
              iconBg: course.badgeBg || getBadgeBg(courseTitle),
              badgeText: course.badgeText || getBadgeText(courseTitle),
            };
          }
        }

        return {
          ...course,
          title: courseTitle,
          lessons: lessonsInCourse,
          rating: ratingVal,
          students: studentsVal,
          duration: durationVal,
          status: courseStatus,
          progressPercent: courseProgressPercent,
          badgeText: course.badgeText || getBadgeText(courseTitle),
          badgeBg: course.badgeBg || getBadgeBg(courseTitle),
          isAvailableInDb,
        };
      });

      const stageProgressPercent = stageTotalLessons > 0 ? Math.round((stageCompletedLessons / stageTotalLessons) * 100) : 0;
      if (stageProgressPercent >= 100) {
        completedStagesCount += 1;
      }

      return {
        ...stage,
        completedCount: stageCompletedCount,
        totalCount: stage.courses.length,
        progressPercent: stageProgressPercent,
        courses: updatedCourses,
      };
    });

    const overallPct = totalLessonsCount > 0 ? Math.round((completedLessonsCount / totalLessonsCount) * 100) : 0;

    // Real last studied date formatting from student's enrolled API data
    let realLastStudied = baseRoadmap.progressDetails.lastStudied;
    if (enrolledCourses.length > 0 && enrolledCourses[0]?.last_accessed_at) {
      try {
        const d = new Date(enrolledCourses[0].last_accessed_at);
        if (!isNaN(d.getTime())) {
          realLastStudied = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }
      } catch (e) {}
    } else if (learningLogs.length > 0 && learningLogs[0]?.created_at) {
      try {
        const d = new Date(learningLogs[0].created_at);
        if (!isNaN(d.getTime())) {
          realLastStudied = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }
      } catch (e) {}
    }

    return {
      ...baseRoadmap,
      stats: {
        ...baseRoadmap.stats,
        stagesCount: updatedStages.length,
        coursesCount: totalCoursesCount,
        lessonsCount: totalLessonsCount,
      },
      overallProgress: overallPct,
      progressDetails: {
        completedCourses: `${completedCoursesCount}/${totalCoursesCount}`,
        completedStages: `${completedStagesCount}/${updatedStages.length}`,
        completedLessons: `${completedLessonsCount}/${totalLessonsCount}`,
        totalTimeSpent: baseRoadmap.progressDetails.totalTimeSpent,
        lastStudied: realLastStudied,
      },
      nextCourse: activeNextCourse,
      stages: updatedStages,
    };
  }, [baseRoadmap, enrolledCourses, catalogCourses, learningLogs, roadmapId]);

  const roadmap = dynamicRoadmap;

  // Track expanded accordion stages
  const [openStages, setOpenStages] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: false,
    5: false,
  });

  const toggleStage = (stageId: number) => {
    setOpenStages((prev) => ({ ...prev, [stageId]: !prev[stageId] }));
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success('Đã chép liên kết lộ trình vào bộ nhớ tạm!');
  };

  return (
    <PageTransition>
      <div className="w-full bg-slate-50/60 min-h-screen py-6 px-4 sm:px-6 lg:px-8 font-sans text-slate-800">
        
        {/* CENTERED CONTAINER */}
        <div className="max-w-7xl mx-auto space-y-6">

          {/* 1. BREADCRUMB */}
          <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
            <Link to="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/roadmaps" className="hover:text-primary transition-colors">
              Lộ trình
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-semibold">{roadmap.title}</span>
          </nav>

          {/* 2. HERO HEADER BANNER CARD */}
          {(() => {
            const bannerTheme = (() => {
              switch (roadmapId) {
                case 'backend':
                  return {
                    icon: <Server className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600" />,
                    iconBg: 'bg-emerald-50 border-emerald-100',
                    filename: 'controller.php — MindHub',
                    badges: [
                      { text: 'PHP', bg: 'bg-indigo-600 text-white', pos: 'top-3 left-3 animate-bounce' },
                      { text: 'SQL', bg: 'bg-emerald-500 text-white', pos: 'top-12 left-2' },
                      { text: 'API', bg: 'bg-rose-500 text-white', pos: 'top-20 left-4' },
                    ],
                    codeLines: [
                      <span><span className="text-purple-400">&lt;?php</span></span>,
                      <span><span className="text-purple-400">use</span> App\Http\Controllers;</span>,
                      <span><span className="text-blue-400">class</span> <span className="text-yellow-300">BackendDevController</span> &#123;</span>,
                      <span className="pl-4"><span className="text-purple-400">public function</span> <span className="text-yellow-300">index</span>() &#123;</span>,
                      <span className="pl-8"><span className="text-purple-400">return</span> response()-&gt;json([<span className="text-emerald-300">'status'</span> =&gt; <span className="text-emerald-300">'ready'</span>]);</span>,
                      <span className="pl-4">&#125;</span>,
                      <span>&#125;</span>,
                    ],
                    techTag: 'PHP 8 + Laravel 11',
                  };
                case 'data':
                case 'data-engineer':
                  return {
                    icon: <Database className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />,
                    iconBg: 'bg-purple-50 border-purple-100',
                    filename: 'pipeline.py — MindHub',
                    badges: [
                      { text: 'PYTHON', bg: 'bg-amber-500 text-white', pos: 'top-3 left-3 animate-bounce' },
                      { text: 'SQL', bg: 'bg-blue-600 text-white', pos: 'top-12 left-2' },
                      { text: 'SPARK', bg: 'bg-orange-600 text-white', pos: 'top-20 left-4' },
                    ],
                    codeLines: [
                      <span><span className="text-purple-400">import</span> pandas <span className="text-purple-400">as</span> pd</span>,
                      <span><span className="text-purple-400">from</span> pyspark.sql <span className="text-purple-400">import</span> SparkSession</span>,
                      <span className="text-slate-400"># High volume Data Engineering pipeline</span>,
                      <span>df = spark.read.parquet(<span className="text-emerald-300">"s3://data-lake"</span>)</span>,
                      <span>df.groupBy(<span className="text-emerald-300">"category"</span>).count().show()</span>,
                    ],
                    techTag: 'Python + PySpark + SQL',
                  };
                case 'mobile':
                  return {
                    icon: <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-orange-600" />,
                    iconBg: 'bg-orange-50 border-orange-100',
                    filename: 'main.dart — MindHub',
                    badges: [
                      { text: 'DART', bg: 'bg-sky-500 text-white', pos: 'top-3 left-3 animate-bounce' },
                      { text: 'FLUTTER', bg: 'bg-blue-600 text-white', pos: 'top-12 left-2' },
                      { text: 'IOS/ANDROID', bg: 'bg-emerald-600 text-white', pos: 'top-20 left-4' },
                    ],
                    codeLines: [
                      <span><span className="text-purple-400">import</span> <span className="text-emerald-300">'package:flutter/material.dart'</span>;</span>,
                      <span><span className="text-blue-400">void</span> <span className="text-yellow-300">main</span>() =&gt; runApp(<span className="text-pink-400">MindHubApp</span>());</span>,
                      <span><span className="text-blue-400">class</span> <span className="text-yellow-300">MobileDev</span> <span className="text-purple-400">extends</span> StatelessWidget &#123;</span>,
                      <span className="pl-4">Widget build(BuildContext ctx) =&gt; <span className="text-pink-400">MaterialApp</span>();</span>,
                      <span>&#125;</span>,
                    ],
                    techTag: 'Flutter + React Native',
                  };
                case 'uiux':
                  return {
                    icon: <Palette className="w-7 h-7 sm:w-8 sm:h-8 text-teal-600" />,
                    iconBg: 'bg-teal-50 border-teal-100',
                    filename: 'tokens.css — MindHub',
                    badges: [
                      { text: 'FIGMA', bg: 'bg-teal-500 text-white', pos: 'top-3 left-3 animate-bounce' },
                      { text: 'UI', bg: 'bg-pink-600 text-white', pos: 'top-12 left-2' },
                      { text: 'UX', bg: 'bg-purple-600 text-white', pos: 'top-20 left-4' },
                    ],
                    codeLines: [
                      <span className="text-slate-400">/* Design System & Visual Aesthetics */</span>,
                      <span><span className="text-yellow-300">.ui-card--premium</span> &#123;</span>,
                      <span className="pl-4">background: <span className="text-emerald-300">var(--color-surface)</span>;</span>,
                      <span className="pl-4">border-radius: <span className="text-pink-400">16px</span>;</span>,
                      <span className="pl-4">box-shadow: <span className="text-purple-400">0 10px 30px rgba(0,0,0,0.1)</span>;</span>,
                      <span>&#125;</span>,
                    ],
                    techTag: 'Figma + Design Tokens',
                  };
                case 'fullstack':
                  return {
                    icon: <Layers className="w-7 h-7 sm:w-8 sm:h-8 text-rose-600" />,
                    iconBg: 'bg-rose-50 border-rose-100',
                    filename: 'fullstack.ts — MindHub',
                    badges: [
                      { text: 'REACT', bg: 'bg-sky-500 text-white', pos: 'top-3 left-3 animate-bounce' },
                      { text: 'LARAVEL', bg: 'bg-rose-600 text-white', pos: 'top-12 left-2' },
                      { text: 'DOCKER', bg: 'bg-blue-600 text-white', pos: 'top-20 left-4' },
                    ],
                    codeLines: [
                      <span><span className="text-purple-400">import</span> &#123; <span className="text-yellow-300">api</span> &#125; <span className="text-purple-400">from</span> <span className="text-emerald-300">'@/lib/api'</span>;</span>,
                      <span><span className="text-blue-400">async function</span> <span className="text-yellow-300">FullstackDev</span>() &#123;</span>,
                      <span className="pl-4">const res = <span className="text-purple-400">await</span> api.get(<span className="text-emerald-300">'/fullstack/overview'</span>);</span>,
                      <span className="pl-4"><span className="text-purple-400">return</span> &lt;<span className="text-pink-400">App</span> data=&#123;res.data&#125; /&gt;;</span>,
                      <span>&#125;</span>,
                    ],
                    techTag: 'React + Laravel + Docker',
                  };
                default:
                  return {
                    icon: <Code2 className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-600" />,
                    iconBg: 'bg-indigo-50 border-indigo-100',
                    filename: 'app.tsx — MindHub',
                    badges: [
                      { text: 'HTML', bg: 'bg-orange-500 text-white', pos: 'top-3 left-3 animate-bounce' },
                      { text: 'CSS', bg: 'bg-blue-500 text-white', pos: 'top-12 left-2' },
                      { text: 'JS', bg: 'bg-amber-400 text-slate-900', pos: 'top-20 left-4' },
                    ],
                    codeLines: [
                      <span><span className="text-purple-400">import</span> React <span className="text-purple-400">from</span> <span className="text-emerald-300">'react'</span>;</span>,
                      <span><span className="text-blue-400">function</span> <span className="text-yellow-300">FrontendDev</span>() &#123;</span>,
                      <span className="pl-4 text-slate-400">// Build modern web interfaces</span>,
                      <span className="pl-4"><span className="text-purple-400">return</span> &lt;<span className="text-pink-400">Roadmap</span> status=<span className="text-emerald-300">"ready"</span> /&gt;;</span>,
                      <span>&#125;</span>,
                    ],
                    techTag: '100% React + TS',
                  };
              }
            })();

            return (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm relative overflow-hidden">
                {/* Background subtle mesh grid / decorative light blob */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/60 rounded-full blur-3xl -z-0 pointer-events-none" />

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center relative z-10">
                  
                  {/* Left Column: Information & Actions */}
                  <div className="lg:col-span-7 space-y-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border flex items-center justify-center shrink-0 shadow-sm ${bannerTheme.iconBg}`}>
                        {bannerTheme.icon}
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                          {roadmap.title}
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed font-medium">
                          {roadmap.description}
                        </p>
                      </div>
                    </div>

                    {/* Badges Row */}
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-semibold text-slate-600 pt-1">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
                        <Users className="w-3.5 h-3.5 text-slate-500" />
                        <span>{roadmap.stats.stagesCount} Chặng học</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>{roadmap.stats.coursesCount} Khóa học</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
                        <FileText className="w-3.5 h-3.5 text-slate-500" />
                        <span>{roadmap.stats.lessonsCount} Bài học</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200/60">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>{roadmap.stats.totalHours} Thời lượng</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{roadmap.stats.level} Cấp độ</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        onClick={() => navigate(`/courses/${roadmap.nextCourse.id}`)}
                        className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
                      >
                        <PlayCircle className="w-4 h-4 fill-white text-emerald-500" />
                        <span>Tiếp tục học</span>
                      </button>

                      <button
                        onClick={handleShare}
                        className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm inline-flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4 text-slate-500" />
                        <span>Chia sẻ lộ trình</span>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Dynamic Illustration Mockup */}
                  <div className="lg:col-span-5 flex justify-center lg:justify-end">
                    <div className="relative w-full max-w-sm aspect-[4/3] rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 p-4 shadow-xl border border-slate-800 flex flex-col justify-between overflow-hidden">
                      
                      {/* Dynamic floating badges */}
                      {bannerTheme.badges.map((b, idx) => (
                        <div key={idx} className={`absolute ${b.pos} ${b.bg} font-black text-[11px] px-2.5 py-1 rounded-md shadow-md`}>
                          {b.text}
                        </div>
                      ))}

                      {/* Window Controls Topbar */}
                      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-slate-400 font-mono ml-2">{bannerTheme.filename}</span>
                      </div>

                      {/* Laptop Mock Code Content */}
                      <div className="font-mono text-[11px] space-y-1.5 text-slate-300 py-3 px-2">
                        {bannerTheme.codeLines.map((line, idx) => (
                          <div key={idx} className="flex gap-2">
                            <span className="text-slate-600">{idx + 1}</span>
                            {line}
                          </div>
                        ))}
                      </div>

                      {/* Bottom Bar */}
                      <div className="flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800/80 pt-2 px-1">
                        <span className="flex items-center gap-1 text-emerald-400"><Sparkles className="w-3 h-3" /> Ready for job</span>
                        <span>{bannerTheme.techTag}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* 3. TWO-COLUMN MAIN CONTENT (LEFT: TIMELINE STAGES, RIGHT: SIDEBAR SUMMARY) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* LEFT COLUMN: Các chặng trong lộ trình */}
            <div className="lg:col-span-8 space-y-6">
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Các chặng trong lộ trình
              </h2>

              {/* Accordion List */}
              <div className="space-y-4">
                {roadmap.stages.map((stage) => {
                  const isOpen = !!openStages[stage.id];

                  return (
                    <div
                      key={stage.id}
                      className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden transition-all"
                    >
                      {/* Accordion Header */}
                      <div
                        onClick={() => toggleStage(stage.id)}
                        className="p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-slate-50/70 transition-colors"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Number Badge */}
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-sm shrink-0 ${
                            stage.progressPercent === 100
                              ? 'bg-emerald-500 text-white'
                              : stage.progressPercent > 0
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}>
                            {stage.id}
                          </div>

                          <div className="space-y-1">
                            <h3 className="text-base font-extrabold text-slate-900">
                              {stage.title}
                            </h3>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                              {stage.description}
                            </p>
                          </div>
                        </div>

                        {/* Right side status progress & toggle icon */}
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right hidden sm:block">
                            <span className="text-xs font-bold text-slate-600">
                              {stage.completedCount}/{stage.totalCount} khóa học • {stage.progressPercent}%
                            </span>
                            <div className="w-28 h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  stage.progressPercent === 100 ? 'bg-emerald-500' : 'bg-blue-600'
                                }`}
                                style={{ width: `${stage.progressPercent}%` }}
                              />
                            </div>
                          </div>

                          <button className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                            {isOpen ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Accordion Body: Course List */}
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-3">
                          {stage.courses.map((course) => (
                            <div
                              key={course.id}
                              className="p-4 rounded-xl bg-slate-50/70 border border-slate-200/60 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-start gap-3.5">
                                {/* Course Badge Icon */}
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${course.badgeBg}`}>
                                  {course.badgeText}
                                </div>

                                <div className="space-y-1">
                                  <h4
                                    className="text-sm font-extrabold text-slate-900 hover:text-blue-600 cursor-pointer"
                                    onClick={() => {
                                      if (course.status === 'in-development') {
                                        toast.info(`Khóa học "${course.title}" đang trong quá trình đóng gói và sắp ra mắt!`);
                                      } else {
                                        navigate(`/courses/${course.id}`);
                                      }
                                    }}
                                  >
                                    {course.title}
                                  </h4>
                                  
                                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium">
                                    <span>{course.duration}</span>
                                    <span>•</span>
                                    <span>{course.lessons} bài học</span>
                                    <span>•</span>
                                    <span>{course.level}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Course Right Action & Rating */}
                              <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/60">
                                
                                {/* Status Pill / Button */}
                                {course.status === 'completed' && (
                                  <span className="px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-700 text-xs font-bold border border-emerald-200/80">
                                    Hoàn thành
                                  </span>
                                )}

                                {course.status === 'in-progress' && (
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
                                      Đang học
                                    </span>
                                    <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                      <div
                                        className="h-full bg-blue-600 rounded-full"
                                        style={{ width: `${course.progressPercent || 50}%` }}
                                      />
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">{course.progressPercent}%</span>
                                  </div>
                                )}

                                {course.status === 'start' && (
                                  <button
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                    className="px-4 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Bắt đầu học
                                  </button>
                                )}

                                {course.status === 'not-started' && (
                                  <button
                                    onClick={() => navigate(`/courses/${course.id}`)}
                                    className="px-4 py-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs font-bold transition-colors cursor-pointer"
                                  >
                                    Chưa bắt đầu
                                  </button>
                                )}

                                {course.status === 'in-development' && (
                                  <button
                                    onClick={() => toast.info(`Khóa học "${course.title}" đang trong quá trình đóng gói và sắp ra mắt!`)}
                                    className="px-3.5 py-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100 text-xs font-bold transition-colors cursor-pointer inline-flex items-center gap-1.5 shrink-0"
                                  >
                                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                                    <span>Đang triển khai</span>
                                  </button>
                                )}

                                {/* Rating & Students */}
                                <div className="flex items-center gap-2 text-xs text-slate-600 font-semibold">
                                  <span className="flex items-center gap-1 text-amber-500">
                                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                                    {course.rating}
                                  </span>
                                  <span className="flex items-center gap-1 text-slate-400">
                                    <Users className="w-3.5 h-3.5" />
                                    {course.students}
                                  </span>
                                </div>
                              </div>

                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* RIGHT COLUMN: SIDEBAR SUMMARY (CANH GIỮA & DỄ NHÌN) */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
              
              {/* CARD 1: TỔNG QUAN LỘ TRÌNH */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-5">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Tổng quan lộ trình
                </h3>

                {/* Circular Progress Gauge */}
                <div className="flex items-center gap-4 py-2">
                  <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-emerald-500"
                        strokeDasharray={`${roadmap.overallProgress}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-base font-black text-slate-900">
                      {roadmap.overallProgress}%
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-900">Tiến độ hoàn thành</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      Cố gắng lên! Bạn đang học rất tốt.
                    </p>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-center">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <div className="text-xs sm:text-sm font-black text-slate-900">
                      {roadmap.progressDetails.completedCourses}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                      Khóa học hoàn thành
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl">
                    <div className="text-xs sm:text-sm font-black text-slate-900">
                      {roadmap.progressDetails.completedStages}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                      Chặng học hoàn thành
                    </div>
                  </div>

                  <div className="p-2 bg-slate-50 rounded-xl">
                    <div className="text-xs sm:text-sm font-black text-slate-900">
                      {roadmap.progressDetails.completedLessons}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5 leading-tight">
                      Bài học đã hoàn thành
                    </div>
                  </div>
                </div>

                {/* Time & Last Studied Footer */}
                <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-100 pt-3">
                  <div>
                    <div className="font-extrabold text-slate-900">
                      {roadmap.progressDetails.totalTimeSpent}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Tổng thời gian học</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-slate-900">
                      {roadmap.progressDetails.lastStudied}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">Học gần nhất</div>
                  </div>
                </div>

              </div>

              {/* CARD 2: KHÓA HỌC TIẾP THEO */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Khóa học tiếp theo
                </h3>

                <div className="flex items-center gap-3.5 p-3 rounded-xl bg-blue-50/60 border border-blue-100">
                  <div className={`w-10 h-10 rounded-lg text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm ${roadmap.nextCourse.iconBg || 'bg-blue-600'}`}>
                    {roadmap.nextCourse.badgeText || (roadmap.nextCourse.title ? roadmap.nextCourse.title.substring(0, 5).toUpperCase() : 'NEXT')}
                  </div>
                  <div className="space-y-0.5 overflow-hidden">
                    <h4 className="text-xs font-extrabold text-slate-900 truncate">
                      {roadmap.nextCourse.title}
                    </h4>
                    <p className="text-[11px] text-slate-500 font-medium truncate">
                      {roadmap.nextCourse.currentLesson}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/courses/${roadmap.nextCourse.id}`)}
                  className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-blue-600 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Tiếp tục học</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* CARD 3: DANH SÁCH CHẶNG */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                  Danh sách chặng
                </h3>

                <div className="space-y-2.5 text-xs font-semibold">
                  {roadmap.stages.map((stg) => (
                    <div
                      key={stg.id}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                            stg.progressPercent === 100
                              ? 'bg-emerald-500 text-white'
                              : stg.progressPercent > 0
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {stg.id}
                        </span>
                        <span className="text-slate-700 font-bold truncate">{stg.title}</span>
                      </div>
                      <span
                        className={`text-[11px] font-bold ${
                          stg.progressPercent === 100
                            ? 'text-emerald-600'
                            : stg.progressPercent > 0
                            ? 'text-blue-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {stg.progressPercent}%
                      </span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => {
                    const el = document.querySelector('h2');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold text-center transition-colors cursor-pointer mt-2"
                >
                  Xem toàn bộ lộ trình
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </PageTransition>
  );
}

