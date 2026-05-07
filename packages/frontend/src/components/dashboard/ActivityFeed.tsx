import { Phone, Mail, MessageSquare, Users, CheckSquare, Clock } from 'lucide-react';
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

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities.length) {
    return (
      <p className="text-sm text-text-muted py-4 text-center">
        Nenhuma atividade recente
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((a) => (
        <div key={a.id} className="flex items-start gap-3">
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
            <p className={`text-sm truncate ${a.is_done ? 'line-through text-text-muted' : 'text-text-primary'}`}>
              {a.title}
            </p>
            <p className="text-xs text-text-muted">
              {typeLabel[a.type]} · {a.user_name}
              {a.deal_title && ` · ${a.deal_title}`}
            </p>
          </div>
          <div className="flex-shrink-0 flex items-center gap-1 text-xs text-text-muted">
            <Clock size={11} />
            {new Date(a.created_at).toLocaleDateString('pt-BR')}
          </div>
        </div>
      ))}
    </div>
  );
}
