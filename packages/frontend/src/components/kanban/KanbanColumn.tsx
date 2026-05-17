import { useSortable, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus } from 'lucide-react';
import type { StageWithDeals, Deal } from '@/services/pipeline.service';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  stage: StageWithDeals;
  onAddDeal: (stageId: string) => void;
  onWon: (id: string) => void;
  onLost: (id: string) => void;
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
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary transition-colors touch-none"
            tabIndex={-1}
          >
            <GripVertical size={14} />
          </button>
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: stage.color }} />
          <span className="text-sm font-medium text-text-primary">{stage.name}</span>
          <span className="text-xs text-text-muted bg-bg-surface px-1.5 py-0.5 rounded">
            {stage.deals.length}
          </span>
        </div>
        <div className="text-xs text-text-muted">{formatCurrency(stage.totalValue)}</div>
      </div>

      {/* Cards container */}
      <div
        className={cn(
          'flex-1 min-h-24 rounded-lg p-2 space-y-2 transition-colors',
          isOver && isCardDragActive ? 'bg-accent-green/5 ring-1 ring-accent-green/30' : 'bg-bg-surface/30',
        )}
      >
        <SortableContext items={stage.deals.map((d) => d.id)} strategy={verticalListSortingStrategy}>
          {stage.deals.map((deal) => (
            <KanbanCard
              key={deal.id}
              deal={deal}
              onWon={onWon}
              onLost={onLost}
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
