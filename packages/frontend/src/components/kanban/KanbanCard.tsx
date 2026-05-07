import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Trophy, X, Calendar, User } from 'lucide-react';
import type { Deal } from '@/services/pipeline.service';
import { cn } from '@/lib/utils';

interface KanbanCardProps {
  deal: Deal;
  onWon: (id: string) => void;
  onLost: (id: string) => void;
  onClick: (deal: Deal) => void;
}

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
}

export function KanbanCard({ deal, onWon, onLost, onClick }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: deal.id,
    data: { type: 'deal', deal },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-bg-primary border border-bg-border rounded-lg p-3 cursor-grab active:cursor-grabbing',
        'hover:border-accent-green/40 transition-colors group',
        isDragging && 'opacity-40 ring-1 ring-accent-green',
      )}
      onClick={() => !isDragging && onClick(deal)}
    >
      <p className="text-sm font-medium text-text-primary leading-snug mb-2">{deal.title}</p>

      {deal.contact_name && (
        <div className="flex items-center gap-1.5 text-xs text-text-muted mb-2">
          <User size={11} />
          <span className="truncate">{deal.contact_name}</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-accent-green">
          {formatCurrency(Number(deal.value), deal.currency)}
        </span>

        {deal.expected_close && (
          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Calendar size={10} />
            <span>{new Date(deal.expected_close).toLocaleDateString('pt-BR')}</span>
          </div>
        )}
      </div>

      <div className="flex gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => onWon(deal.id)}
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-status-won/10 text-status-won hover:bg-status-won/20 transition-colors"
        >
          <Trophy size={10} /> Won
        </button>
        <button
          onClick={() => onLost(deal.id)}
          className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-status-lost/10 text-status-lost hover:bg-status-lost/20 transition-colors"
        >
          <X size={10} /> Lost
        </button>
      </div>
    </div>
  );
}
