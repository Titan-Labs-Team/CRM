import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';

interface Tenant {
  id: string;
  name: string;
  plan: string;
  created_at: string;
}

const tenantKeys = {
  current: ['tenant'] as const,
};

export function useTenant() {
  return useQuery({
    queryKey: tenantKeys.current,
    queryFn: () => api.get('/tenant').then((r) => r.data.data as Tenant),
    staleTime: 30 * 1000,
  });
}
