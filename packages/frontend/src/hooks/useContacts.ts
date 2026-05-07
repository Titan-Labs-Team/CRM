import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactsService, type ContactsListParams, type CreateContactInput } from '@/services/contacts.service';
import { toast } from 'sonner';

export const contactsKeys = {
  all: ['contacts'] as const,
  list: (params?: ContactsListParams) => [...contactsKeys.all, 'list', params] as const,
  detail: (id: string) => [...contactsKeys.all, 'detail', id] as const,
};

export function useContacts(params?: ContactsListParams) {
  return useQuery({
    queryKey: contactsKeys.list(params),
    queryFn: () => contactsService.list(params),
  });
}

export function useContact(id: string) {
  return useQuery({
    queryKey: contactsKeys.detail(id),
    queryFn: () => contactsService.get(id),
    enabled: !!id,
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContactInput) => contactsService.create(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactsKeys.all });
      toast.success('Contact created');
    },
    onError: () => toast.error('Failed to create contact'),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateContactInput> }) =>
      contactsService.update(id, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactsKeys.all });
      toast.success('Contact updated');
    },
    onError: () => toast.error('Failed to update contact'),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contactsService.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: contactsKeys.all });
      toast.success('Contact deleted');
    },
    onError: () => toast.error('Failed to delete contact'),
  });
}
