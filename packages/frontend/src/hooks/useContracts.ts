import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { contractsService } from '@/services/contracts.service';

export function useContracts(contactId: string) {
  return useQuery({
    queryKey: ['contracts', contactId],
    queryFn: () => contractsService.list(contactId),
  });
}

export function useUploadContract(contactId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => contractsService.upload(contactId, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contracts', contactId] });
      toast.success('Contrato enviado com sucesso');
    },
    onError: () => toast.error('Erro ao enviar contrato'),
  });
}

export function useDeleteContract(contactId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (contractId: string) => contractsService.delete(contactId, contractId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['contracts', contactId] });
      toast.success('Contrato removido');
    },
    onError: () => toast.error('Erro ao remover contrato'),
  });
}
