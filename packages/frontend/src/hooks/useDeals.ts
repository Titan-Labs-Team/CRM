import { useQuery } from '@tanstack/react-query';
import { dealsService } from '@/services/pipeline.service';

interface DealsFilters {
  status?: 'open' | 'won' | 'lost';
  pipeline?: string;
  page?: number;
  limit?: number;
  [key: string]: unknown;
}

export function useDeals(filters: DealsFilters = {}) {
  return useQuery({
    queryKey: ['deals', 'list', filters],
    queryFn: () => dealsService.list(filters),
  });
}
