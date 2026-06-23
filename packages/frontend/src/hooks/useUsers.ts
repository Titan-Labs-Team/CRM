import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, type InviteUserInput, type UpdateUserInput } from '@/services/users.service';
import { toast } from 'sonner';

const userKeys = {
  list: ['users'] as const,
};

export function useUsers() {
  return useQuery({
    queryKey: userKeys.list,
    queryFn: () => usersService.list(),
    staleTime: 60 * 1000,
  });
}

export function useInviteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteUserInput) => usersService.invite(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.list });
      toast.success('Convite enviado');
    },
    onError: () => toast.error('Erro ao enviar convite'),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      usersService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.list });
      toast.success('Usuário atualizado');
    },
    onError: () => toast.error('Erro ao atualizar usuário'),
  });
}

export function useResendInvite() {
  return useMutation({
    mutationFn: (id: string) => usersService.resendInvite(id),
    onError: () => toast.error('Erro ao reenviar convite'),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: userKeys.list });
      toast.success('Usuário removido');
    },
    onError: () => toast.error('Erro ao remover usuário'),
  });
}
