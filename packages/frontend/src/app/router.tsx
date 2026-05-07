import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ContactsPage } from '@/pages/contacts/ContactsPage';
import { ContactDetailPage } from '@/pages/contacts/ContactDetailPage';
import { ComingSoonPage } from '@/pages/ComingSoonPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      {
        path: '/pipeline',
        element: <ComingSoonPage title="Pipeline" milestone="Milestone 3" />,
      },
      { path: '/contacts', element: <ContactsPage /> },
      { path: '/contacts/:id', element: <ContactDetailPage /> },
      {
        path: '/deals',
        element: <ComingSoonPage title="Deals" milestone="Milestone 3" />,
      },
      {
        path: '/calendar',
        element: <ComingSoonPage title="Calendar" milestone="Milestone 4" />,
      },
      {
        path: '/reports',
        element: <ComingSoonPage title="Reports" milestone="Milestone 5" />,
      },
      {
        path: '/settings',
        element: <ComingSoonPage title="Settings" milestone="Milestone 5" />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
