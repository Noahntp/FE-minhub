import { useState, useEffect } from 'react';
import { Course } from '@/shared/types';
import { INITIAL_COURSES } from '@/shared/data';

interface UseCourseDetailResult {
  course: Course | null;
  isLoading: boolean;
  error: Error | null;
}

// Fallback map for custom slug-based course IDs from Homepage & Catalog
export const FALLBACK_COURSES_MAP: Record<string, Partial<Course>> = {
  'laravel-rest-api': {
    id: 'laravel-rest-api',
    title: 'Laravel REST API từ cơ bản đến triển khai',
    subtitle: 'Khóa học dành cho người mới bắt đầu, giúp bạn nắm vững kiến thức nền tảng Laravel REST API từ cơ bản đến thực hành, dễ hiểu, dễ áp dụng.',
    description: '<p>Laravel là PHP Framework số 1 hiện nay với cú pháp thanh lịch và khả năng mở rộng mạnh mẽ. Khóa học này hướng dẫn bạn từng bước thiết kế RESTful API chuẩn quốc tế, tích hợp JWT Authentication, Eloquent ORM và triển khai lên Server thực tế.</p>',
    category: 'Development',
    subcategory: 'Backend',
    instructorId: 'inst-1',
    instructorName: 'Nguyễn Văn A',
    instructorTitle: 'Senior Backend Architect tại MindHub',
    instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
    instructorBio: 'Giảng viên với 10 năm kinh nghiệm phát triển phần mềm PHP/Laravel cho hàng chục tập đoàn công nghệ lớn.',
    price: 499000,
    salePrice: 299000,
    rating: 4.8,
    reviewCount: 1234,
    enrolledCount: 12400,
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
    willLearn: [
      'Hiểu và thiết kế kiến thức RESTful API chuẩn quốc tế',
      'Xử lý Authentication & Authorization bảo mật với JWT / Sanctuam',
      'Làm việc với Eloquent ORM, Migration, Seeder và Relationships',
      'Xây dựng dự án Backend thực tế và tối ưu hiệu năng Query SQL',
      'Tự tin viết API tích hợp với các ứng dụng Frontend React/Vue/Mobile',
      'Triển khai ứng dụng Laravel REST API lên môi trường Production VPS/Docker'
    ],
    status: 'active',
    chapters: [
      {
        id: 'ch1',
        title: 'Chương 1: Tổng quan về RESTful API & Laravel Framework',
        lessons: [
          { id: 'l1', title: '1.1 RESTful API là gì? Các chuẩn HTTP Methods & Status Codes', type: 'video', duration: '10:15', isPreview: true, videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4' },
          { id: 'l2', title: '1.2 Khởi tạo dự án Laravel 11 & Cấu hình môi trường .env', type: 'video', duration: '14:30', isPreview: true, videoUrl: 'https://www.w3schools.com/html/movie.mp4' },
          { id: 'l3', title: '1.3 Tạo API Controller & Định tuyến API Routes đầu tiên', type: 'video', duration: '12:45', isPreview: false }
        ]
      },
      {
        id: 'ch2',
        title: 'Chương 2: Thiết kế Database & Eloquent ORM',
        lessons: [
          { id: 'l4', title: '2.1 Thiết kế Schema Database với Laravel Migrations', type: 'video', duration: '15:20', isPreview: false },
          { id: 'l5', title: '2.2 Tạo Model & Relationships (One-to-Many, Many-to-Many)', type: 'video', duration: '18:10', isPreview: false },
          { id: 'l6', title: '2.3 Giả lập dữ liệu mẫu với Factories & Seeders', type: 'video', duration: '11:50', isPreview: false }
        ]
      },
      {
        id: 'ch3',
        title: 'Chương 3: Bảo mật Authentication với Laravel Sanctum & JWT',
        lessons: [
          { id: 'l7', title: '3.1 Xây dựng API Đăng ký & Đăng nhập cho người dùng', type: 'video', duration: '20:15', isPreview: false },
          { id: 'l8', title: '3.2 Quản lý Access Tokens & Refresh Tokens', type: 'video', duration: '16:40', isPreview: false }
        ]
      }
    ]
  },
  'php-mysql-backend': {
    id: 'php-mysql-backend',
    title: 'PHP & MySQL nền tảng cho Backend',
    subtitle: 'Nắm vững tư duy lập trình web server với PHP thuần và cơ sở dữ liệu MySQL.',
    description: '<p>Trang bị nền tảng cực kỳ vững chắc về PHP 8 và MySQL cho bất kỳ lập trình viên Backend nào.</p>',
    category: 'Development',
    subcategory: 'Backend',
    instructorId: 'inst-2',
    instructorName: 'Trần Minh Đức',
    instructorTitle: 'Senior PHP Specialist',
    instructorAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&q=80',
    instructorBio: 'Hơn 8 năm kinh nghiệm đào tạo lập trình Backend web.',
    price: 399000,
    rating: 4.6,
    reviewCount: 980,
    enrolledCount: 8900,
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
    willLearn: [
      'Cú pháp PHP 8 hiện đại và lập trình hướng đối tượng (OOP)',
      'Truy vấn MySQL từ cơ bản tới các câu lệnh JOIN phức tạp',
      'Bảo mật ứng dụng web tránh các lỗ hổng SQL Injection, XSS'
    ],
    status: 'active',
    chapters: []
  },
  'react-frontend-elearning': {
    id: 'react-frontend-elearning',
    title: 'React Frontend cho trang E-learning',
    subtitle: 'Xây dựng giao diện ứng dụng E-learning hiện đại với React, TypeScript và Tailwind CSS.',
    description: '<p>Khóa học thực chiến giúp bạn làm chủ React 18, React Router v6, Redux Toolkit và Tailwind CSS.</p>',
    category: 'Development',
    subcategory: 'Frontend',
    instructorId: 'inst-3',
    instructorName: 'Lê Hoàng Nam',
    instructorTitle: 'Lead Frontend Engineer',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
    instructorBio: 'Kỹ sư Frontend có hơn 7 năm kinh nghiệm với React & Next.js.',
    price: 449000,
    rating: 4.7,
    reviewCount: 860,
    enrolledCount: 7600,
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80',
    willLearn: [
      'Xây dựng giao diện web phản hồi nhanh (Responsive Design)',
      'Quản lý State phức tạp và kết nối REST API mượt mà',
      'Tối ưu hóa hiệu năng ứng dụng React với Custom Hooks'
    ],
    status: 'active',
    chapters: []
  },
  'ai-learning-assistant': {
    id: 'ai-learning-assistant',
    title: 'AI Learning Assistant & Generative AI Agents',
    subtitle: 'Xây dựng trợ lý học tập AI thông minh tích hợp LLM OpenAI, Anthropic Claude và LangChain.',
    description: '<p>Khóa học hướng dẫn bạn từng bước tích hợp Trí Tuệ Nhân Tạo vào sản phẩm Web, tạo AI Tutor giải đáp thắc mắc và tự động hóa lộ trình học tập cho học viên.</p>',
    category: 'Development',
    subcategory: 'Artificial Intelligence',
    instructorId: 'inst-1',
    instructorName: 'Dr. Lê Quốc Khánh',
    instructorTitle: 'Cựu Kỹ sư Google Brain',
    instructorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&q=80',
    instructorBio: 'Chuyên gia AI hàng đầu với hơn 12 năm kinh nghiệm nghiên cứu và phát triển Generative AI.',
    price: 699000,
    salePrice: 499000,
    rating: 4.9,
    reviewCount: 1540,
    enrolledCount: 18500,
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80',
    willLearn: [
      'Xây dựng AI Agent cá nhân hóa lộ trình học tập bằng LangChain & LlamaIndex',
      'Tích hợp OpenAI GPT-4o API & Anthropic Claude 3.5 Sonnet',
      'Kỹ thuật Prompt Engineering chuyên sâu và RAG (Retrieval-Augmented Generation)',
      'Triển khai AI Chatbot trợ giảng tự động trả lời 24/7'
    ],
    status: 'active',
    chapters: []
  }
};

export function useCourseDetail(courseId: string | undefined): UseCourseDetailResult {
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    if (!courseId) {
      setIsLoading(false);
      setError(new Error('Course ID is missing'));
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!isMounted) return;

      // 1. Check in INITIAL_COURSES by ID exact match
      let foundCourse = INITIAL_COURSES.find(c => c.id === courseId);

      // 2. Check in FALLBACK_COURSES_MAP if custom slug ID (e.g. laravel-rest-api)
      if (!foundCourse && FALLBACK_COURSES_MAP[courseId]) {
        const fallback = FALLBACK_COURSES_MAP[courseId];
        foundCourse = {
          id: courseId,
          title: fallback.title || 'Khóa học lập trình thực chiến',
          subtitle: fallback.subtitle || 'Khóa học giúp bạn làm chủ kiến thức từ cơ bản đến ứng dụng nâng cao.',
          description: fallback.description || '<p>Nội dung khóa học được biên soạn chi tiết bám sát nhu cầu thực tế của doanh nghiệp.</p>',
          category: fallback.category || 'Development',
          subcategory: fallback.subcategory || 'General',
          instructorId: fallback.instructorId || 'inst-1',
          instructorName: fallback.instructorName || 'Nguyễn Văn A',
          instructorTitle: fallback.instructorTitle || 'Giảng viên MindHub',
          instructorAvatar: fallback.instructorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
          instructorBio: fallback.instructorBio || 'Hơn 8 năm kinh nghiệm giảng dạy và phát triển ứng dụng.',
          price: fallback.price || 499000,
          salePrice: fallback.salePrice || 299000,
          rating: fallback.rating || 4.8,
          reviewCount: fallback.reviewCount || 1234,
          enrolledCount: fallback.enrolledCount || 12400,
          completionRate: 85,
          isFeatured: true,
          isBestseller: true,
          isNew: false,
          image: fallback.image || 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80',
          requirements: ['Máy tính có kết nối Internet', 'Đam mê học tập và thực hành'],
          willLearn: fallback.willLearn || [
            'Nắm vững kiến thức nền tảng từ cơ bản đến nâng cao',
            'Thực hành làm dự án thực tế để ghi vào CV',
            'Tự tin ứng tuyển công việc lập trình viên'
          ],
          status: 'active',
          chapters: fallback.chapters && fallback.chapters.length > 0 ? fallback.chapters : [
            {
              id: 'ch1',
              title: 'Chương 1: Giới thiệu và thiết lập môi trường',
              lessons: [
                { id: 'l1', title: '1.1 Tổng quan về khóa học', type: 'video', duration: '08:30', isPreview: true },
                { id: 'l2', title: '1.2 Cài đặt phần mềm cần thiết', type: 'video', duration: '12:15', isPreview: true }
              ]
            },
            {
              id: 'ch2',
              title: 'Chương 2: Kiến thức cốt lõi & Thực hành',
              lessons: [
                { id: 'l3', title: '2.1 Các khái niệm quan trọng', type: 'video', duration: '15:45', isPreview: false },
                { id: 'l4', title: '2.2 Viết đoạn chương trình đầu tiên', type: 'video', duration: '20:10', isPreview: false }
              ]
            }
          ]
        };
      }

      // 3. Dynamic generic fallback for any unknown ID (e.g. custom IDs)
      if (!foundCourse) {
        const cleanTitle = courseId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        foundCourse = {
          id: courseId,
          title: cleanTitle,
          subtitle: `Khóa học ${cleanTitle} từ cơ bản đến nâng cao cho người mới bắt đầu.`,
          description: `<p>Khóa học ${cleanTitle} mang lại nền tảng vững chắc và giúp bạn làm chủ công nghệ nhanh chóng.</p>`,
          category: 'Development',
          subcategory: 'Web Development',
          instructorId: 'inst-1',
          instructorName: 'Nguyễn Văn A',
          instructorTitle: 'Giảng viên MindHub',
          instructorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&q=80',
          instructorBio: 'Chuyên gia giàu kinh nghiệm tại MindHub.',
          price: 499000,
          salePrice: 299000,
          rating: 4.8,
          reviewCount: 950,
          enrolledCount: 8600,
          completionRate: 85,
          isFeatured: true,
          isBestseller: true,
          isNew: false,
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
          requirements: ['Máy tính cá nhân', 'Kiến thức cơ bản'],
          willLearn: [
            `Làm chủ kiến thức cốt lõi của ${cleanTitle}`,
            'Thực hành làm dự án thực tế',
            'Tự tin áp dụng vào công việc hàng ngày'
          ],
          status: 'active',
          chapters: [
            {
              id: 'ch1',
              title: 'Chương 1: Giới thiệu khóa học',
              lessons: [
                { id: 'l1', title: '1.1 Khái niệm cơ bản', type: 'video', duration: '08:00', isPreview: true },
                { id: 'l2', title: '1.2 Hướng dẫn thực hành', type: 'video', duration: '14:20', isPreview: true }
              ]
            }
          ]
        };
      }

      if (isMounted) {
        setCourse(foundCourse);
        setIsLoading(false);
      }
    }, 200); // 200ms latency for smooth transition

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [courseId]);

  return { course, isLoading, error };
}
