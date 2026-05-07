import { api } from './api';

export interface KpiData {
  openDeals: number;
  wonMtd: number;
  wonMtdValue: number;
  conversionRate: number;
  avgCycleDays: number;
}

export interface FunnelStage {
  stage_id: string;
  name: string;
  color: string;
  position: number;
  deal_count: number;
  total_value: number;
}

export interface RevenuePoint {
  period: string;
  totalValue: number;
  dealCount: number;
}

export const reportsService = {
  async getKpis(): Promise<KpiData> {
    const { data } = await api.get<{ data: KpiData }>('/reports/kpis');
    return data.data;
  },

  async getFunnel(pipelineId?: string): Promise<FunnelStage[]> {
    const { data } = await api.get<{ data: FunnelStage[] }>('/reports/funnel', {
      params: pipelineId ? { pipeline: pipelineId } : undefined,
    });
    return data.data;
  },

  async getRevenue(period: 'week' | 'month' = 'month'): Promise<RevenuePoint[]> {
    const { data } = await api.get<{ data: RevenuePoint[] }>('/reports/revenue', {
      params: { period },
    });
    return data.data;
  },
};
