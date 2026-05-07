import { useKpis, useFunnel, useRevenue } from '@/hooks/useReports';
import { useActivities } from '@/hooks/useActivities';
import { useAuthStore } from '@/store/authStore';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Spinner } from '@/components/ui/Spinner';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
  }).format(v);
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { data: kpis, isLoading: kpisLoading } = useKpis();
  const { data: funnel } = useFunnel();
  const { data: revenue } = useRevenue();
  const { data: activitiesData } = useActivities({ limit: 8 });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">
          Olá, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Aqui está o resumo do seu workspace hoje.
        </p>
      </div>

      {kpisLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard label="Negócios em aberto" value={kpis?.openDeals ?? '—'} />
          <KpiCard
            label="Ganhos no mês"
            value={kpis ? kpis.wonMtd : '—'}
            sub={kpis && kpis.wonMtdValue > 0 ? formatCurrency(kpis.wonMtdValue) : undefined}
          />
          <KpiCard
            label="Taxa de conversão"
            value={kpis ? `${kpis.conversionRate}%` : '—'}
          />
          <KpiCard
            label="Ciclo médio (dias)"
            value={kpis?.avgCycleDays ?? '—'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <p className="text-sm font-medium text-text-secondary mb-4">Receita ao longo do tempo</p>
          <RevenueChart data={revenue ?? []} />
        </div>
        <div className="card p-5">
          <p className="text-sm font-medium text-text-secondary mb-4">Funil do pipeline</p>
          <FunnelChart data={funnel ?? []} />
        </div>
      </div>

      <div className="card p-5">
        <p className="text-sm font-medium text-text-secondary mb-4">Atividades recentes</p>
        <ActivityFeed activities={activitiesData?.data ?? []} />
      </div>
    </div>
  );
}
