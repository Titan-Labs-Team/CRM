import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { ProtectedRoute } from './ProtectedRoute';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { ContactsPage } from '@/pages/contacts/ContactsPage';
import { ContactDetailPage } from '@/pages/contacts/ContactDetailPage';
import { PipelinePage } from '@/pages/pipeline/PipelinePage';
import { DealDetailPage } from '@/pages/deals/DealDetailPage';
import { CalendarPage } from '@/pages/calendar/CalendarPage';
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
      { path: '/pipeline', element: <PipelinePage /> },
      { path: '/pipeline/:pipelineId', element: <PipelinePage /> },
      { path: '/contacts', element: <ContactsPage /> },
      { path: '/contacts/:id', element: <ContactDetailPage /> },
      { path: '/deals/:id', element: <DealDetailPage /> },
      { path: '/calendar', element: <CalendarPage /> },
      {
        path: '/reports',
        element: <ComingSoonPage title="Relatórios" milestone="Milestone 5" />,
      },
      {
        path: '/settings',
        element: <ComingSoonPage title="Configurações" milestone="Milestone 5" />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
