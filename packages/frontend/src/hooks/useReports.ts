import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';

export type { ActivitiesReport, LeaderboardEntry } from '@/services/reports.service';

export const reportKeys = {
  kpis: ['reports', 'kpis'] as const,
  funnel: (pipelineId?: string) => ['reports', 'funnel', pipelineId] as const,
  revenue: (period: 'week' | 'month') => ['reports', 'revenue', period] as const,
  activities: (filters?: object) => ['reports', 'activities', filters] as const,
  leaderboard: (filters?: object) => ['reports', 'leaderboard', filters] as const,
};

export function useKpis() {
  return useQuery({
    queryKey: reportKeys.kpis,
    queryFn: () => reportsService.getKpis(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useFunnel(pipelineId?: string) {
  return useQuery({
    queryKey: reportKeys.funnel(pipelineId),
    queryFn: () => reportsService.getFunnel(pipelineId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useRevenue(period: 'week' | 'month' = 'month') {
  return useQuery({
    queryKey: reportKeys.revenue(period),
    queryFn: () => reportsService.getRevenue(period),
    staleTime: 5 * 60 * 1000,
  });
}

export function useActivitiesReport(filters?: { userId?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: reportKeys.activities(filters),
    queryFn: () => reportsService.getActivities(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLeaderboard(filters?: { pipelineId?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: reportKeys.leaderboard(filters),
    queryFn: () => reportsService.getLeaderboard(filters),
    staleTime: 5 * 60 * 1000,
  });
}
