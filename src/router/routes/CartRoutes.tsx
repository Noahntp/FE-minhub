import React from 'react';
import { Route, useNavigate, useSearchParams } from 'react-router-dom';
import { useApp } from '@/app/AppContext';
import { INITIAL_COURSES } from '@/shared/data';

const CartAndCheckout = React.lazy(() => import('@/features/cart/CartAndCheckout').then((m) => ({ default: m.default })));
const VNPayReturnPage = React.lazy(() => import('@/features/cart/VNPayReturnPage').then((m) => ({ default: m.default })));

// Wrapper for Cart and Checkout to resolve target course from URL search params or cart state
const CartCheckoutPageWrapper = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    favorites,
    setFavorites,
    courses,
    enrolledCourseIds,
    setEnrolledCourseIds,
    setOrders,
    cart,
    setCart,
  } = useApp();

  const allCoursesList = courses && courses.length > 0 ? courses : INITIAL_COURSES;
  const courseIdParam = searchParams.get('courseId');
  const initialCourseId = courseIdParam || (cart.length > 0 ? cart[cart.length - 1] : null);

  const handleEnrollSuccess = (courseIds: string[], order: any) => {
    if (courseIds && courseIds.length > 0) {
      setEnrolledCourseIds((prev) => Array.from(new Set([...prev, ...courseIds])));
      setCart((prev) => prev.filter((id) => !courseIds.includes(id)));
    }
    if (order) {
      setOrders((prev) => [order, ...prev]);
    }
  };

  const handleToggleFavorite = (cId: string) => {
    setFavorites((prev) => (prev.includes(cId) ? prev.filter((id) => id !== cId) : [...prev, cId]));
  };

  const handleEnterLesson = (course: any) => {
    navigate(`/learn/${course.id}`);
  };

  return (
    <CartAndCheckout
      wishlistCourseIds={favorites}
      allCourses={allCoursesList}
      enrolledCourseIds={enrolledCourseIds}
      onEnrollSuccess={handleEnrollSuccess}
      onClose={() => navigate('/')}
      onToggleFavorite={handleToggleFavorite}
      onEnterLesson={handleEnterLesson}
      initialCourseId={initialCourseId}
    />
  );
};

const VNPayReturnPageWrapper = () => {
  const navigate = useNavigate();
  const navigateTo = (path: string) => navigate(path.startsWith('/') ? path : `/${path}`);
  return <VNPayReturnPage onNavigate={navigateTo} />;
};

import { PublicStorefrontGuard } from '../RouteGuards';

export const CartRoutes = () => {
  return (
    <>
      <Route
        path="/cart"
        element={
          <PublicStorefrontGuard>
            <CartCheckoutPageWrapper />
          </PublicStorefrontGuard>
        }
      />
      <Route
        path="/checkout"
        element={
          <PublicStorefrontGuard>
            <CartCheckoutPageWrapper />
          </PublicStorefrontGuard>
        }
      />
      <Route
        path="/vnpay-return"
        element={
          <PublicStorefrontGuard>
            <VNPayReturnPageWrapper />
          </PublicStorefrontGuard>
        }
      />
    </>
  );
};
