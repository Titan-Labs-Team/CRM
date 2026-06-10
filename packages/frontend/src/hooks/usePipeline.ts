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
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Pipeline criado'); },
    onError: () => toast.error('Erro ao criar pipeline'),
  });
}

export function useCreateStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ pipelineId, input }: { pipelineId: string; input: { name: string; color?: string } }) =>
      pipelineService.createStage(pipelineId, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Etapa adicionada'); },
    onError: () => toast.error('Erro ao adicionar etapa'),
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Etapa removida'); },
    onError: (e: unknown) => toast.error((e as { response?: { data?: { error?: string } } }).response?.data?.error ?? 'Erro ao remover etapa'),
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Negócio criado'); },
    onError: () => toast.error('Erro ao criar negócio'),
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
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); },
  });
}

export function useMarkLost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => dealsService.markLost(id, reason),
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); },
  });
}

export function useMarkOpen() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dealsService.markOpen(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Negócio reaberto'); },
    onError: () => toast.error('Erro ao reabrir negócio'),
  });
}

export function useDeleteDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dealsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pipelineKeys.all });
      qc.invalidateQueries({ queryKey: ['deals'] });
      toast.success('Negócio excluído');
    },
    onError: () => toast.error('Erro ao excluir negócio'),
  });
}

export function useUpdateDeal() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<{ title: string; value: number; expectedClose: string }> }) =>
      dealsService.update(id, input),
    onSuccess: () => { qc.invalidateQueries({ queryKey: pipelineKeys.all }); toast.success('Negócio atualizado'); },
    onError: () => toast.error('Erro ao atualizar negócio'),
  });
}
