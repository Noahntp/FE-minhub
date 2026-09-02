import React from 'react';
import { Route } from 'react-router-dom';
import { WorkspaceRouteGuard } from '../RouteGuards';

const AdminDashboard = React.lazy(() => import('@/features/admin/AdminDashboard').then((m) => ({ default: m.default })));

export const AdminRoutes = () => {
  return (
    <>
      <Route
        path="/admin/*"
        element={
          <WorkspaceRouteGuard allowedRole="admin">
            <AdminDashboard />
          </WorkspaceRouteGuard>
        }
      />
    </>
  );
};
