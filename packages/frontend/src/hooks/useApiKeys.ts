import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiKeysService, type CreateApiKeyInput } from '@/services/api-keys.service';
import { toast } from 'sonner';

const QK = ['api-keys'];

export function useApiKeys() {
  return useQuery({ queryKey: QK, queryFn: apiKeysService.list });
}

export function useCreateApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApiKeyInput) => apiKeysService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK }),
  });
}

export function useRevokeApiKey() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiKeysService.revoke(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: QK }); toast.success('Chave revogada'); },
    onError: () => toast.error('Erro ao revogar chave'),
  });
}
