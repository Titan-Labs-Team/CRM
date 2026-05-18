import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';
import { UpgradeModal } from '@/components/billing/UpgradeModal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

export function AppShell() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-primary">
      {/* Mobile overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar — hidden on mobile unless toggled */}
      <div
        className={`
          fixed inset-y-0 left-0 z-40 md:static md:z-auto
          transform transition-transform duration-200
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <Sidebar onClose={() => setMobileSidebarOpen(false)} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Mobile hamburger prepended inside the topbar area */}
        <div className="md:hidden absolute top-0 left-0 z-50 h-12 flex items-center pl-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-1.5 rounded text-text-muted hover:text-text-primary"
          >
            <Menu size={18} />
          </button>
        </div>

        <Topbar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>

      <ChangePasswordModal />
      <UpgradeModal />
    </div>
  );
}
