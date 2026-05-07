import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Trophy, X, DollarSign, Calendar, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { dealsService } from '@/services/pipeline.service';
import { useMarkWon, useMarkLost } from '@/hooks/usePipeline';
import { ActivityTimeline } from '@/components/activities/ActivityTimeline';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';

const statusLabel: Record<string, string> = {
  open: 'Em aberto',
  won: 'Ganho',
  lost: 'Perdido',
};

const statusVariant: Record<string, 'green' | 'default' | 'red'> = {
  open: 'default',
  won: 'green',
  lost: 'red',
};

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value);
}

export function DealDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lostModalOpen, setLostModalOpen] = useState(false);
  const [lostReason, setLostReason] = useState('');

  const { data: deal, isLoading } = useQuery({
    queryKey: ['deals', id],
    queryFn: () => dealsService.get(id!),
    enabled: !!id,
  });

  const markWon = useMarkWon();
  const markLost = useMarkLost();

  if (isLoading) {
    return <div className="flex items-center justify-center py-24"><Spinner /></div>;
  }

  if (!deal) {
    return <div className="text-center py-24 text-text-muted">Negócio não encontrado.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/pipeline')}
          className="text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-semibold text-text-primary flex-1">{deal.title}</h1>
        <Badge variant={statusVariant[deal.status] ?? 'default'}>
          {statusLabel[deal.status] ?? deal.status}
        </Badge>
        {deal.status === 'open' && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => markWon.mutate(deal.id, { onSuccess: () => navigate('/pipeline') })}
            >
              <Trophy size={13} /> Ganho
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => setLostModalOpen(true)}
            >
              <X size={13} /> Perdido
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="card p-5 space-y-4">
          <p className="text-sm font-medium text-text-primary">Detalhes</p>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-text-secondary">
              <DollarSign size={14} className="text-text-muted flex-shrink-0" />
              <span className="font-medium text-accent-green">
                {formatCurrency(Number(deal.value), deal.currency)}
              </span>
            </div>

            {deal.contact_name && (
              <div className="flex items-center gap-2 text-text-secondary">
                <User size={14} className="text-text-muted flex-shrink-0" />
                <span>{deal.contact_name}</span>
              </div>
            )}

            {deal.expected_close && (
              <div className="flex items-center gap-2 text-text-secondary">
                <Calendar size={14} className="text-text-muted flex-shrink-0" />
                <span>Previsão: {new Date(deal.expected_close).toLocaleDateString('pt-BR')}</span>
              </div>
            )}

            {deal.owner_name && (
              <div className="flex items-center gap-2 text-text-secondary">
                <User size={14} className="text-text-muted flex-shrink-0" />
                <span>Responsável: {deal.owner_name}</span>
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-bg-border text-xs text-text-muted space-y-1">
            <p>Criado em: {new Date(deal.created_at).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>

        <div className="lg:col-span-2 card p-5">
          <ActivityTimeline dealId={deal.id} />
        </div>
      </div>

      <Modal open={lostModalOpen} onClose={() => setLostModalOpen(false)} title="Marcar como perdido">
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Motivo da perda (opcional)</label>
            <textarea
              className="input-base resize-none"
              rows={3}
              placeholder="Ex: Cliente escolheu concorrente..."
              value={lostReason}
              onChange={(e) => setLostReason(e.target.value)}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setLostModalOpen(false)}>Cancelar</Button>
            <Button
              variant="danger"
              onClick={() => {
                markLost.mutate(
                  { id: deal.id, reason: lostReason },
                  { onSuccess: () => { setLostModalOpen(false); navigate('/pipeline'); } },
                );
              }}
              disabled={markLost.isPending}
            >
              {markLost.isPending ? 'Salvando...' : 'Confirmar perda'}
            </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
}
