import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[260px] gap-4 text-center p-6">
      <div className="p-4 rounded-full bg-bg-surface border border-bg-border">
        <Icon size={28} className="text-text-muted" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-text-primary mb-1">{title}</h3>
        <p className="text-sm text-text-muted max-w-xs">{description}</p>
      </div>
      {action && (
        <Button size="sm" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
