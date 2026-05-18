import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, X, Circle, Briefcase } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { usePipelines } from '@/hooks/usePipeline';
import { Badge } from '@/components/ui/Badge';
import { TableSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import type { Deal } from '@/services/pipeline.service';

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'open', label: 'Em aberto' },
  { value: 'won', label: 'Ganhos' },
  { value: 'lost', label: 'Perdidos' },
];

const statusConfig: Record<string, { label: string; variant: 'green' | 'red' | 'default'; Icon: typeof Circle }> = {
  open:  { label: 'Em aberto', variant: 'default', Icon: Circle },
  won:   { label: 'Ganho',     variant: 'green',   Icon: Trophy },
  lost:  { label: 'Perdido',   variant: 'red',     Icon: X },
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: 'compact' }).format(v);
}

export function DealsListPage() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('');
  const [pipelineFilter, setPipelineFilter] = useState('');

  const { data, isLoading } = useDeals({
    status: (statusFilter as 'open' | 'won' | 'lost') || undefined,
    pipeline: pipelineFilter || undefined,
    limit: 50,
  });

  const { data: pipelines } = usePipelines();

  const deals: Deal[] = data?.data ?? [];
  const total: number = data?.meta?.total ?? 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Negócios</h1>
          <p className="text-sm text-text-secondary mt-0.5">{total} no total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-1">
          {STATUS_FILTERS.map((o) => (
            <button
              key={o.value}
              onClick={() => setStatusFilter(o.value)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                statusFilter === o.value
                  ? 'bg-accent-green text-bg-darker'
                  : 'bg-bg-surface text-text-secondary border border-bg-border hover:text-text-primary'
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {pipelines && pipelines.length > 1 && (
          <select
            value={pipelineFilter}
            onChange={(e) => setPipelineFilter(e.target.value)}
            className="input-base py-1.5 text-xs w-44"
          >
            <option value="">Todos os pipelines</option>
            {pipelines.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : deals.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Nenhum negócio encontrado"
            description="Crie negócios no seu pipeline para acompanhar oportunidades de venda."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border text-text-muted text-xs uppercase tracking-wide">
                <th className="text-left px-4 py-3 font-medium">Negócio</th>
                <th className="text-left px-4 py-3 font-medium hidden md:table-cell">Contato</th>
                <th className="text-right px-4 py-3 font-medium hidden sm:table-cell">Valor</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Responsável</th>
                <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">Previsão</th>
              </tr>
            </thead>
            <tbody>
              {deals.map((deal) => {
                const status = statusConfig[deal.status] ?? statusConfig.open;
                const StatusIcon = status.Icon;
                return (
                  <tr
                    key={deal.id}
                    className="border-b border-bg-border last:border-0 hover:bg-bg-surface/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/deals/${deal.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-text-primary">{deal.title}</p>
                    </td>
                    <td className="px-4 py-3 text-text-secondary hidden md:table-cell">
                      {deal.contact_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-right hidden sm:table-cell">
                      <span className="font-mono text-accent-green text-xs">
                        {formatCurrency(Number(deal.value))}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={status.variant}>
                        <span className="flex items-center gap-1">
                          <StatusIcon size={10} />
                          {status.label}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs hidden lg:table-cell">
                      {deal.owner_name ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-text-muted text-xs hidden lg:table-cell">
                      {deal.expected_close
                        ? new Date(deal.expected_close).toLocaleDateString('pt-BR')
                        : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
