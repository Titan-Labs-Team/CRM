import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { pipelineService, dealsService } from '@/services/pipeline.service';
import { toast } from 'sonner';

export const pipelineKeys = {
  all: ['pipelines'] as const,
  list: () => [...pipelineKeys.all, 'list'] as const,
  kanban: (id: string) => [...pipelineKeys.all, 'kanban', id] as const,
};

export function usePipelines() {
  return useQuery({
    queryKey: pipelineKeys.list(),
    queryFn: pipelineService.listPipelines,
  });
}

export function useKanban(pipelineId: string) {
  return useQuery({
    queryKey: pipelineKeys.kanban(pipelineId),
    queryFn: () => pipelineService.getKanban(pipelineId),
    enabled: !!pipelineId,
  });
}

export function useCreatePipeline() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { name: string }) => pipelineService.createPipeline(input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Pipeline created'); },
    onError: () => toast.error('Failed to create pipeline'),
  });
}

export function useCreateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, input }: { pipelineId: string; input: { name: string; color?: string } }) =>
      pipelineService.createStage(pipelineId, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Stage added'); },
    onError: () => toast.error('Failed to add stage'),
  });
}

export function useUpdateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, stageId, input }: { pipelineId: string; stageId: string; input: Partial<{ name: string; color: string; probability: number }> }) =>
      pipelineService.updateStage(pipelineId, stageId, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); },
  });
}

export function useDeleteStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, stageId }: { pipelineId: string; stageId: string }) =>
      pipelineService.deleteStage(pipelineId, stageId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Stage deleted'); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Failed to delete stage'),
  });
}

export function useReorderStages() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, stageIds }: { pipelineId: string; stageIds: string[] }) =>
      pipelineService.reorderStages(pipelineId, stageIds),
    onSuccess: (_d, vars) => { qc.invalidateQueries({ queryKey: pipelineKeys.kanban(vars.pipelineId) }); },
  });
}

export function useCreateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: dealsService.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Deal created'); },
    onError: () => toast.error('Failed to create deal'),
  });
}

export function useMoveDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stageId, position }: { id: string; stageId: string; position?: number }) =>
      dealsService.move(id, stageId, position),
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); },
  });
}

export function useMarkWon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dealsService.markWon(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Deal marked as Won!'); },
  });
}

export function useMarkLost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => dealsService.markLost(id, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Deal marked as Lost'); },
  });
}
