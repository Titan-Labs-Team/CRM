import { useQuery } from '@tanstack/react-query';
import { dealsService, type DealsListParams } from '@/services/pipeline.service';

export function useDeals(filters: DealsListParams = {}) {
  return useQuery({
    queryKey: ['deals', 'list', filters],
    queryFn: () => dealsService.list(filters),
  });
}
