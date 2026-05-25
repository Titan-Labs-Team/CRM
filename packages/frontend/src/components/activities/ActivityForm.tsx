import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CreateActivityInput, Activity } from '@/services/activities.service';

const schema = z.object({
  type: z.enum(['note', 'call', 'email', 'meeting', 'task']),
  title: z.string().min(1, 'Título obrigatório'),
  body: z.string().optional(),
  dueAt: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ActivityFormProps {
  dealId?: string;
  contactId?: string;
  defaultValues?: Partial<Activity>;
  onSubmit: (data: CreateActivityInput) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const typeOptions = [
  { value: 'note', label: 'Nota' },
  { value: 'call', label: 'Ligação' },
  { value: 'email', label: 'E-mail' },
  { value: 'meeting', label: 'Reunião' },
  { value: 'task', label: 'Tarefa' },
] as const;

export function ActivityForm({ dealId, contactId, defaultValues, onSubmit, onCancel, isSubmitting }: ActivityFormProps) {
  const isEditing = !!defaultValues?.id;
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: defaultValues?.type ?? 'note',
      title: defaultValues?.title ?? '',
      body: defaultValues?.body ?? '',
      dueAt: defaultValues?.due_at ? defaultValues.due_at.slice(0, 16) : '',
    },
  });

  const handleFormSubmit = (data: FormData) => {
    return onSubmit({
      type: data.type,
      title: data.title,
      body: data.body,
      dueAt: data.dueAt || undefined,
      dealId,
      contactId,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Tipo *</label>
        <select {...register('type')} className="input-base">
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <Input
        {...register('title')}
        id="title"
        label="Título *"
        placeholder="Ex: Ligação de prospecção"
        error={errors.title?.message}
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Descrição</label>
        <textarea
          {...register('body')}
          className="input-base resize-none"
          rows={3}
          placeholder="Detalhes da atividade..."
        />
      </div>

      <Input
        {...register('dueAt')}
        id="dueAt"
        type="datetime-local"
        label="Prazo"
      />

      <div className="flex gap-2 pt-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : isEditing ? 'Salvar' : 'Registrar'}
        </Button>
      </div>
    </form>
  );
}
