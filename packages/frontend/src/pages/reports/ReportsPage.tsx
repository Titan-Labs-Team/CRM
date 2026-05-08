import { useState } from 'react';
import { useKpis, useFunnel, useRevenue } from '@/hooks/useReports';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { FunnelChart } from '@/components/dashboard/FunnelChart';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { Spinner } from '@/components/ui/Spinner';

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    notation: 'compact',
  }).format(v);
}

const periodOptions = [
  { value: 'month' as const, label: 'Mensal' },
  { value: 'week' as const, label: 'Semanal' },
];

export function ReportsPage() {
  const [period, setPeriod] = useState<'month' | 'week'>('month');

  const { data: kpis, isLoading: kpisLoading } = useKpis();
  const { data: funnel, isLoading: funnelLoading } = useFunnel();
  const { data: revenue, isLoading: revenueLoading } = useRevenue(period);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Relatórios</h1>
          <p className="text-sm text-text-secondary mt-0.5">
            Visão geral de desempenho do seu time
          </p>
        </div>
      </div>

      {/* KPIs */}
      {kpisLoading ? (
        <div className="flex justify-center py-8"><Spinner /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <KpiCard label="Negócios em aberto" value={kpis?.openDeals ?? '—'} />
          <KpiCard
            label="Ganhos no mês"
            value={kpis ? kpis.wonMtd : '—'}
            sub={kpis && kpis.wonMtdValue > 0 ? formatCurrency(kpis.wonMtdValue) : undefined}
          />
          <KpiCard
            label="Valor ganho no mês"
            value={kpis ? formatCurrency(kpis.wonMtdValue) : '—'}
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

      {/* Revenue chart with period toggle */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-text-secondary">Receita ao longo do tempo</p>
          <div className="flex gap-1">
            {periodOptions.map((o) => (
              <button
                key={o.value}
                onClick={() => setPeriod(o.value)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  period === o.value
                    ? 'bg-accent-green text-bg-darker'
                    : 'bg-bg-surface text-text-secondary border border-bg-border hover:text-text-primary'
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>
        {revenueLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <RevenueChart data={revenue ?? []} />
        )}
      </div>

      {/* Funnel chart */}
      <div className="card p-5">
        <p className="text-sm font-medium text-text-secondary mb-4">Funil do pipeline</p>
        {funnelLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : (
          <FunnelChart data={funnel ?? []} />
        )}
      </div>

      {/* Funnel table */}
      {funnel && funnel.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-bg-border">
            <p className="text-sm font-medium text-text-primary">Detalhamento por etapa</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border text-text-muted text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Etapa</th>
                <th className="text-right px-5 py-3 font-medium">Negócios</th>
                <th className="text-right px-5 py-3 font-medium">Valor total</th>
                <th className="text-right px-5 py-3 font-medium">Ticket médio</th>
              </tr>
            </thead>
            <tbody>
              {funnel.map((stage) => (
                <tr key={stage.stage_id} className="border-b border-bg-border last:border-0 hover:bg-bg-surface/50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: stage.color || '#72d296' }}
                      />
                      <span className="text-text-primary">{stage.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-right text-text-secondary">{stage.deal_count}</td>
                  <td className="px-5 py-3 text-right text-text-secondary">
                    {formatCurrency(stage.total_value)}
                  </td>
                  <td className="px-5 py-3 text-right text-text-secondary">
                    {stage.deal_count > 0
                      ? formatCurrency(stage.total_value / stage.deal_count)
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
