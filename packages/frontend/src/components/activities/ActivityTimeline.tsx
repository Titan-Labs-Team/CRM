import { useState } from 'react';
import { Phone, Mail, MessageSquare, Users, CheckSquare, Plus, Check, Pencil, Trash2 } from 'lucide-react';
import { useActivities, useCreateActivity, useUpdateActivity, useMarkActivityDone, useDeleteActivity } from '@/hooks/useActivities';
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
  const [createOpen, setCreateOpen] = useState(false);
  const [editActivity, setEditActivity] = useState<Activity | null>(null);

  const { data, isLoading } = useActivities({ dealId, contactId, limit: 30 });
  const createActivity = useCreateActivity();
  const updateActivity = useUpdateActivity();
  const markDone = useMarkActivityDone();
  const deleteActivity = useDeleteActivity();

  const activities = data?.data ?? [];

  function handleDelete(a: Activity) {
    if (!confirm(`Excluir "${a.title}"?`)) return;
    deleteActivity.mutate(a.id);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">Atividades</p>
        <Button size="sm" variant="secondary" onClick={() => setCreateOpen(true)}>
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
              className={`group flex items-start gap-3 p-3 rounded-lg transition-opacity ${
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
                <p className={`text-sm ${a.is_done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
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

              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                {!a.is_done && (
                  <button
                    onClick={() => markDone.mutate(a.id)}
                    className="p-1.5 rounded text-text-muted hover:text-accent-green hover:bg-accent-green/10 transition-colors"
                    title="Concluir"
                  >
                    <Check size={13} />
                  </button>
                )}
                <button
                  onClick={() => setEditActivity(a)}
                  className="p-1.5 rounded text-text-muted hover:text-text-primary hover:bg-bg-border transition-colors"
                  title="Editar"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={() => handleDelete(a)}
                  className="p-1.5 rounded text-text-muted hover:text-status-lost hover:bg-status-lost/10 transition-colors"
                  title="Excluir"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Registrar atividade">
        <ActivityForm
          dealId={dealId}
          contactId={contactId}
          onSubmit={async (input) => {
            await createActivity.mutateAsync(input);
            setCreateOpen(false);
          }}
          onCancel={() => setCreateOpen(false)}
          isSubmitting={createActivity.isPending}
        />
      </Modal>

      <Modal open={!!editActivity} onClose={() => setEditActivity(null)} title="Editar atividade">
        {editActivity && (
          <ActivityForm
            defaultValues={editActivity}
            onSubmit={async (input) => {
              await updateActivity.mutateAsync({ id: editActivity.id, input });
              setEditActivity(null);
            }}
            onCancel={() => setEditActivity(null)}
            isSubmitting={updateActivity.isPending}
          />
        )}
      </Modal>
    </div>
  );
}
