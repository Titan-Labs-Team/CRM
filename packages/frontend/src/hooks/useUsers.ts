import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersService, type InviteUserInput, type UpdateUserInput } from '@/services/users.service';

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
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.list }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      usersService.update(id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: userKeys.list }),
  });
}
