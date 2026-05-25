import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { activitiesService, type CreateActivityInput, type ListActivitiesQuery } from '@/services/activities.service';
import { toast } from 'sonner';

export const activityKeys = {
  all: ['activities'] as const,
  list: (q?: ListActivitiesQuery) => [...activityKeys.all, 'list', q] as const,
};

export function useActivities(query?: ListActivitiesQuery) {
  return useQuery({
    queryKey: activityKeys.list(query),
    queryFn: () => activitiesService.list(query),
  });
}

export function useCreateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateActivityInput) => activitiesService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityKeys.all });
      toast.success('Atividade registrada');
    },
    onError: () => toast.error('Erro ao registrar atividade'),
  });
}

export function useMarkActivityDone() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesService.markDone(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityKeys.all });
      toast.success('Atividade concluída');
    },
    onError: () => toast.error('Erro ao concluir atividade'),
  });
}

export function useUpdateActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateActivityInput> }) =>
      activitiesService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityKeys.all });
      toast.success('Atividade atualizada');
    },
    onError: () => toast.error('Erro ao atualizar atividade'),
  });
}

export function useDeleteActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => activitiesService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: activityKeys.all });
      toast.success('Atividade removida');
    },
    onError: () => toast.error('Erro ao remover atividade'),
  });
}
