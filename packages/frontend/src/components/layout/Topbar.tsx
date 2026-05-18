import { useState, useEffect } from 'react';
import { LogOut, Bell, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationPanel } from '@/components/notifications/NotificationPanel';
import { SearchModal } from '@/components/search/SearchModal';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { user, refreshToken, logout } = useAuthStore();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await authService.logout(refreshToken);
      } catch {
        // token already expired — proceed with local logout
      }
    }
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-12 flex items-center justify-between px-4 border-b border-bg-border bg-bg-primary">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-bg-border bg-bg-surface text-text-muted hover:text-text-primary hover:border-accent-green/40 transition-colors text-sm"
        >
          <Search size={13} />
          <span className="hidden sm:inline">Buscar...</span>
          <kbd className="hidden sm:inline text-[10px] border border-bg-border rounded px-1 ml-1">⌘K</kbd>
        </button>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              title="Notificações"
              onClick={() => setNotifOpen((v) => !v)}
              className={cn(notifOpen && 'text-accent-green')}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 flex items-center justify-center bg-accent-green text-bg-primary text-[9px] font-bold rounded-full px-0.5">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Button>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-bg-border">
              <Avatar name={user.full_name} size="sm" />
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Sair">
                <LogOut size={14} />
              </Button>
            </div>
          )}
        </div>
      </header>

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
