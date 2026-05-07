import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { calendarService, type CreateEventInput } from '@/services/calendar.service';
import { toast } from 'sonner';

export const calendarKeys = {
  all: ['calendar'] as const,
  events: (from?: string, to?: string) => [...calendarKeys.all, 'events', from, to] as const,
};

export function useCalendarEvents(from?: string, to?: string) {
  return useQuery({
    queryKey: calendarKeys.events(from, to),
    queryFn: () => calendarService.list(from, to),
  });
}

export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateEventInput) => calendarService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success('Evento criado');
    },
    onError: () => toast.error('Erro ao criar evento'),
  });
}

export function useUpdateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateEventInput> }) =>
      calendarService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success('Evento atualizado');
    },
    onError: () => toast.error('Erro ao atualizar evento'),
  });
}

export function useDeleteEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => calendarService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: calendarKeys.all });
      toast.success('Evento removido');
    },
    onError: () => toast.error('Erro ao remover evento'),
  });
}
