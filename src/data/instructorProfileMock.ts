export interface InstructorProfileMockData {
  fullName: string;
  email: string;
  phone: string;
  expertise: string;
  bio: string;
  website: string;
  facebook: string;
  linkedin: string;
  youtube: string;
  avatar: string;
  notifications: Array<{
    id: number;
    title: string;
    desc: string;
    time: string;
    type: string;
  }>;
  quickSettings: {
    emailNotifications: boolean;
    smsAlerts: boolean;
  };
  accountStatus: {
    status: string;
    emailVerified: boolean;
    phoneVerified: boolean;
    policyCompliance: string;
    reputation: string;
  };
  payoutShortcut: {
    bankName: string;
    accountNumber: string;
    isDefault: boolean;
  };
}

export const INSTRUCTOR_PROFILE_MOCK: InstructorProfileMockData = {
  fullName: "Nguyễn Văn Minh",
  email: "minh.nguyen@mindhub.vn",
  phone: "0912 345 678",
  expertise: "Lập trình Web",
  bio: "Giảng viên lập trình web với hơn 6 năm kinh nghiệm giảng dạy và phát triển dự án thực tế. Đam mê chia sẻ kiến thức và giúp học viên xây dựng sự nghiệp vững chắc trong lĩnh vực công nghệ.",
  website: "https://minddev.vn",
  facebook: "https://facebook.com/minddev",
  linkedin: "https://linkedin.com/in/minddev",
  youtube: "https://youtube.com/@minddev",
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60",
  notifications: [
    {
      id: 1,
      title: "Doanh thu tháng 5 đã được thanh toán",
      desc: "Khoản thanh toán 5.250.000đ đã chuyển thành công.",
      time: "2 giờ trước",
      type: "payout",
    },
    {
      id: 2,
      title: "Bạn có 3 đánh giá mới cho khóa học",
      desc: 'Học viên đã để lại đánh giá cho khóa học "ReactJS Cơ Bản đến Nâng Cao".',
      time: "5 giờ trước",
      type: "review",
    },
    {
      id: 3,
      title: "Khóa học của bạn đang được quan tâm",
      desc: '"Node.js Thực Chiến" đạt 200 ghi danh mới.',
      time: "1 ngày trước",
      type: "trend",
    },
    {
      id: 4,
      title: "Cập nhật chính sách giảng viên",
      desc: "MindHub cập nhật chính sách chia sẻ doanh thu từ 01/06/2024.",
      time: "2 ngày trước",
      type: "policy",
    },
  ],
  quickSettings: {
    emailNotifications: true,
    smsAlerts: true,
  },
  accountStatus: {
    status: "Đang hoạt động",
    emailVerified: true,
    phoneVerified: true,
    policyCompliance: "Tốt",
    reputation: "4.9/5",
  },
  payoutShortcut: {
    bankName: "Techcombank",
    accountNumber: "**** 1234",
    isDefault: true,
  },
};
