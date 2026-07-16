/**
 * Mock Data & Logic cho Module ADM-05: Kiểm duyệt khóa học (Course Reviews)
 * Phù hợp 100% với API Contract MindHub Backend.
 */

export const MOCK_COURSE_REVIEWS = [
  {
    id: 1010,
    title: "AWS Certified Solutions Architect Thực Chiến",
    slug: "aws-certified-solutions-architect-thuc-chien",
    short_description: "Luyện thi chứng chỉ AWS Architect Associate C03 với các bài lab thực tế về VPC, EC2, S3, RDS, Serverless và IAM security.",
    description: "<p>Khóa học thiết kế chuẩn khung kiến thức AWS. Giúp học viên nắm vững hạ tầng điện toán đám mây và thi đạt chứng chỉ quốc tế.</p>",
    thumbnail_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80",
    price: 1890000,
    sale_price: 1390000,
    level: "advanced",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 54000,
    created_at: "2026-07-13T09:30:00+07:00",
    updated_at: "2026-07-14T08:15:00+07:00",
    instructor: {
      id: 10,
      full_name: "Phạm Quốc Bảo",
      email: "bao.pq@mindhub.edu.vn",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      title: "AWS Certified Lead Solutions Architect",
      status: "active"
    },
    sections: [
      {
        id: 10101,
        title: "Chương 1: Tổng quan VPC & Networking trên AWS",
        order: 1,
        lesson_count: 3,
        total_duration_seconds: 10800,
        lessons: [
          { id: 1, title: "1.1 Giới thiệu kiến trúc VPC & Subnets", order: 1, type: "video", duration_seconds: 3600, is_preview: true },
          { id: 2, title: "1.2 Cấu hình Route Tables & Internet Gateways", order: 2, type: "video", duration_seconds: 3600, is_preview: false },
          { id: 3, title: "1.3 Lab thực hành tạo VPC tùy chỉnh", order: 3, type: "document", duration_seconds: 3600, is_preview: false }
        ]
      }
    ],
    checklist: {
      passed: true,
      summary: "Khóa học đầy đủ thông tin và đạt chuẩn kiểm duyệt.",
      missing_items: [],
      warnings: [],
      checks: [
        { name: "Video giới thiệu khóa học", passed: true, message: "Đã upload video giới thiệu." },
        { name: "Số lượng bài học tối thiểu (>= 5)", passed: true, message: "Đạt chuẩn." },
        { name: "Thời lượng video (>= 2 giờ)", passed: true, message: "Đạt chuẩn." },
        { name: "Thông tin giảng viên", passed: true, message: "Đã xác minh." }
      ]
    }
  },
  {
    id: 101,
    title: "Laravel REST API & Microservices Thực Chiến",
    slug: "laravel-rest-api-microservices-thuc-chien",
    short_description:
      "Xây dựng hệ thống API quy mô lớn với Laravel 11, Passport, Redis và Docker từ con số 0.",
    description:
      "<p>Khóa học thiết kế chuyên sâu giúp bạn làm chủ quy trình phát triển RESTful API chuẩn doanh nghiệp. Học viên sẽ được thực hành qua các bài lab thực tế: từ xác thực Sanctum/Passport, tối ưu câu lệnh Eloquent ORM, cấu hình Redis Caching, queue xử lý bất đồng bộ đến đóng gói ứng dụng với Docker Containers.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80",
    price: 1490000,
    sale_price: 990000,
    level: "advanced",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 46800, // 13 giờ 00 phút
    created_at: "2026-07-08T09:20:00+07:00",
    updated_at: "2026-07-12T14:15:00+07:00",
    instructor: {
      id: 12,
      full_name: "ThS. Nguyễn Văn Anh",
      email: "anhnv.tech@mindhub.edu.vn",
      avatar_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      title: "Senior Backend Architect @ FPT Software",
      status: "active",
    },
    sections: [
      {
        id: 1001,
        title: "Chương 1: Kiến trúc RESTful API & Cấu hình môi trường",
        order: 1,
        lesson_count: 4,
        total_duration_seconds: 7200,
        lessons: [
          {
            id: 1,
            title: "1.1 Giới thiệu tổng quan & Chuẩn RESTful API 2026",
            order: 1,
            type: "video",
            duration_seconds: 1200,
            is_preview: true,
          },
          {
            id: 2,
            title: "1.2 Thiết lập Laravel 11 & Docker Compose",
            order: 2,
            type: "video",
            duration_seconds: 2400,
            is_preview: false,
          },
          {
            id: 3,
            title: "1.3 Tối ưu hóa Database Schema & Migrations",
            order: 3,
            type: "video",
            duration_seconds: 1800,
            is_preview: false,
          },
          {
            id: 4,
            title: "1.4 Tài liệu hướng dẫn cài đặt môi trường",
            order: 4,
            type: "document",
            duration_seconds: 1800,
            is_preview: false,
          },
        ],
      },
      {
        id: 1002,
        title: "Chương 2: Authentication & Authorization với Passport",
        order: 2,
        lesson_count: 5,
        total_duration_seconds: 14400,
        lessons: [
          {
            id: 5,
            title: "2.1 JWT vs OAuth2 Passport trong Laravel",
            order: 1,
            type: "video",
            duration_seconds: 1800,
            is_preview: true,
          },
          {
            id: 6,
            title: "2.2 Cấu hình Access Token & Refresh Token",
            order: 2,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 7,
            title: "2.3 Phân quyền chi tiết với Spatie Permission",
            order: 3,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 8,
            title: "2.4 Đăng nhập đa nền tảng Google & GitHub",
            order: 4,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 9,
            title: "2.5 Quiz kiểm tra lý thuyết OAuth2",
            order: 5,
            type: "quiz",
            duration_seconds: 1800,
            is_preview: false,
          },
        ],
      },
      {
        id: 1003,
        title: "Chương 3: Cấu trúc Microservices & Redis Message Queue",
        order: 3,
        lesson_count: 5,
        total_duration_seconds: 25200,
        lessons: [
          {
            id: 10,
            title: "3.1 Khái niệm Message Broker & RabbitMQ/Redis",
            order: 1,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 11,
            title: "3.2 Tối ưu Cache với Redis Sentinel",
            order: 2,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 12,
            title: "3.3 Xây dựng Service Discovery đơn giản",
            order: 3,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 13,
            title: "3.4 Deploy ứng dụng lên Kubernetes Cluster",
            order: 4,
            type: "video",
            duration_seconds: 7200,
            is_preview: false,
          },
          {
            id: 14,
            title: "3.5 Đồ án tốt nghiệp khóa học",
            order: 5,
            type: "document",
            duration_seconds: 3600,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: true,
      summary:
        "Khóa học đáp ứng đầy đủ tất cả 6 tiêu chí kiểm duyệt chuẩn của hệ thống.",
      missing_items: [],
      warnings: [
        "Ảnh thumbnail độ phân giải 720p (khuyến nghị nâng cấp 1080p để đạt hiệu năng tốt hơn).",
      ],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: true,
          message: "Đã upload video giới thiệu độ dài 2 phút 30 giây.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: true,
          message: "Khóa học hiện có 14 bài học (Đạt chuẩn).",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Tổng thời lượng đạt 13 giờ 00 phút (Đạt chuẩn).",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: true,
          message: "Mô tả chi tiết và rõ ràng các kĩ năng học viên thu được.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: true,
          message: "Đã bật 2 bài học học thử miễn phí cho học viên.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: true,
          message: "Giảng viên đã xác minh danh tính và bằng cấp thành công.",
        },
      ],
    },
  },
  {
    id: 102,
    title: "React 19 & TypeScript Chuyên Sâu từ Zero đến Hero",
    slug: "react-19-typescript-chuyen-sau-zero-hero",
    short_description:
      "Làm chủ React Server Components, Server Actions, Zustand và Tailwind CSS v4.",
    description:
      "<p>Khóa học cập nhật các tính năng mới nhất của React 19 vừa ra mắt. Học viên sẽ học cách kết hợp TypeScript strict typechecking, xây dựng custom hooks tái sử dụng, quản lý global state mượt mà với Zustand và thiết kế UI đẳng cấp theo phong cách SaaS Minimalism.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80",
    price: 1290000,
    sale_price: 890000,
    level: "intermediate",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 36000, // 10 giờ 00 phút
    created_at: "2026-07-09 10:45:00",
    updated_at: "2026-07-13 08:30:00",
    instructor: {
      id: 18,
      full_name: "Trần Minh Hoàng",
      email: "hoangtm.frontend@gmail.com",
      avatar_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      title: "Frontend Lead @ VNG Corporation",
      status: "active",
    },
    sections: [
      {
        id: 1004,
        title: "Chương 1: TypeScript Căn Bản Đến Nâng Cao Cho Dev React",
        order: 1,
        lesson_count: 3,
        total_duration_seconds: 10800,
        lessons: [
          {
            id: 15,
            title: "1.1 Why TypeScript in 2026?",
            order: 1,
            type: "video",
            duration_seconds: 1800,
            is_preview: true,
          },
          {
            id: 16,
            title: "1.2 Generics, Utility Types & Type Narrowing",
            order: 2,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 17,
            title: "1.3 Typing React Props, Events & Refs",
            order: 3,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
        ],
      },
      {
        id: 1005,
        title: "Chương 2: React 19 Core Features & Hooks",
        order: 2,
        lesson_count: 4,
        total_duration_seconds: 25200,
        lessons: [
          {
            id: 18,
            title: "2.1 useActionState & useOptimistic Hooks",
            order: 1,
            type: "video",
            duration_seconds: 5400,
            is_preview: true,
          },
          {
            id: 19,
            title: "2.2 Server Components vs Client Components",
            order: 2,
            type: "video",
            duration_seconds: 7200,
            is_preview: false,
          },
          {
            id: 20,
            title: "2.3 Tối ưu re-render với use() API & Compiler",
            order: 3,
            type: "video",
            duration_seconds: 7200,
            is_preview: false,
          },
          {
            id: 21,
            title: "2.4 Thực hành xây dựng Dashboard UI",
            order: 4,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: true,
      summary: "Khóa học đạt chuẩn chất lượng kiểm duyệt.",
      missing_items: [],
      warnings: [],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: true,
          message: "Đã có video giới thiệu chất lượng HD 1080p.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: true,
          message: "Khóa học có 7 bài học.",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Tổng thời lượng 10 giờ 00 phút.",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: true,
          message: "Đầy đủ thông tin mục tiêu học tập.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: true,
          message: "Có 2 bài học mở xem trước.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: true,
          message: "Tài khoản giảng viên đã xác thực.",
        },
      ],
    },
  },
  {
    id: 103,
    title: "Thiết Kế Đồ Họa & UI/UX Đa Nền Tảng Với Figma 2026",
    slug: "thiet-ke-do-hoa-ui-ux-voi-figma-2026",
    short_description:
      "Tạo Design System, Auto-Layout v5, Prototyping và bàn giao sản phẩm cho Developer.",
    description:
      "<p>Hướng dẫn thực tế thiết kế giao diện ứng dụng di động iOS/Android và Web App hiện đại. Học viên thực hành tạo bộ UI Kit chuyên nghiệp, quản lý Token màu sắc và thiết kế các hiệu ứng tương tác cao cấp.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=600&auto=format&fit=crop&q=80",
    price: 990000,
    sale_price: null,
    level: "beginner",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 18000, // 5 giờ 00 phút
    created_at: "2026-07-11 16:10:00",
    updated_at: "2026-07-13 11:20:00",
    instructor: {
      id: 25,
      full_name: "Lê Thị Thảo Linh",
      email: "linhltt.design@gmail.com",
      avatar_url:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      title: "Product Designer @ Grab Thailand",
      status: "active",
    },
    sections: [
      {
        id: 1006,
        title: "Chương 1: Figma Fundamentals & Variables System",
        order: 1,
        lesson_count: 3,
        total_duration_seconds: 18000,
        lessons: [
          {
            id: 22,
            title: "1.1 Tổng quan công cụ Figma & Plugin cần thiết",
            order: 1,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 23,
            title: "1.2 Tạo Variables Color, Mode Dark/Light",
            order: 2,
            type: "video",
            duration_seconds: 7200,
            is_preview: false,
          },
          {
            id: 24,
            title: "1.3 Auto Layout 5.0 & Smart Animate",
            order: 3,
            type: "video",
            duration_seconds: 7200,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: false,
      summary:
        "Phát hiện 2 mục bắt buộc chưa đạt tiêu chuẩn kiểm duyệt của MindHub.",
      missing_items: [
        "Chưa có video giới thiệu khóa học (Promo Video)",
        "Chưa bật bất kỳ bài học nào ở chế độ Học thử (Preview Lesson)",
      ],
      warnings: [
        "Số lượng bài học chỉ có 3 bài (khuyến nghị tách nhỏ thành ít nhất 5-10 bài học).",
      ],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: false,
          message: "Thiếu promo video giới thiệu.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: false,
          message: "Hiện chỉ có 3 bài học (Cần bổ sung).",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Thời lượng đạt 5 giờ 00 phút.",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: true,
          message: "Mô tả ngắn gọn và đầy đủ.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: false,
          message: "Chưa chọn bài học học thử.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: true,
          message: "Thông tin cá nhân đã xác minh.",
        },
      ],
    },
  },
  {
    id: 104,
    title: "Docker & Kubernetes Thực Chiến Cho DevOps & Backend Dev",
    slug: "docker-kubernetes-thuc-chien-devops-backend",
    short_description:
      "Triển khai hạ tầng Microservices linh hoạt, Autoscaling và CI/CD với GitHub Actions.",
    description:
      "<p>Khóa học giúp bạn nắm chắc kĩ năng Containerization từ cơ bản tới nâng cao. Học viên sẽ triển khai cụm K8s đa node trên Cloud, cấu hình Ingress Controller, Helm Charts và giám sát ứng dụng với Prometheus/Grafana.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1605745341112-85968b19335b?w=600&auto=format&fit=crop&q=80",
    price: 1590000,
    sale_price: 1190000,
    level: "advanced",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 43200, // 12 giờ 00 phút
    created_at: "2026-07-07 11:00:00",
    updated_at: "2026-07-11 15:40:00",
    instructor: {
      id: 31,
      full_name: "Phạm Quốc Bảo",
      email: "baopq.devops@gmail.com",
      avatar_url:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      title: "DevOps Engineer @ Shopee Vietnam",
      status: "active",
    },
    sections: [
      {
        id: 1007,
        title: "Chương 1: Docker Core Concepts & Multi-stage Build",
        order: 1,
        lesson_count: 4,
        total_duration_seconds: 14400,
        lessons: [
          {
            id: 25,
            title: "1.1 Docker Architecture & Container Lifecycle",
            order: 1,
            type: "video",
            duration_seconds: 3600,
            is_preview: true,
          },
          {
            id: 26,
            title: "1.2 Tối ưu dung lượng Image với Multi-stage",
            order: 2,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 27,
            title: "1.3 Cấu hình Docker Compose cho Stack Laravel-Postgres",
            order: 3,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 28,
            title: "1.4 Tài liệu Cheatsheet lệnh Docker",
            order: 4,
            type: "document",
            duration_seconds: 3600,
            is_preview: false,
          },
        ],
      },
      {
        id: 1008,
        title: "Chương 2: Kubernetes In Production & CI/CD Pipeline",
        order: 2,
        lesson_count: 4,
        total_duration_seconds: 28800,
        lessons: [
          {
            id: 29,
            title: "2.1 Pods, Deployments & StatefulSets",
            order: 1,
            type: "video",
            duration_seconds: 7200,
            is_preview: false,
          },
          {
            id: 30,
            title: "2.2 Ingress NGINX Controller & SSL Cert-Manager",
            order: 2,
            type: "video",
            duration_seconds: 7200,
            is_preview: false,
          },
          {
            id: 31,
            title: "2.3 Helm Chart Packaging",
            order: 3,
            type: "video",
            duration_seconds: 7200,
            is_preview: false,
          },
          {
            id: 32,
            title: "2.4 Pipeline GitHub Actions Auto Deploy K8s",
            order: 4,
            type: "video",
            duration_seconds: 7200,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: true,
      summary: "Khóa học đáp ứng đầy đủ tiêu chuẩn kiểm duyệt.",
      missing_items: [],
      warnings: [],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: true,
          message: "Đã có promo video 3 phút.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: true,
          message: "Đã có 8 bài học.",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Tổng thời lượng 12 giờ 00 phút.",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: true,
          message: "Đầy đủ thông tin chi tiết.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: true,
          message: "Có 1 bài học xem trước.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: true,
          message: "Tài khoản giảng viên hợp lệ.",
        },
      ],
    },
  },
  {
    id: 105,
    title: "Node.js Architecture & Microservices với NestJS 10",
    slug: "nodejs-architecture-microservices-nestjs-10",
    short_description:
      "Xây dựng hệ thống Enterprise Backend kết hợp gRPC, Kafka và PostgreSQL.",
    description:
      "<p>Học NestJS framework theo phong cách Clean Architecture và DDD (Domain-Driven Design). Khóa học giúp bạn nắm chắc kỹ năng thiết kế microservices có khả năng mở rộng cực cao.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    price: 1390000,
    sale_price: 990000,
    level: "advanced",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 28800, // 8 giờ 00 phút
    created_at: "2026-07-10 08:15:00",
    updated_at: "2026-07-12 10:00:00",
    instructor: {
      id: 42,
      full_name: "Đặng Tiến Dũng",
      email: "dungdt.backend@gmail.com",
      avatar_url:
        "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      title: "Backend Architect @ Techcombank",
      status: "active",
    },
    sections: [
      {
        id: 1009,
        title: "Chương 1: NestJS Essentials & Dependency Injection",
        order: 1,
        lesson_count: 3,
        total_duration_seconds: 14400,
        lessons: [
          {
            id: 33,
            title: "1.1 Modules, Controllers & Providers Architecture",
            order: 1,
            type: "video",
            duration_seconds: 3600,
            is_preview: true,
          },
          {
            id: 34,
            title: "1.2 Custom Decorators, Pipes & Interceptors",
            order: 2,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 35,
            title: "1.3 TypeORM & PostgreSQL Migration",
            order: 3,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
        ],
      },
      {
        id: 1010,
        title: "Chương 2: Event-driven Microservices với Apache Kafka",
        order: 2,
        lesson_count: 3,
        total_duration_seconds: 14400,
        lessons: [
          {
            id: 36,
            title: "2.1 gRPC High-performance Communication",
            order: 1,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 37,
            title: "2.2 Kafka Event Streaming & Consumer Groups",
            order: 2,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 38,
            title: "2.3 CQRS Pattern trong NestJS Enterprise",
            order: 3,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: false,
      summary: "Phát hiện 1 mục chưa đạt tiêu chuẩn nội dung bắt buộc.",
      missing_items: [
        "Mô tả chi tiết khóa học quá ngắn (dưới 100 từ tiêu chuẩn)",
      ],
      warnings: ["Bài tập thực hành trắc nghiệm/tự luận chưa được thiết lập."],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: true,
          message: "Đã có video giới thiệu.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: true,
          message: "Đã có 6 bài học.",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Thời lượng 8 giờ 00 phút.",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: false,
          message: "Nội dung mô tả khóa học sơ sài.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: true,
          message: "Đã bật 1 bài preview.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: true,
          message: "Giảng viên xác thực thành công.",
        },
      ],
    },
  },
  {
    id: 106,
    title: "Phân Tích Dữ Liệu Thực Chuyển Nghiệp Bằng Python & Pandas",
    slug: "phan-tich-du-lieu-python-pandas",
    short_description:
      "Làm chủ NumPy, Pandas, Matplotlib, Seaborn và trực quan hóa dữ liệu kinh doanh.",
    description:
      "<p>Khóa học dành cho Data Analyst và Business Intelligence Engineer. Bạn sẽ được học cách làm sạch dữ liệu nhiễu, biến đổi dữ liệu lớn và vẽ các biểu đồ phân tích dự báo xu hướng doanh thu.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
    price: 890000,
    sale_price: 590000,
    level: "beginner",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 21600, // 6 giờ 00 phút
    created_at: "2026-07-12 07:30:00",
    updated_at: "2026-07-13 14:00:00",
    instructor: {
      id: 55,
      full_name: "Vũ Hải Đăng",
      email: "dangvh.data@gmail.com",
      avatar_url:
        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
      title: "Senior Data Scientist @ MoMo",
      status: "active",
    },
    sections: [
      {
        id: 1011,
        title: "Chương 1: Python Căn Bản & Thư Viện NumPy/Pandas",
        order: 1,
        lesson_count: 4,
        total_duration_seconds: 21600,
        lessons: [
          {
            id: 39,
            title: "1.1 Cài đặt Jupyter Notebook & Anaconda",
            order: 1,
            type: "video",
            duration_seconds: 3600,
            is_preview: true,
          },
          {
            id: 40,
            title: "1.2 Thao tác với Pandas DataFrame & Series",
            order: 2,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 41,
            title: "1.3 Xử lý dữ liệu khuyết (Missing Values) & Duplicates",
            order: 3,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 42,
            title: "1.4 Trực quan hóa Seaborn & Matplotlib Dashboards",
            order: 4,
            type: "video",
            duration_seconds: 7200,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: false,
      summary: "Nội dung thiếu bài học tối thiểu và thiếu bài học học thử.",
      missing_items: [
        "Số lượng bài học chỉ có 4 bài (yêu cầu tối thiểu >= 5 bài)",
        "Chưa bật tính năng Học thử (Preview Lesson)",
      ],
      warnings: ["Thời lượng 6 giờ tương đối ngắn cho chủ đề Data Analytics."],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: true,
          message: "Đã có video giới thiệu.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: false,
          message: "Hiện chỉ có 4 bài học.",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Thời lượng 6 giờ 00 phút.",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: true,
          message: "Mô tả chi tiết bài học.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: false,
          message: "Thiếu bài xem thử.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: true,
          message: "Xác minh tài khoản hoàn tất.",
        },
      ],
    },
  },
  {
    id: 107,
    title: "Tối Ưu Truy Vấn & Indexing Trong MySQL Enterprise",
    slug: "toi-uu-truy-van-indexing-mysql-enterprise",
    short_description:
      "Phân tích EXPLAIN plan, B-Tree Index, InnoDB Buffer Pool và tránh Slow Query.",
    description:
      "<p>Bí quyết giúp câu lệnh SQL của bạn tăng tốc gấp 10-100 lần. Khóa học chuyên sâu dành cho Database Administrator và Backend Engineer muốn làm chủ cơ sở dữ liệu MySQL.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80",
    price: 790000,
    sale_price: 490000,
    level: "advanced",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 14400, // 4 giờ 00 phút
    created_at: "2026-07-06 14:00:00",
    updated_at: "2026-07-10 09:30:00",
    instructor: {
      id: 61,
      full_name: "Bùi Hoàng Nam",
      email: "nambh.dba@gmail.com",
      avatar_url:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
      title: "Principal DBA @ Viettel Telecom",
      status: "active",
    },
    sections: [
      {
        id: 1012,
        title: "Chương 1: Deep Dive MySQL Storage Engine & Indexing",
        order: 1,
        lesson_count: 5,
        total_duration_seconds: 14400,
        lessons: [
          {
            id: 43,
            title: "1.1 B-Tree Index & Composite Index Internal",
            order: 1,
            type: "video",
            duration_seconds: 2880,
            is_preview: true,
          },
          {
            id: 44,
            title: "1.2 Đọc & Phân tích EXPLAIN Execution Plan",
            order: 2,
            type: "video",
            duration_seconds: 2880,
            is_preview: false,
          },
          {
            id: 45,
            title: "1.3 Tránh Full Table Scan & Covering Index",
            order: 3,
            type: "video",
            duration_seconds: 2880,
            is_preview: false,
          },
          {
            id: 46,
            title: "1.4 Cấu hình Slow Query Log & Percona Toolkit",
            order: 4,
            type: "video",
            duration_seconds: 2880,
            is_preview: false,
          },
          {
            id: 47,
            title: "1.5 Bài tập tối ưu query hàng triệu bản ghi",
            order: 5,
            type: "quiz",
            duration_seconds: 2880,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: true,
      summary: "Khóa học hoàn toàn đạt chuẩn chất lượng kiểm duyệt.",
      missing_items: [],
      warnings: [],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: true,
          message: "Đã upload video giới thiệu.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: true,
          message: "Có 5 bài học vừa đủ chuẩn.",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Tổng thời lượng 4 giờ 00 phút.",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: true,
          message: "Nội dung mô tả khoa học.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: true,
          message: "Đã mở 1 bài học xem thử.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: true,
          message: "Giảng viên xác minh tài khoản.",
        },
      ],
    },
  },
  {
    id: 108,
    title: "Next.js 14 Fullstack & Stripe Payment Gateway",
    slug: "nextjs-14-fullstack-stripe-payment-gateway",
    short_description:
      "Xây dựng trang E-commerce hoàn chỉnh với App Router, Prisma ORM và Server Actions.",
    description:
      "<p>Khóa học xây dựng ứng dụng thương mại điện tử từ A-Z với công nghệ Next.js 14 mới nhất. Bạn sẽ tích hợp hệ thống thanh toán tự động qua cổng Stripe, Webhook bảo mật và quản lý đơn hàng realtime.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
    price: 1690000,
    sale_price: 1290000,
    level: "intermediate",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 32400, // 9 giờ 00 phút
    created_at: "2026-07-08 15:20:00",
    updated_at: "2026-07-12 17:00:00",
    instructor: {
      id: 72,
      full_name: "Ngô Quang Huy",
      email: "huynq.fullstack@gmail.com",
      avatar_url:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80",
      title: "Fullstack Architect @ SotaTek",
      status: "active",
    },
    sections: [
      {
        id: 1013,
        title: "Chương 1: Next.js App Router Architecture",
        order: 1,
        lesson_count: 3,
        total_duration_seconds: 14400,
        lessons: [
          {
            id: 48,
            title: "1.1 App Router vs Pages Router Comparison",
            order: 1,
            type: "video",
            duration_seconds: 3600,
            is_preview: true,
          },
          {
            id: 49,
            title: "1.2 Layouts, Parallel Routes & Intercepting Routes",
            order: 2,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 50,
            title: "1.3 Prisma ORM Setup với PostgreSQL",
            order: 3,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
        ],
      },
      {
        id: 1014,
        title: "Chương 2: Tích Hợp Stripe & Checkout Flow",
        order: 2,
        lesson_count: 3,
        total_duration_seconds: 18000,
        lessons: [
          {
            id: 51,
            title: "2.1 Stripe SDK Integration & Payment Intent API",
            order: 1,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 52,
            title: "2.2 Webhook Handling & Idempotency",
            order: 2,
            type: "video",
            duration_seconds: 7200,
            is_preview: false,
          },
          {
            id: 53,
            title: "2.3 Deploy Vercel & Production Environment",
            order: 3,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: false,
      summary: "Phát hiện thiếu thông tin xác minh của giảng viên.",
      missing_items: [
        "Tài khoản giảng viên chưa hoàn tất quy trình xác minh CCCD/Bằng cấp chuyên môn",
      ],
      warnings: ["Tỷ lệ bài học video đạt 1080p chưa đồng đều."],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: true,
          message: "Đã có video giới thiệu.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: true,
          message: "Có 6 bài học.",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Tổng thời lượng 9 giờ 00 phút.",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: true,
          message: "Đầy đủ mục tiêu học tập.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: true,
          message: "Có 1 bài xem thử.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: false,
          message: "Giảng viên chưa gửi tài liệu xác thực.",
        },
      ],
    },
  },
  {
    id: 109,
    title: "Digital Marketing Thực Chiến 2026: Facebook Ads & TikTok Shop",
    slug: "digital-marketing-thuc-chien-2026-facebook-tiktok",
    short_description:
      "Xây dựng chiến dịch chuyển đổi cao, tối ưu ROI và sáng tạo nội dung Video ngắn xu hướng.",
    description:
      "<p>Bí quyết bùng nổ doanh số bán hàng online với TikTok Shop và Facebook Performance Marketing. Học viên thực hành trực tiếp kỹ năng viết Content bán hàng, đọc báo cáo Pixel và chạy quảng cáo Livestream.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&auto=format&fit=crop&q=80",
    price: 1190000,
    sale_price: 790000,
    level: "all_levels",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 19800, // 5 giờ 30 phút
    created_at: "2026-07-11 13:40:00",
    updated_at: "2026-07-13 10:15:00",
    instructor: {
      id: 84,
      full_name: "Lê Mỹ Duyên",
      email: "duyenlmd.marketing@gmail.com",
      avatar_url:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      title: "CMO @ Nova Digital Agency",
      status: "active",
    },
    sections: [
      {
        id: 1015,
        title: "Chương 1: Chiến Lược Nội Dung & TikTok Shop Optimization",
        order: 1,
        lesson_count: 5,
        total_duration_seconds: 19800,
        lessons: [
          {
            id: 54,
            title: "1.1 Tư duy Marketing 2026 & Xây dựng Persona",
            order: 1,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 55,
            title: "1.2 Thuật toán TikTok Shop & Chuẩn hóa cửa hàng",
            order: 2,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 56,
            title: "1.3 Kịch bản Video ngắn 15s gây bão View",
            order: 3,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 57,
            title: "1.4 Thiết lập chiến dịch Ads Chuyển đổi",
            order: 4,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 58,
            title: "1.5 Đọc chỉ số CAC, LTV, ROAS tối ưu ngân sách",
            order: 5,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: false,
      summary: "Phát hiện 2 vi phạm quy định kiểm duyệt của MindHub.",
      missing_items: [
        "Thiếu video giới thiệu khóa học (Promo Video)",
        "Chưa thiết lập bất kỳ bài học xem thử (Preview Lesson)",
      ],
      warnings: ["Khóa học chỉ có 1 section duy nhất."],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: false,
          message: "Thiếu promo video.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: true,
          message: "Đã có 5 bài học.",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Tổng thời lượng 5 giờ 30 phút.",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: true,
          message: "Đầy đủ mô tả chi tiết.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: false,
          message: "Chưa mở bài học thử.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: true,
          message: "Tài khoản giảng viên đã xác thực.",
        },
      ],
    },
  },
  {
    id: 110,
    title: "Vue 3 Composition API & Pinia State Management",
    slug: "vue-3-composition-api-pinia-state-management",
    short_description:
      "Lập trình ứng dụng Web SPA tốc độ cao với Vite, Vue Router 4 và Naive UI.",
    description:
      "<p>Học lập trình Vue 3 hiện đại sử dụng Script Setup và Composition API. Bạn sẽ xây dựng giao diện ứng dụng quản lý tác vụ mượt mà, đồng bộ dữ liệu Realtime qua WebSockets.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80",
    price: 990000,
    sale_price: 690000,
    level: "intermediate",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 25200, // 7 giờ 00 phút
    created_at: "2026-07-09 13:00:00",
    updated_at: "2026-07-12 16:30:00",
    instructor: {
      id: 91,
      full_name: "Phan Văn Đức",
      email: "ducpv.vue@gmail.com",
      avatar_url:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
      title: "Frontend Developer @ Sun Asterisk",
      status: "active",
    },
    sections: [
      {
        id: 1016,
        title: "Chương 1: Vue 3 Composition API Essentials",
        order: 1,
        lesson_count: 3,
        total_duration_seconds: 10800,
        lessons: [
          {
            id: 59,
            title: "1.1 Reactive vs Ref trong Vue 3",
            order: 1,
            type: "video",
            duration_seconds: 3600,
            is_preview: true,
          },
          {
            id: 60,
            title: "1.2 Computed Properties & Watchers",
            order: 2,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 61,
            title: "1.3 Lifecycle Hooks trong Script Setup",
            order: 3,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
        ],
      },
      {
        id: 1017,
        title: "Chương 2: Pinia Store & Vue Router Navigation Guards",
        order: 2,
        lesson_count: 3,
        total_duration_seconds: 14400,
        lessons: [
          {
            id: 62,
            title: "2.1 Khởi tạo Pinia Store & Actions/Getters",
            order: 1,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 63,
            title: "2.2 Phân quyền Route với Navigation Guards",
            order: 2,
            type: "video",
            duration_seconds: 5400,
            is_preview: false,
          },
          {
            id: 64,
            title: "2.3 Build & Deploy SPA với Nginx",
            order: 3,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: true,
      summary: "Khóa học đạt chuẩn chất lượng kiểm duyệt.",
      missing_items: [],
      warnings: [
        "Cần chú ý bổ sung bài tập trắc nghiệm củng cố kiến thức ở mỗi chương.",
      ],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: true,
          message: "Đã có promo video HD.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: true,
          message: "Có 6 bài học.",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Thời lượng 7 giờ 00 phút.",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: true,
          message: "Đầy đủ mục tiêu đầu ra.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: true,
          message: "Có 1 bài xem trước.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: true,
          message: "Tài khoản giảng viên đã xác thực.",
        },
      ],
    },
  },
  {
    id: 111,
    title: "Git & GitHub Cho Dự Án Nhóm Doanh Nghiệp",
    slug: "git-github-cho-du-an-nhom-doanh-nghiep",
    short_description:
      "Làm chủ Git Flow, Rebase, Cherry-pick, Conflict Resolution và GitHub Actions.",
    description:
      "<p>Khóa học ngắn hạn cô đọng giải quyết dứt điểm các rắc rối thường gặp khi làm việc nhóm với Git. Bạn sẽ biết cách giải quyết Conflict mượt mà, quản lý Branch chuyên nghiệp.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=600&auto=format&fit=crop&q=80",
    price: 490000,
    sale_price: 290000,
    level: "all_levels",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 10800, // 3 giờ 00 phút
    created_at: "2026-07-12 11:15:00",
    updated_at: "2026-07-13 15:45:00",
    instructor: {
      id: 98,
      full_name: "Hoàng Văn Tuấn",
      email: "tuanhv.dev@gmail.com",
      avatar_url:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
      title: "DevOps Consultant @ SmartOSC",
      status: "active",
    },
    sections: [
      {
        id: 1018,
        title: "Chương 1: Git Essentials & Advanced Branching",
        order: 1,
        lesson_count: 5,
        total_duration_seconds: 10800,
        lessons: [
          {
            id: 65,
            title: "1.1 Git Working Directory, Staging & Repository",
            order: 1,
            type: "video",
            duration_seconds: 2160,
            is_preview: true,
          },
          {
            id: 66,
            title: "1.2 Git Flow vs Trunk-based Development",
            order: 2,
            type: "video",
            duration_seconds: 2160,
            is_preview: false,
          },
          {
            id: 67,
            title: "1.3 Git Rebase vs Merge Deep Dive",
            order: 3,
            type: "video",
            duration_seconds: 2160,
            is_preview: false,
          },
          {
            id: 68,
            title: "1.4 Xử lý Merge Conflicts thực tế",
            order: 4,
            type: "video",
            duration_seconds: 2160,
            is_preview: false,
          },
          {
            id: 69,
            title: "1.5 Git Stash, Cherry-pick & Bisect",
            order: 5,
            type: "video",
            duration_seconds: 2160,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: false,
      summary: "Nội dung thiếu video giới thiệu khóa học.",
      missing_items: ["Thiếu video giới thiệu khóa học (Promo Video)"],
      warnings: [],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: false,
          message: "Chưa upload promo video.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: true,
          message: "Đã có 5 bài học.",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Tổng thời lượng 3 giờ 00 phút.",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: true,
          message: "Mô tả rõ ràng.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: true,
          message: "Có 1 bài xem trước.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: true,
          message: "Thông tin hợp lệ.",
        },
      ],
    },
  },
  {
    id: 112,
    title: "Kiểm Thử API Tự Động Với Postman & Newman CI/CD",
    slug: "kiem-thu-api-tu-dong-postman-newman",
    short_description:
      "Viết script test tự động bằng JavaScript, chạy bộ Test Suite trong pipeline CI.",
    description:
      "<p>Khóa học thực chiến dành cho QA/QC Engineer và Tester. Bạn sẽ học cách viết các câu lệnh assertion JavaScript trong Postman, tạo biến môi trường động và chạy tự động với Newman CLI.</p>",
    thumbnail_url:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    price: 690000,
    sale_price: 390000,
    level: "beginner",
    language: "vi",
    status: "pending_review",
    total_duration_seconds: 16200, // 4 giờ 30 phút
    created_at: "2026-07-13 09:00:00",
    updated_at: "2026-07-13 16:00:00",
    instructor: {
      id: 105,
      full_name: "Đỗ Kim Anh",
      email: "anhdk.qa@gmail.com",
      avatar_url:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      title: "QA Lead @ KMS Technology",
      status: "active",
    },
    sections: [
      {
        id: 1019,
        title: "Chương 1: Postman Scripting & Test Automation",
        order: 1,
        lesson_count: 4,
        total_duration_seconds: 16200,
        lessons: [
          {
            id: 70,
            title: "1.1 Postman Collections, Environments & Variables",
            order: 1,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
          {
            id: 71,
            title: "1.2 Viết Test Scripts với chai.js trong Postman",
            order: 2,
            type: "video",
            duration_seconds: 4500,
            is_preview: false,
          },
          {
            id: 72,
            title: "1.3 Collection Runner & Data-driven Testing",
            order: 3,
            type: "video",
            duration_seconds: 4500,
            is_preview: false,
          },
          {
            id: 73,
            title: "1.4 Tích hợp Newman CLI vào GitHub Actions",
            order: 4,
            type: "video",
            duration_seconds: 3600,
            is_preview: false,
          },
        ],
      },
    ],
    checklist: {
      passed: false,
      summary: "Nội dung thiếu bài học tối thiểu và thiếu bài học học thử.",
      missing_items: [
        "Số lượng bài học chỉ có 4 bài (yêu cầu tối thiểu >= 5 bài)",
        "Chưa chọn bài học học thử (Preview Lesson)",
      ],
      warnings: [],
      checks: [
        {
          name: "Video giới thiệu khóa học (Promo Video)",
          passed: true,
          message: "Đã upload promo video.",
        },
        {
          name: "Số lượng bài học tối thiểu (>= 5 bài)",
          passed: false,
          message: "Hiện có 4 bài học.",
        },
        {
          name: "Tổng thời lượng video (>= 2 giờ)",
          passed: true,
          message: "Tổng thời lượng 4 giờ 30 phút.",
        },
        {
          name: "Mô tả khóa học & Mục tiêu đầu ra",
          passed: true,
          message: "Mô tả khóa học hợp lệ.",
        },
        {
          name: "Bài học học thử (Preview Lesson)",
          passed: false,
          message: "Chưa mở bài xem trước.",
        },
        {
          name: "Thông tin giảng viên & Xác minh tài khoản",
          passed: true,
          message: "Tài khoản hợp lệ.",
        },
      ],
    },
  },
];

// Memory state cho Mock để giả lập duyệt / từ chối phản hồi realtime
let mockStore = JSON.parse(JSON.stringify(MOCK_COURSE_REVIEWS));
let mockSummary = {
  pending_count: mockStore.length,
  approved_today: 3,
  rejected_today: 1,
};

/**
 * Helper lấy ngày gửi kiểm duyệt chính thức của khóa học (Ưu tiên submitted_at, created_at, updated_at)
 */
export function getCourseReviewSubmittedDate(item) {
  if (!item) return null;
  const value = item.submitted_at ?? item.created_at ?? item.updated_at ?? null;
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  const strVal = String(value).trim().replace(" ", "T");
  const date = new Date(strVal);
  if (isNaN(date.getTime())) {
    console.warn(
      `[getCourseReviewSubmittedDate] Ngày gửi không hợp lệ cho khóa học ID ${item.id}:`,
      value,
    );
    return null;
  }
  return date;
}

/**
 * Lấy danh sách khóa học chờ duyệt (Mock)
 */
export function getMockCourseReviews(params = {}) {
  const page = parseInt(params.page) || 1;
  const per_page = parseInt(params.per_page) || 20;
  const search = (params.search || "").toLowerCase().trim();
  const sort = params.sort || "submitted_desc";
  const date_preset = params.date_preset || params.review_date_preset || "";
  const date_from = params.date_from || params.review_date_from || "";
  const date_to = params.date_to || params.review_date_to || "";

  // 1. Chỉ lọc các khóa pending_review
  let items = mockStore.filter((c) => c.status === "pending_review");

  // 2. Search
  if (search) {
    items = items.filter((item) => {
      const titleMatch = (item.title || "").toLowerCase().includes(search);
      const slugMatch = (item.slug || "").toLowerCase().includes(search);
      const instructorMatch = (item.instructor?.full_name || "")
        .toLowerCase()
        .includes(search);
      return titleMatch || slugMatch || instructorMatch;
    });
  }

  // 3. Lọc theo Khoảng thời gian gửi
  if (date_from || date_to || (date_preset && date_preset !== "all")) {
    let fromTimestamp = null;
    let toTimestamp = null;

    if (date_preset && date_preset !== "custom" && date_preset !== "all") {
      const now = new Date();
      // Đảm bảo mốc tham chiếu cho dữ liệu mock năm 2026 nếu trình duyệt client ở năm khác
      let anchorDate = now;
      if (now.getFullYear() < 2026) {
        anchorDate = new Date(2026, 6, 14, 23, 59, 59, 999);
      }
      const todayEnd = new Date(
        anchorDate.getFullYear(),
        anchorDate.getMonth(),
        anchorDate.getDate(),
        23,
        59,
        59,
        999,
      );
      toTimestamp = todayEnd.getTime();

      let daysToSubtract = 0;
      if (date_preset === "last_7_days") daysToSubtract = 6;
      else if (date_preset === "last_30_days") daysToSubtract = 29;
      else if (date_preset === "last_90_days") daysToSubtract = 89;
      else if (date_preset === "last_1_year") daysToSubtract = 365;

      const fromDate = new Date(
        anchorDate.getFullYear(),
        anchorDate.getMonth(),
        anchorDate.getDate() - daysToSubtract,
        0,
        0,
        0,
        0,
      );
      fromTimestamp = fromDate.getTime();
    } else {
      if (date_from) {
        const parts = date_from.split("-");
        if (parts.length === 3) {
          fromTimestamp = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            0,
            0,
            0,
            0,
          ).getTime();
        }
      }
      if (date_to) {
        const parts = date_to.split("-");
        if (parts.length === 3) {
          toTimestamp = new Date(
            parseInt(parts[0]),
            parseInt(parts[1]) - 1,
            parseInt(parts[2]),
            23,
            59,
            59,
            999,
          ).getTime();
        }
      }
    }

    items = items.filter((item) => {
      const itemDate = getCourseReviewSubmittedDate(item);
      if (!itemDate) return false;
      const itemTime = itemDate.getTime();
      if (fromTimestamp && itemTime < fromTimestamp) return false;
      if (toTimestamp && itemTime > toTimestamp) return false;
      return true;
    });
  }

  // 4. Sort
  items.sort((a, b) => {
    const dateA = getCourseReviewSubmittedDate(a);
    const dateB = getCourseReviewSubmittedDate(b);
    switch (sort) {
      case "submitted_asc":
      case "created_at_asc":
        return (dateA ? dateA.getTime() : 0) - (dateB ? dateB.getTime() : 0);
      case "title_asc":
        return a.title.localeCompare(b.title);
      case "title_desc":
        return b.title.localeCompare(a.title);
      case "price_desc":
        return (b.sale_price || b.price) - (a.sale_price || a.price);
      case "price_asc":
        return (a.sale_price || a.price) - (b.sale_price || b.price);
      case "duration_desc":
        return (
          (b.total_duration_seconds || 0) - (a.total_duration_seconds || 0)
        );
      case "submitted_desc":
      case "created_at_desc":
      default:
        return (dateB ? dateB.getTime() : 0) - (dateA ? dateA.getTime() : 0);
    }
  });

  const total = items.length;
  const last_page = Math.ceil(total / per_page) || 1;
  const start = (page - 1) * per_page;
  const paginatedItems = items.slice(start, start + per_page);

  return {
    success: true,
    message: "Lấy danh sách khóa học kiểm duyệt thành công (Mock).",
    data: {
      summary: {
        pending_count: items.length,
        approved_today: mockSummary.approved_today,
        rejected_today: mockSummary.rejected_today,
      },
      items: paginatedItems,
    },
    meta: {
      current_page: page,
      last_page: last_page,
      per_page: per_page,
      total: total,
    },
  };
}

/**
 * Lấy chi tiết một khóa học (Mock)
 */
export function getMockCourseReviewDetail(id) {
  const targetId = parseInt(id);
  const item = mockStore.find((c) => c.id === targetId);

  if (!item) {
    return {
      success: false,
      message: "Không tìm thấy khóa học kiểm duyệt có ID " + id,
      errors: { id: ["Khóa học không tồn tại trong danh sách chờ."] },
    };
  }

  return {
    success: true,
    message: "Lấy chi tiết khóa học thành công (Mock).",
    data: {
      course: {
        id: item.id,
        title: item.title,
        slug: item.slug,
        short_description: item.short_description,
        description: item.description,
        thumbnail_url: item.thumbnail_url,
        price: item.price,
        sale_price: item.sale_price,
        level: item.level,
        language: item.language,
        status: item.status,
        total_duration_seconds: item.total_duration_seconds,
        created_at: item.created_at,
        updated_at: item.updated_at,
        instructor: item.instructor,
      },
      sections: item.sections || [],
      lessons: (item.sections || []).flatMap((s) => s.lessons || []),
      checklist: item.checklist,
    },
  };
}

/**
 * Duyệt khóa học (Mock)
 */
export function approveMockCourse(id) {
  const targetId = parseInt(id);
  const itemIndex = mockStore.findIndex((c) => c.id === targetId);

  if (itemIndex === -1) {
    return {
      status: 404,
      data: {
        success: false,
        message: "Khóa học không tồn tại hoặc đã được xử lý trước đó.",
      },
    };
  }

  const item = mockStore[itemIndex];
  if (item.status !== "pending_review") {
    return {
      status: 409,
      data: {
        success: false,
        message: "Khóa học này đã được xử lý trước đó.",
      },
    };
  }

  // Chuyển status thành approved / published
  item.status = "published";
  item.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);

  // Cập nhật summary
  mockSummary.approved_today += 1;
  mockSummary.pending_count = Math.max(0, mockSummary.pending_count - 1);

  return {
    status: 200,
    data: {
      success: true,
      message: `Khóa học "${item.title}" đã được chấp thuận thành công.`,
      data: {
        id: item.id,
        instructor_id: item.instructor.id,
        title: item.title,
        slug: item.slug,
        status: "published",
        admin_reject_reason: null,
        published_at: item.updated_at,
        created_at: item.created_at,
        updated_at: item.updated_at,
        instructor: item.instructor,
      },
    },
  };
}

/**
 * Từ chối khóa học (Mock)
 */
export function rejectMockCourse(id, payload = {}) {
  const targetId = parseInt(id);
  const itemIndex = mockStore.findIndex((c) => c.id === targetId);

  if (itemIndex === -1) {
    return {
      status: 404,
      data: {
        success: false,
        message: "Khóa học không tồn tại hoặc đã được xử lý trước đó.",
      },
    };
  }

  const item = mockStore[itemIndex];
  if (item.status !== "pending_review") {
    return {
      status: 409,
      data: {
        success: false,
        message: "Khóa học này đã được xử lý trước đó.",
      },
    };
  }

  const reason = (payload.admin_reject_reason || "").trim();
  if (!reason) {
    return {
      status: 422,
      data: {
        success: false,
        message: "Vui lòng nhập lý do từ chối.",
        errors: {
          admin_reject_reason: ["Lý do từ chối không được để trống."],
        },
      },
    };
  }

  if (reason.length > 1000) {
    return {
      status: 422,
      data: {
        success: false,
        message: "Lý do từ chối không được vượt quá 1000 ký tự.",
        errors: {
          admin_reject_reason: [
            "Lý do từ chối không được vượt quá 1000 ký tự.",
          ],
        },
      },
    };
  }

  // Chuyển status thành rejected
  item.status = "rejected";
  item.admin_reject_reason = reason;
  item.updated_at = new Date().toISOString().replace("T", " ").substring(0, 19);

  // Cập nhật summary
  mockSummary.rejected_today += 1;
  mockSummary.pending_count = Math.max(0, mockSummary.pending_count - 1);

  return {
    status: 200,
    data: {
      success: true,
      message: `Đã từ chối duyệt khóa học "${item.title}".`,
      data: {
        id: item.id,
        instructor_id: item.instructor.id,
        title: item.title,
        slug: item.slug,
        status: "rejected",
        admin_reject_reason: reason,
        published_at: null,
        created_at: item.created_at,
        updated_at: item.updated_at,
        instructor: item.instructor,
      },
    },
  };
}
