import { 
  LayoutDashboard, 
  BookOpen, 
  Plus, 
  MessageSquare, 
  Users, 
  BarChart3, 
  DollarSign, 
  Tag, 
  UserRound 
} from 'lucide-react';

export interface InstructorNavItem {
  key: string;
  label: string;
  path: string;
  icon: any;
  exact?: boolean;
}

export const INSTRUCTOR_NAVIGATION_ITEMS: InstructorNavItem[] = [
  {
    key: 'dashboard',
    label: 'Tổng quan',
    path: '/instructor/dashboard',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    key: 'courses',
    label: 'Khóa học của tôi',
    path: '/instructor/courses',
    icon: BookOpen,
  },
  {
    key: 'create-course',
    label: 'Tạo khóa học',
    path: '/instructor/courses/create',
    icon: Plus,
    exact: true,
  },
  {
    key: 'questions',
    label: 'Hỏi đáp & Bình luận',
    path: '/instructor/questions',
    icon: MessageSquare,
  },
  {
    key: 'students',
    label: 'Học viên',
    path: '/instructor/students',
    icon: Users,
  },
  {
    key: 'revenue',
    label: 'Doanh thu',
    path: '/instructor/revenue',
    icon: BarChart3,
  },
  {
    key: 'withdrawals',
    label: 'Rút tiền',
    path: '/instructor/withdrawals',
    icon: DollarSign,
  },
  {
    key: 'discount-codes',
    label: 'Mã giảm giá',
    path: '/instructor/discount-codes',
    icon: Tag,
  },
  {
    key: 'profile',
    label: 'Hồ sơ',
    path: '/instructor/profile',
    icon: UserRound,
  },
];

/**
 * Determine active navigation key based on current URL path or activeTab string
 */
export function getActiveNavigationKey(pathname: string, activeTab?: string, builderStep?: number): string {
  const path = (pathname || '').toLowerCase();

  // Create course has high priority
  if (path.includes('/instructor/courses/create') || (activeTab === 'builder' && (builderStep === undefined || builderStep < 5))) {
    return 'create-course';
  }
  if (path.includes('/instructor/dashboard') || activeTab === 'overview' || activeTab === 'dashboard') {
    return 'dashboard';
  }
  if (path.includes('/instructor/questions') || activeTab === 'qa' || activeTab === 'questions') {
    return 'questions';
  }
  if (path.includes('/instructor/students') || activeTab === 'students') {
    return 'students';
  }
  if (path.includes('/instructor/revenue') || activeTab === 'revenue') {
    return 'revenue';
  }
  if (path.includes('/instructor/withdrawals') || path.includes('/instructor/payout') || activeTab === 'payout' || activeTab === 'withdrawals') {
    return 'withdrawals';
  }
  if (path.includes('/instructor/discount-codes') || path.includes('/instructor/coupons') || activeTab === 'coupons' || activeTab === 'discount-codes') {
    return 'discount-codes';
  }
  if (path.includes('/instructor/profile') || path.includes('/instructor/security') || activeTab === 'security' || activeTab === 'profile') {
    return 'profile';
  }
  if (path.includes('/instructor/courses') || activeTab === 'courses' || activeTab === 'builder') {
    return 'courses';
  }

  return 'dashboard';
}

/**
 * Get Breadcrumb display label based on active key
 */
export function getBreadcrumbLabel(activeKey: string): string {
  const matched = INSTRUCTOR_NAVIGATION_ITEMS.find(item => item.key === activeKey);
  return matched ? matched.label : 'Tổng quan';
}
