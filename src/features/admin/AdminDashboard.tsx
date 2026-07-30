import React, { useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import AdminLayout from '@/features/admin/components/AdminLayout';

// Import all the generated pages
import DashboardOverview from '@/features/admin/components/pages/DashboardOverview';
import UsersManagement from '@/features/admin/components/pages/UsersManagement';
import CoursesManagement from '@/features/admin/components/pages/CoursesManagement';
import RevenuesManagement from '@/features/admin/components/pages/RevenuesManagement';
import OrdersManagement from '@/features/admin/components/pages/OrdersManagement';
import WithdrawalsManagement from '@/features/admin/components/pages/WithdrawalsManagement';
import CategoriesManagement from '@/features/admin/components/pages/CategoriesManagement';
import CourseReviews from '@/features/admin/components/pages/CourseReviews';
import Faqs from '@/features/admin/components/pages/Faqs';
import InstructorUpgrades from '@/features/admin/components/pages/InstructorUpgrades';
import Moderation from '@/features/admin/components/pages/Moderation';
import Notifications from '@/features/admin/components/pages/Notifications';
import PayoutAccounts from '@/features/admin/components/pages/PayoutAccounts';
import Reports from '@/features/admin/components/pages/Reports';
import Banners from '@/features/admin/components/pages/Banners';

export default function AdminDashboard() {
  const { adminId } = useParams<{ adminId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  // Extract active tab from URL path (e.g., /admin/1/categories -> categories)
  const pathParts = location.pathname.split('/');
  const tabFromPath = pathParts[3] || 'dashboard';
  const activeTab = tabFromPath === '' ? 'dashboard' : tabFromPath;

  // Redirect /admin/:id or /admin/:id/ to /admin/:id/dashboard
  useEffect(() => {
    if (adminId && (location.pathname === `/admin/${adminId}` || location.pathname === `/admin/${adminId}/`)) {
      navigate(`/admin/${adminId}/dashboard`, { replace: true });
    }
  }, [location.pathname, adminId, navigate]);

  const handleTabChange = (tabId: string) => {
    if (adminId) {
      navigate(`/admin/${adminId}/${tabId}`);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardOverview />;
      case 'users': return <UsersManagement />;
      case 'courses': return <CoursesManagement />;
      case 'revenues': return <RevenuesManagement />;
      case 'orders': return <OrdersManagement />;
      case 'withdrawals': return <WithdrawalsManagement />;
      case 'categories': return <CategoriesManagement />;
      case 'course-reviews': return <CourseReviews />;
      case 'faqs': return <Faqs />;
      case 'instructor-upgrades': return <InstructorUpgrades />;
      case 'moderation': return <Moderation />;
      case 'notifications': return <Notifications />;
      case 'payout-accounts': return <PayoutAccounts />;
      case 'reports': return <Reports />;
      case 'banners': return <Banners />;
      default: return <DashboardOverview />;
    }
  };

  const getBreadcrumb = () => {
    const map: Record<string, string> = {
      'dashboard': 'Dashboard Tổng quan',
      'users': 'Quản lý người dùng',
      'courses': 'Quản lý khóa học',
      'revenues': 'Doanh thu / Chia sẻ',
      'orders': 'Đơn hàng / Thanh toán',
      'withdrawals': 'Yêu cầu rút tiền',
      'categories': 'Quản lý danh mục',
      'course-reviews': 'Kiểm duyệt khóa học',
      'faqs': 'Quản lý FAQ',
      'instructor-upgrades': 'Yêu cầu lên giảng viên',
      'moderation': 'Kiểm duyệt bình luận',
      'notifications': 'Thông báo',
      'payout-accounts': 'Tài khoản nhận tiền',
      'reports': 'Báo cáo và thống kê',
      'banners': 'Banner / Trang chủ',
    };
    return map[activeTab] || 'Dashboard';
  };

  return (
    <AdminLayout 
      activeTab={activeTab} 
      onTabChange={handleTabChange}
      breadcrumbLabel={getBreadcrumb()}
    >
      {renderContent()}
    </AdminLayout>
  );
}
