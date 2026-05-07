import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import type { StageWithDeals, Deal } from '@/services/pipeline.service';
import { KanbanCard } from './KanbanCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  stage: StageWithDeals;
  onAddDeal: (stageId: string) => void;
  onWon: (id: string) => void;
  onLost: (id: string) => void;
  onDealClick: (deal: Deal) => void;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function KanbanColumn({ stage, onAddDeal, onWon, onLost, onDealClick }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id, data: { type: 'column', stageId: stage.id } });

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
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
        ref={setNodeRef}
        className={cn(
          'flex-1 min-h-24 rounded-lg p-2 space-y-2 transition-colors',
          isOver ? 'bg-accent-green/5 ring-1 ring-accent-green/30' : 'bg-bg-surface/30',
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
          <Plus size={12} /> Add deal
        </button>
      </div>
    </div>
  );
}
