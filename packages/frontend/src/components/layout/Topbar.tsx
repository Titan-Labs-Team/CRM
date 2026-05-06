import { LogOut, Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { useNavigate } from 'react-router-dom';

export function Topbar() {
  const { user, refreshToken, logout } = useAuthStore();
  const navigate = useNavigate();

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
    <header className="h-12 flex items-center justify-between px-4 border-b border-bg-border bg-bg-primary">
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" title="Notifications">
          <Bell size={16} />
        </Button>

        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-bg-border">
            <Avatar name={user.full_name} size="sm" />
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign out">
              <LogOut size={14} />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
