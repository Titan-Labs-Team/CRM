import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Plus, Settings } from 'lucide-react';
import { useKanban, usePipelines, useCreateDeal, useMoveDeal, useMarkWon, useMarkLost, useCreatePipeline } from '@/hooks/usePipeline';
import { useQueryClient } from '@tanstack/react-query';
import { pipelineKeys } from '@/hooks/usePipeline';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { KanbanCard } from '@/components/kanban/KanbanCard';
import { DealForm } from '@/components/kanban/DealForm';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { StageWithDeals, Deal } from '@/services/pipeline.service';
import { dealsService } from '@/services/pipeline.service';
import { toast } from 'sonner';

export function PipelinePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: pipelines, isLoading: loadingPipelines } = usePipelines();
  const [activePipelineId, setActivePipelineId] = useState<string>('');
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [defaultStageId, setDefaultStageId] = useState<string>('');
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [localStages, setLocalStages] = useState<StageWithDeals[]>([]);

  const { data: kanban, isLoading: loadingKanban } = useKanban(activePipelineId);
  const createDeal = useCreateDeal();
  const moveDeal = useMoveDeal();
  const markWon = useMarkWon();
  const markLost = useMarkLost();
  const createPipeline = useCreatePipeline();

  useEffect(() => {
    if (pipelines && pipelines.length > 0 && !activePipelineId) {
      const def = pipelines.find((p) => p.is_default) ?? pipelines[0];
      setActivePipelineId(def.id);
    }
  }, [pipelines, activePipelineId]);

  useEffect(() => {
    if (kanban) setLocalStages(kanban);
  }, [kanban]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const handleDragStart = ({ active }: DragStartEvent) => {
    const deal = localStages.flatMap((s) => s.deals).find((d) => d.id === active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    const activeStage = localStages.find((s) => s.deals.some((d) => d.id === active.id));
    const overStage = localStages.find(
      (s) => s.id === over.id || s.deals.some((d) => d.id === over.id),
    );
    if (!activeStage || !overStage || activeStage.id === overStage.id) return;

    setLocalStages((prev) =>
      prev.map((s) => {
        if (s.id === activeStage.id) return { ...s, deals: s.deals.filter((d) => d.id !== active.id) };
        if (s.id === overStage.id) {
          const deal = activeStage.deals.find((d) => d.id === active.id)!;
          return { ...s, deals: [...s.deals, { ...deal, stage_id: s.id }] };
        }
        return s;
      }),
    );
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveDeal(null);
    if (!over) return;

    const activeStage = localStages.find((s) => s.deals.some((d) => d.id === active.id));
    const overStage = localStages.find(
      (s) => s.id === over.id || s.deals.some((d) => d.id === over.id),
    );
    if (!activeStage || !overStage) return;

    if (activeStage.id === overStage.id) {
      const oldIdx = activeStage.deals.findIndex((d) => d.id === active.id);
      const newIdx = activeStage.deals.findIndex((d) => d.id === over.id);
      if (oldIdx === newIdx) return;

      const reordered = arrayMove(activeStage.deals, oldIdx, newIdx);
      setLocalStages((prev) =>
        prev.map((s) => (s.id === activeStage.id ? { ...s, deals: reordered } : s)),
      );
      await dealsService.reorder(activeStage.id, reordered.map((d) => d.id));
    } else {
      const position = overStage.deals.findIndex((d) => d.id === over.id);
      await moveDeal.mutateAsync({ id: String(active.id), stageId: overStage.id, position });
    }

    qc.invalidateQueries({ queryKey: pipelineKeys.kanban(activePipelineId) });
  };

  const openDealModal = (stageId: string) => {
    setDefaultStageId(stageId);
    setDealModalOpen(true);
  };

  const handleCreateDeal = async (data: {
    title: string; stageId: string; value?: number; expectedClose?: string;
  }) => {
    await createDeal.mutateAsync({
      title: data.title,
      pipelineId: activePipelineId,
      stageId: data.stageId,
      value: data.value,
      expectedClose: data.expectedClose,
    });
    setDealModalOpen(false);
  };

  const handleCreateFirstPipeline = async () => {
    const pipeline = await createPipeline.mutateAsync({ name: 'Pipeline de Vendas' });
    setActivePipelineId(pipeline.id);
  };

  if (loadingPipelines) return <div className="flex justify-center py-24"><Spinner /></div>;

  if (!pipelines || pipelines.length === 0) {
    return (
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold text-text-primary">Pipeline</h1>
        <div className="card p-12 flex flex-col items-center justify-center gap-4 text-center">
          <p className="text-text-secondary text-sm">Nenhum pipeline ainda. Crie um para começar.</p>
          <Button onClick={handleCreateFirstPipeline} disabled={createPipeline.isPending}>
            <Plus size={14} /> Criar pipeline
          </Button>
        </div>
      </div>
    );
  }

  const allStages = localStages.flatMap((s) => s);

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-text-primary">Pipeline</h1>
          <div className="flex gap-1">
            {pipelines.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePipelineId(p.id)}
                className={`px-3 py-1 rounded text-sm transition-colors ${
                  activePipelineId === p.id
                    ? 'bg-accent-green text-bg-darker font-medium'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => toast.info('Configurações de pipeline em breve')}>
            <Settings size={14} /> Configurações
          </Button>
          <Button size="sm" onClick={() => openDealModal(allStages[0]?.id ?? '')}>
            <Plus size={14} /> Novo negócio
          </Button>
        </div>
      </div>

      {loadingKanban ? (
        <div className="flex justify-center py-16"><Spinner /></div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
            {localStages.map((stage) => (
              <KanbanColumn
                key={stage.id}
                stage={stage}
                onAddDeal={openDealModal}
                onWon={(id) => markWon.mutate(id)}
                onLost={(id) => markLost.mutate({ id })}
                onDealClick={(deal) => navigate(`/deals/${deal.id}`)}
              />
            ))}

            {localStages.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-text-muted text-sm">
                Nenhuma etapa ainda. Acesse as Configurações para adicionar etapas.
              </div>
            )}
          </div>

          <DragOverlay>
            {activeDeal && (
              <KanbanCard
                deal={activeDeal}
                onWon={() => {}}
                onLost={() => {}}
                onClick={() => {}}
              />
            )}
          </DragOverlay>
        </DndContext>
      )}

      <Modal open={dealModalOpen} onClose={() => setDealModalOpen(false)} title="Novo negócio">
        <DealForm
          stages={allStages}
          defaultStageId={defaultStageId}
          onSubmit={handleCreateDeal}
          onCancel={() => setDealModalOpen(false)}
          isSubmitting={createDeal.isPending}
        />
      </Modal>
    </div>
  );
}
