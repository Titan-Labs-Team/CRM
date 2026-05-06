import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Kanban,
  Users,
  Briefcase,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/deals', icon: Briefcase, label: 'Deals' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
];

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-bg-darker border-r border-bg-border transition-all duration-200',
        sidebarCollapsed ? 'w-14' : 'w-56',
      )}
    >
      <div className="flex items-center justify-between p-3 border-b border-bg-border">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="h-6 w-6 rounded bg-accent-green flex-shrink-0" />
            <span className="font-semibold text-sm text-text-primary truncate">Titan Labs</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors ml-auto"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-2 py-2 rounded text-sm transition-colors',
                isActive
                  ? 'bg-accent-green/10 text-accent-green'
                  : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary',
                sidebarCollapsed && 'justify-center',
              )
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon size={16} className="flex-shrink-0" />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="p-2 border-t border-bg-border space-y-0.5">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-2 py-2 rounded text-sm transition-colors',
              isActive
                ? 'bg-accent-green/10 text-accent-green'
                : 'text-text-secondary hover:bg-bg-surface hover:text-text-primary',
              sidebarCollapsed && 'justify-center',
            )
          }
          title={sidebarCollapsed ? 'Settings' : undefined}
        >
          <Settings size={16} className="flex-shrink-0" />
          {!sidebarCollapsed && <span>Settings</span>}
        </NavLink>

        {user && !sidebarCollapsed && (
          <div className="flex items-center gap-2 px-2 py-2 mt-1">
            <Avatar name={user.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user.full_name}</p>
              <Badge
                variant={user.role as 'admin' | 'manager' | 'seller'}
                className="mt-0.5"
              >
                {user.role}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
