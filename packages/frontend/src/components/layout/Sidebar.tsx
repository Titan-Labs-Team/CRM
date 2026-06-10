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
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { useBilling } from '@/hooks/useBilling';
import { useTenant } from '@/hooks/useTenant';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { LogoIcon } from '@/components/ui/LogoIcon';

const PLAN_BADGE: Record<string, { label: string; className: string }> = {
  free: { label: 'FREE', className: 'text-text-muted bg-bg-border' },
  starter: { label: 'STARTER', className: 'text-status-open bg-status-open/20' },
  pro: { label: 'PRO', className: 'text-accent-green bg-accent-green/20' },
  enterprise: { label: 'ENTERPRISE', className: 'text-purple-400 bg-purple-500/20' },
};

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/pipeline', icon: Kanban, label: 'Pipeline' },
  { to: '/contacts', icon: Users, label: 'Contatos' },
  { to: '/deals', icon: Briefcase, label: 'Negócios' },
  { to: '/calendar', icon: Calendar, label: 'Calendário' },
  { to: '/reports', icon: BarChart3, label: 'Relatórios' },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const { data: billing } = useBilling();
  const { data: tenant } = useTenant();
  const plan = billing?.plan ?? 'free';
  const planBadge = PLAN_BADGE[plan] ?? PLAN_BADGE.free;

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-bg-darker border-r border-bg-border transition-all duration-200',
        sidebarCollapsed ? 'w-14' : 'w-56',
      )}
    >

      <div className="flex items-center justify-between p-3 border-b border-bg-border">
        <div className="flex items-center gap-2 overflow-hidden">
          <LogoIcon size={22} className="flex-shrink-0" />
          {!sidebarCollapsed && (
            <span className="font-semibold text-sm text-text-primary truncate">TitanFlow</span>
          )}
        </div>
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
            onClick={onClose}
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
          title={sidebarCollapsed ? 'Configurações' : undefined}
        >
          <Settings size={16} className="flex-shrink-0" />
          {!sidebarCollapsed && <span>Configurações</span>}
        </NavLink>

        {user && !sidebarCollapsed && (
          <div className="flex items-center gap-2 px-2 py-2 mt-1">
            <Avatar name={user.full_name} size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user.full_name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant={user.role as 'admin' | 'manager' | 'seller'}
                >
                  {{ admin: 'Admin', manager: 'Gerente', seller: 'Vendedor' }[user.role] ?? user.role}
                </Badge>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${planBadge.className}`}>
                  {plan === 'free' ? <span className="flex items-center gap-0.5"><Zap size={9} />{planBadge.label}</span> : planBadge.label}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
