import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';
import type { StageWithDeals, Deal } from '@/services/pipeline.service';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  stage: StageWithDeals;
  onAddDeal: (stageId: string) => void;
  onWon: (id: string, title: string) => void;
  onLost: (id: string, title: string) => void;
  onDealClick: (deal: Deal) => void;
  isCardDragActive?: boolean;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function KanbanColumn({ stage, onAddDeal, onWon, onLost, onDealClick, isCardDragActive }: KanbanColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver,
  } = useSortable({
    id: stage.id,
    data: { type: 'column' },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('flex flex-col w-72 flex-shrink-0', isDragging && 'opacity-50')}
    >
      {/* Column header card */}
      <div
        className="rounded-lg mb-3 overflow-hidden border border-bg-border bg-bg-surface"
        style={{ borderLeft: `3px solid ${stage.color}` }}
      >
        <div className="flex items-start justify-between px-4 py-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary transition-colors touch-none flex-shrink-0"
              tabIndex={-1}
            >
              <GripVertical size={13} />
            </button>
            <div className="min-w-0">
              <p
                className="text-xs font-bold tracking-widest uppercase truncate"
                style={{ color: stage.color }}
              >
                {stage.name}
              </p>
              <p className="text-xs text-text-secondary mt-0.5">{formatCurrency(stage.totalValue)}</p>
            </div>
          </div>
          <span className="ml-2 flex-shrink-0 text-xs font-semibold text-text-muted bg-bg-border px-2 py-0.5 rounded-full">
            {stage.deals.length}
          </span>
        </div>
      </div>

      {/* Cards container */}
      <div
        className={cn(
          'flex-1 min-h-24 rounded-lg p-2 space-y-2 transition-colors',
          isOver && isCardDragActive ? 'bg-accent-green/5 ring-1 ring-accent-green/30' : 'bg-transparent',
        )}
      >
        <SortableContext items={stage.deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {stage.deals.map((deal) => (
            <KanbanCard
              key={deal.id}
              deal={deal}
              onWon={(id, title) => onWon(id, title)}
              onLost={(id, title) => onLost(id, title)}
              onClick={onDealClick}
            />
          ))}
        </SortableContext>

        <button
          onClick={() => onAddDeal(stage.id)}
          className="w-full flex items-center gap-2 px-2 py-2 rounded text-xs text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors"
        >
          <Plus size={12} /> Novo negócio
        </button>
      </div>
    </div>
  );
}
