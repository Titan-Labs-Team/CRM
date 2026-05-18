import { useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Bell, CheckCheck, Trophy, TrendingDown, ArrowRightLeft, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';
import type { Notification } from '@/services/notifications.service';

const TYPE_ICON: Record<string, LucideIcon> = {
  'deal.won': Trophy,
  'deal.lost': TrendingDown,
  'deal.stage_changed': ArrowRightLeft,
};

function NotificationItem({ n, onRead }: { n: Notification; onRead: (id: string) => void }) {
  const Icon = TYPE_ICON[n.type] ?? Bell;
  return (
    <button
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-bg-border transition-colors',
        !n.read && 'bg-accent-green/5',
      )}
      onClick={() => !n.read && onRead(n.id)}
    >
      <div
        className={cn(
          'mt-0.5 p-1.5 rounded-full flex-shrink-0',
          n.type === 'deal.won' && 'bg-status-won/20 text-status-won',
          n.type === 'deal.lost' && 'bg-status-lost/20 text-status-lost',
          n.type === 'deal.stage_changed' && 'bg-status-open/20 text-status-open',
          !TYPE_ICON[n.type] && 'bg-bg-border text-text-muted',
        )}
      >
        <Icon size={12} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm truncate', n.read ? 'text-text-secondary' : 'text-text-primary font-medium')}>
          {n.title}
        </p>
        {n.body && <p className="text-xs text-text-muted truncate mt-0.5">{n.body}</p>}
        <p className="text-[10px] text-text-muted mt-1">
          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
        </p>
      </div>
      {!n.read && <span className="w-2 h-2 rounded-full bg-accent-green flex-shrink-0 mt-1.5" />}
    </button>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export function NotificationPanel({ open, onClose }: Props) {
  const { notifications, markRead, markAllRead } = useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-2 w-80 bg-bg-surface border border-bg-border rounded-xl shadow-xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-bg-border">
        <h3 className="text-sm font-semibold text-text-primary">Notificações</h3>
        {notifications.some((n) => !n.read) && (
          <button
            onClick={() => markAllRead.mutate()}
            className="flex items-center gap-1 text-[11px] text-accent-green hover:text-accent-green-dim transition-colors"
          >
            <CheckCheck size={12} />
            Marcar todas
          </button>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto divide-y divide-bg-border">
        {notifications.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <Bell size={24} className="mx-auto text-text-muted mb-2" />
            <p className="text-sm text-text-muted">Nenhuma notificação</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItem key={n.id} n={n} onRead={(id) => markRead.mutate(id)} />
          ))
        )}
      </div>
    </div>
  );
}
