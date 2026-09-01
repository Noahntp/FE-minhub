import React from 'react';
import { Route, Navigate } from 'react-router-dom';

const AdminDashboard = React.lazy(() => import('@/features/admin/AdminDashboard').then((m) => ({ default: m.default })));

interface AdminRoutesProps {
  isLoggedIn: boolean;
  currentUser: any;
}

export const AdminRoutes = ({ isLoggedIn, currentUser }: AdminRoutesProps) => {
  const isAdmin = isLoggedIn && currentUser?.role === 'admin';

  return (
    <>
      <Route path="/admin/*" element={isAdmin ? <AdminDashboard /> : <Navigate to="/" replace />} />
    </>
  );
};
