import { useState } from 'react';
import { Phone, Mail, MessageSquare, Users, CheckSquare, Plus, Check } from 'lucide-react';
import { useActivities, useCreateActivity, useMarkActivityDone } from '@/hooks/useActivities';
import { ActivityForm } from './ActivityForm';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import type { Activity } from '@/services/activities.service';

const typeIcon: Record<Activity['type'], React.ReactNode> = {
  note: <MessageSquare size={13} />,
  call: <Phone size={13} />,
  email: <Mail size={13} />,
  meeting: <Users size={13} />,
  task: <CheckSquare size={13} />,
};

const typeLabel: Record<Activity['type'], string> = {
  note: 'Nota',
  call: 'Ligação',
  email: 'E-mail',
  meeting: 'Reunião',
  task: 'Tarefa',
};

interface ActivityTimelineProps {
  dealId?: string;
  contactId?: string;
}

export function ActivityTimeline({ dealId, contactId }: ActivityTimelineProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { data, isLoading } = useActivities({ dealId, contactId, limit: 30 });
  const createActivity = useCreateActivity();
  const markDone = useMarkActivityDone();

  const activities = data?.data ?? [];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">Atividades</p>
        <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
          <Plus size={13} /> Registrar
        </Button>
      </div>

      {isLoading ? (
        <div className="py-4 flex justify-center"><Spinner /></div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-text-muted py-3">Nenhuma atividade registrada.</p>
      ) : (
        <div className="space-y-2">
          {activities.map((a) => (
            <div
              key={a.id}
              className={`flex items-start gap-3 p-3 rounded-lg transition-opacity ${
                a.is_done ? 'opacity-50' : 'bg-bg-surface/40'
              }`}
            >
              <div
                className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                  a.is_done
                    ? 'bg-accent-green/10 text-accent-green'
                    : 'bg-bg-surface text-text-muted'
                }`}
              >
                {typeIcon[a.type]}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm ${
                    a.is_done ? 'line-through text-text-muted' : 'text-text-primary'
                  }`}
                >
                  {a.title}
                </p>
                {a.body && (
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">{a.body}</p>
                )}
                <p className="text-xs text-text-muted mt-1">
                  {typeLabel[a.type]} · {a.user_name} ·{' '}
                  {new Date(a.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
              {!a.is_done && (
                <button
                  onClick={() => markDone.mutate(a.id)}
                  className="text-text-muted hover:text-accent-green transition-colors flex-shrink-0"
                  title="Marcar como concluída"
                >
                  <Check size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Registrar atividade">
        <ActivityForm
          dealId={dealId}
          contactId={contactId}
          onSubmit={async (input) => {
            await createActivity.mutateAsync(input);
            setModalOpen(false);
          }}
          onCancel={() => setModalOpen(false)}
          isSubmitting={createActivity.isPending}
        />
      </Modal>
    </div>
  );
}
