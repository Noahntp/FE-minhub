export interface StudentMock {
  id: number;
  name: string;
  email: string;
  course: string;
  progress: number;
  lastActive: string;
  hasCert: boolean;
  phone: string;
  enrolledAt: string;
  learningDuration: string;
  courseDuration: string;
  enrollmentCode: string;
  lessonsCompleted: number;
  totalLessons: number;
  lessonsTimeline: Array<{
    title: string;
    status: 'completed' | 'in_progress' | 'pending';
    lastActive?: string;
  }>;
  activities: Array<{
    id: string;
    title: string;
    desc: string;
    time: string;
    type: 'video' | 'chapter' | 'resource' | 'cert' | 'assignment';
  }>;
}

export const INSTRUCTOR_STUDENTS_MOCK = {
  stats: {
    totalEnrollments: 1248,
    learningCount: 856,
    completedCount: 316,
    certificatesCount: 289
  },
  students: [
    {
      id: 1,
      name: "Trần Khánh Linh",
      email: "linh.tran98@gmail.com",
      course: "Lập trình Python cơ bản",
      progress: 72,
      lastActive: "2 giờ trước",
      hasCert: true,
      phone: "0987 654 321",
      enrolledAt: "20/03/2024",
      learningDuration: "18h 45m",
      courseDuration: "25h 30m",
      enrollmentCode: "MH-PY-240320-1023",
      lessonsCompleted: 43,
      totalLessons: 60,
      lessonsTimeline: [
        { title: "Bắt đầu khóa học", status: "completed", lastActive: "20/03/2024" },
        { title: "Chương 1: Python cơ bản (10/10 bài)", status: "completed", lastActive: "25/03/2024" },
        { title: "Chương 2: Cấu trúc dữ liệu (8/10 bài)", status: "completed", lastActive: "10/04/2024" },
        { title: "Chương 3: Hàm và Module (7/10 bài)", status: "completed", lastActive: "20/05/2024" },
        { title: "Chương 4: OOP trong Python (Chưa bắt đầu)", status: "pending" },
        { title: "Dự án cuối khóa (Chưa bắt đầu)", status: "pending" }
      ],
      activities: [
        {
          id: "act-1",
          title: "Đã xem bài giảng 3.2 Hàm trong Python",
          desc: "Xem xong video bài giảng dài 15 phút về tham số hàm.",
          time: "2 giờ trước",
          type: "video"
        },
        {
          id: "act-2",
          title: "Hoàn thành bài học Chương 2",
          desc: "Đã xem hết 8/10 bài của Chương 2: Cấu trúc dữ liệu.",
          time: "3 giờ trước",
          type: "chapter"
        },
        {
          id: "act-3",
          title: "Nộp bài tập: Bài tập 3: Viết hàm tính giai thừa",
          desc: "Bài nộp đã được hệ thống ghi nhận.",
          time: "1 ngày trước",
          type: "assignment"
        },
        {
          id: "act-4",
          title: "Tải tài nguyên Python Cheatsheet.pdf",
          desc: "Tải tài liệu tổng hợp cú pháp Python cơ bản.",
          time: "3 ngày trước",
          type: "resource"
        }
      ]
    },
    {
      id: 2,
      name: "Lê Minh Hoàng",
      email: "hoang.le.dev@gmail.com",
      course: "Data Analysis với Excel",
      progress: 45,
      lastActive: "1 ngày trước",
      hasCert: false,
      phone: "0912 345 678",
      enrolledAt: "15/04/2024",
      learningDuration: "10h 30m",
      courseDuration: "22h 00m",
      enrollmentCode: "MH-EX-240415-1102",
      lessonsCompleted: 18,
      totalLessons: 40,
      lessonsTimeline: [
        { title: "Bắt đầu khóa học", status: "completed", lastActive: "15/04/2024" },
        { title: "Chương 1: Công thức nâng cao (8/8 bài)", status: "completed", lastActive: "30/04/2024" },
        { title: "Chương 2: Pivot Table (10/12 bài)", status: "completed", lastActive: "15/05/2024" },
        { title: "Chương 3: Excel Dashboard (Chưa bắt đầu)", status: "pending" }
      ],
      activities: [
        {
          id: "act-1",
          title: "Đã xem bài giảng Pivot Table nâng cao",
          desc: "Xem xong video bài giảng dài 22 phút.",
          time: "1 ngày trước",
          type: "video"
        },
        {
          id: "act-2",
          title: "Nộp bài tập Pivot Table thực hành",
          desc: "Nộp file Excel báo cáo Pivot Table.",
          time: "2 ngày trước",
          type: "assignment"
        }
      ]
    },
    {
      id: 3,
      name: "Phạm Thu Hà",
      email: "hapham.1204@gmail.com",
      course: "UI/UX Design Fundamentals",
      progress: 93,
      lastActive: "3 giờ trước",
      hasCert: true,
      phone: "0934 567 890",
      enrolledAt: "10/02/2024",
      learningDuration: "28h 15m",
      courseDuration: "30h 00m",
      enrollmentCode: "MH-UI-240210-0987",
      lessonsCompleted: 42,
      totalLessons: 45,
      lessonsTimeline: [
        { title: "Bắt đầu khóa học", status: "completed", lastActive: "10/02/2024" },
        { title: "Chương 1: Figma Basics (15/15 bài)", status: "completed", lastActive: "25/02/2024" },
        { title: "Chương 2: User Research (12/12 bài)", status: "completed", lastActive: "15/03/2024" },
        { title: "Chương 3: Wireframing (15/15 bài)", status: "completed", lastActive: "10/04/2024" },
        { title: "Dự án cuối khóa (Đang thực hiện)", status: "in_progress", lastActive: "20/05/2024" }
      ],
      activities: [
        {
          id: "act-1",
          title: "Đã xem bài giảng Thiết kế Responsive UI",
          desc: "Học về Grid system và Auto-layout.",
          time: "3 giờ trước",
          type: "video"
        },
        {
          id: "act-2",
          title: "Tải UI Kit Wireframe Template",
          desc: "Tải file Figma template phục vụ bài tập.",
          time: "5 giờ trước",
          type: "resource"
        }
      ]
    },
    {
      id: 4,
      name: "Đỗ Quang Huy",
      email: "huydq2001@gmail.com",
      course: "Lập trình Python cơ bản",
      progress: 30,
      lastActive: "2 ngày trước",
      hasCert: false,
      phone: "0976 543 210",
      enrolledAt: "05/05/2024",
      learningDuration: "7h 15m",
      courseDuration: "25h 30m",
      enrollmentCode: "MH-PY-240505-1240",
      lessonsCompleted: 18,
      totalLessons: 60,
      lessonsTimeline: [
        { title: "Bắt đầu khóa học", status: "completed", lastActive: "05/05/2024" },
        { title: "Chương 1: Python cơ bản (18/18 bài)", status: "completed", lastActive: "15/05/2024" },
        { title: "Chương 2: Cấu trúc dữ liệu (Chưa bắt đầu)", status: "pending" }
      ],
      activities: [
        {
          id: "act-1",
          title: "Hoàn thành bài học Cú pháp & Biến",
          desc: "Đã xem hết 18 bài của Chương 1.",
          time: "2 ngày trước",
          type: "chapter"
        }
      ]
    },
    {
      id: 5,
      name: "Nguyễn Bảo Ngọc",
      email: "ngocnb.22@gmail.com",
      course: "Marketing Digital A-Z",
      progress: 61,
      lastActive: "5 giờ trước",
      hasCert: false,
      phone: "0909 123 456",
      enrolledAt: "12/03/2024",
      learningDuration: "15h 20m",
      courseDuration: "25h 00m",
      enrollmentCode: "MH-DM-240312-0854",
      lessonsCompleted: 30,
      totalLessons: 50,
      lessonsTimeline: [
        { title: "Bắt đầu khóa học", status: "completed", lastActive: "12/03/2024" },
        { title: "Chương 1: SEO cơ bản (15/15 bài)", status: "completed", lastActive: "28/03/2024" },
        { title: "Chương 2: Social Media Ads (15/15 bài)", status: "completed", lastActive: "20/04/2024" },
        { title: "Chương 3: Google Analytics (Chưa bắt đầu)", status: "pending" }
      ],
      activities: [
        {
          id: "act-1",
          title: "Đã xem bài giảng Tối ưu hóa quảng cáo Facebook",
          desc: "Xem video bài giảng về target đối tượng.",
          time: "5 giờ trước",
          type: "video"
        }
      ]
    },
    {
      id: 6,
      name: "Vũ Đức Anh",
      email: "anhvu.exe@gmail.com",
      course: "Data Analysis với Excel",
      progress: 88,
      lastActive: "1 giờ trước",
      hasCert: true,
      phone: "0982 334 455",
      enrolledAt: "01/03/2024",
      learningDuration: "19h 30m",
      courseDuration: "22h 00m",
      enrollmentCode: "MH-EX-240301-0731",
      lessonsCompleted: 35,
      totalLessons: 40,
      lessonsTimeline: [
        { title: "Bắt đầu khóa học", status: "completed", lastActive: "01/03/2024" },
        { title: "Chương 1: Công thức nâng cao (8/8 bài)", status: "completed", lastActive: "10/03/2024" },
        { title: "Chương 2: Pivot Table (12/12 bài)", status: "completed", lastActive: "25/03/2024" },
        { title: "Chương 3: Excel Dashboard (15/15 bài)", status: "completed", lastActive: "20/04/2024" },
        { title: "Dự án cuối khóa (Đang hoàn thiện)", status: "in_progress", lastActive: "20/05/2024" }
      ],
      activities: [
        {
          id: "act-1",
          title: "Đã xem bài giảng Xây dựng Báo cáo Dashboard",
          desc: "Xem xong video bài giảng dài 30 phút.",
          time: "1 giờ trước",
          type: "video"
        }
      ]
    },
    {
      id: 7,
      name: "Hoàng Yến Nhi",
      email: "nhi.hoang3011@gmail.com",
      course: "UI/UX Design Fundamentals",
      progress: 25,
      lastActive: "3 ngày trước",
      hasCert: false,
      phone: "0963 889 900",
      enrolledAt: "25/05/2024",
      learningDuration: "7h 30m",
      courseDuration: "30h 00m",
      enrollmentCode: "MH-UI-240525-1402",
      lessonsCompleted: 11,
      totalLessons: 45,
      lessonsTimeline: [
        { title: "Bắt đầu khóa học", status: "completed", lastActive: "25/05/2024" },
        { title: "Chương 1: Figma Basics (11/15 bài)", status: "in_progress", lastActive: "28/05/2024" }
      ],
      activities: [
        {
          id: "act-1",
          title: "Đã xem bài giảng Làm quen Figma Interface",
          desc: "Bắt đầu làm quen với Canvas và Toolbars.",
          time: "3 ngày trước",
          type: "video"
        }
      ]
    },
    {
      id: 8,
      name: "Bùi Tiến Dũng",
      email: "dungbt.99@gmail.com",
      course: "Lập trình Python cơ bản",
      progress: 67,
      lastActive: "12 giờ trước",
      hasCert: false,
      phone: "0955 667 788",
      enrolledAt: "10/04/2024",
      learningDuration: "17h 00m",
      courseDuration: "25h 30m",
      enrollmentCode: "MH-PY-240410-0933",
      lessonsCompleted: 40,
      totalLessons: 60,
      lessonsTimeline: [
        { title: "Bắt đầu khóa học", status: "completed", lastActive: "10/04/2024" },
        { title: "Chương 1: Python cơ bản (10/10 bài)", status: "completed", lastActive: "20/04/2024" },
        { title: "Chương 2: Cấu trúc dữ liệu (10/10 bài)", status: "completed", lastActive: "05/05/2024" },
        { title: "Chương 3: Hàm và Module (20/20 bài)", status: "completed", lastActive: "20/05/2024" },
        { title: "Chương 4: OOP trong Python (Chưa bắt đầu)", status: "pending" }
      ],
      activities: [
        {
          id: "act-1",
          title: "Đã xem bài giảng Lập trình Hướng đối tượng OOP",
          desc: "Tìm hiểu về Class và Object.",
          time: "12 giờ trước",
          type: "video"
        }
      ]
    }
  ]
};
