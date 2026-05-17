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
import { arrayMove, SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { GripVertical, Plus, Settings } from 'lucide-react';
import { useKanban, usePipelines, useCreateDeal, useMoveDeal, useMarkWon, useMarkLost, useCreatePipeline, useReorderStages } from '@/hooks/usePipeline';
import { useQueryClient } from '@tanstack/react-query';
import { pipelineKeys } from '@/hooks/usePipeline';
import { KanbanColumn } from '@/components/kanban/KanbanColumn';
import { KanbanCard } from '@/components/kanban/KanbanCard';
import { DealForm } from '@/components/kanban/DealForm';
import { PipelineSettingsModal } from '@/components/pipeline/PipelineSettingsModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import type { StageWithDeals, Deal } from '@/services/pipeline.service';
import { dealsService, pipelineService } from '@/services/pipeline.service';

export function PipelinePage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: pipelines, isLoading: loadingPipelines } = usePipelines();
  const [activePipelineId, setActivePipelineId] = useState<string>('');
  const [dealModalOpen, setDealModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [defaultStageId, setDefaultStageId] = useState<string>('');
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [activeStage, setActiveStage] = useState<StageWithDeals | null>(null);
  const [localStages, setLocalStages] = useState<StageWithDeals[]>([]);

  const { data: kanban, isLoading: loadingKanban } = useKanban(activePipelineId);
  const createDeal = useCreateDeal();
  const moveDeal = useMoveDeal();
  const markWon = useMarkWon();
  const markLost = useMarkLost();
  const createPipeline = useCreatePipeline();
  const reorderStages = useReorderStages();

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
    if (active.data.current?.type === 'column') {
      const stage = localStages.find((s) => s.id === active.id);
      if (stage) setActiveStage(stage);
      return;
    }
    const deal = localStages.flatMap((s) => s.deals).find((d) => d.id === active.id);
    if (deal) setActiveDeal(deal);
  };

  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over || active.data.current?.type === 'column') return;
    const activeCardStage = localStages.find((s) => s.deals.some((d) => d.id === active.id));
    const overStage = localStages.find(
      (s) => s.id === over.id || s.deals.some((d) => d.id === over.id),
    );
    if (!activeCardStage || !overStage || activeCardStage.id === overStage.id) return;

    setLocalStages((prev) =>
      prev.map((s) => {
        if (s.id === activeCardStage.id) return { ...s, deals: s.deals.filter((d) => d.id !== active.id) };
        if (s.id === overStage.id) {
          const deal = activeCardStage.deals.find((d) => d.id === active.id)!;
          return { ...s, deals: [...s.deals, { ...deal, stage_id: s.id }] };
        }
        return s;
      }),
    );
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveDeal(null);
    setActiveStage(null);
    if (!over) return;

    if (active.data.current?.type === 'column') {
      if (active.id === over.id) return;
      const oldIdx = localStages.findIndex((s) => s.id === active.id);
      const newIdx = localStages.findIndex((s) => s.id === over.id);
      if (oldIdx === -1 || newIdx === -1 || oldIdx === newIdx) return;
      const reordered = arrayMove(localStages, oldIdx, newIdx);
      setLocalStages(reordered);
      await reorderStages.mutateAsync({ pipelineId: activePipelineId, stageIds: reordered.map((s) => s.id) });
      return;
    }

    const activeDealStage = localStages.find((s) => s.deals.some((d) => d.id === active.id));
    const overStage = localStages.find(
      (s) => s.id === over.id || s.deals.some((d) => d.id === over.id),
    );
    if (!activeDealStage || !overStage) return;

    if (activeDealStage.id === overStage.id) {
      const oldIdx = activeDealStage.deals.findIndex((d) => d.id === active.id);
      const newIdx = activeDealStage.deals.findIndex((d) => d.id === over.id);
      if (oldIdx === newIdx) return;

      const reordered = arrayMove(activeDealStage.deals, oldIdx, newIdx);
      setLocalStages((prev) =>
        prev.map((s) => (s.id === activeDealStage.id ? { ...s, deals: reordered } : s)),
      );
      await dealsService.reorder(activeDealStage.id, reordered.map((d) => d.id));
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

    const defaultStages = [
      { name: 'Qualificação', color: '#6366f1' },
      { name: 'Proposta',     color: '#f59e0b' },
      { name: 'Negociação',   color: '#3b82f6' },
      { name: 'Fechamento',   color: '#10b981' },
    ];
    for (const stage of defaultStages) {
      await pipelineService.createStage(pipeline.id, stage);
    }

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
          <Button variant="secondary" size="sm" onClick={() => setSettingsOpen(true)}>
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
            <SortableContext items={localStages.map((s) => s.id)} strategy={horizontalListSortingStrategy}>
              {localStages.map((stage) => (
                <KanbanColumn
                  key={stage.id}
                  stage={stage}
                  onAddDeal={openDealModal}
                  onWon={(id) => markWon.mutate(id)}
                  onLost={(id) => markLost.mutate({ id })}
                  onDealClick={(deal) => navigate(`/deals/${deal.id}`)}
                  isCardDragActive={activeDeal !== null}
                />
              ))}
            </SortableContext>

            {localStages.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center gap-3 text-text-muted text-sm">
                <p>Nenhuma etapa ainda.</p>
                <Button size="sm" variant="secondary" onClick={() => setSettingsOpen(true)}>
                  <Settings size={14} /> Adicionar etapas
                </Button>
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
            {activeStage && (
              <div className="flex flex-col w-72 flex-shrink-0 rotate-1 opacity-90">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <GripVertical size={14} className="text-text-muted" />
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: activeStage.color }} />
                  <span className="text-sm font-medium text-text-primary">{activeStage.name}</span>
                  <span className="text-xs text-text-muted bg-bg-surface px-1.5 py-0.5 rounded">
                    {activeStage.deals.length}
                  </span>
                </div>
                <div className="flex-1 min-h-24 rounded-lg bg-bg-surface/50 ring-1 ring-accent-green/40" />
              </div>
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

      {activePipelineId && (
        <PipelineSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          pipelineId={activePipelineId}
          pipelineName={pipelines?.find((p) => p.id === activePipelineId)?.name ?? 'Pipeline'}
          stages={localStages}
        />
      )}
    </div>
  );
}
