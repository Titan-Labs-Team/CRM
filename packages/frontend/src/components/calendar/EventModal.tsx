import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { CalendarEvent, CreateEventInput } from '@/services/calendar.service';

const schema = z.object({
  title: z.string().min(1, 'Título obrigatório'),
  description: z.string().optional(),
  startAt: z.string().min(1, 'Data de início obrigatória'),
  allDay: z.boolean().optional(),
});

type FormData = z.infer<typeof schema>;

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface EventModalProps {
  event?: CalendarEvent | null;
  defaultStart?: string;
  onSubmit: (data: CreateEventInput) => Promise<void>;
  onDelete?: () => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function EventModal({
  event,
  defaultStart,
  onSubmit,
  onDelete,
  onCancel,
  isSubmitting,
}: EventModalProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: event?.title ?? '',
      description: event?.description ?? '',
      startAt: event?.start_at ? toLocalInput(event.start_at) : defaultStart ?? '',
      allDay: event?.all_day ?? false,
    },
  });

  const handleFormSubmit = (data: FormData) => {
    const start = new Date(data.startAt);
    const end = new Date(start.getTime() + 60 * 60 * 1000); // +1h padrão
    return onSubmit({
      title: data.title,
      description: data.description,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      allDay: data.allDay,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <Input
        {...register('title')}
        id="title"
        label="Título *"
        placeholder="Ex: Reunião com cliente"
        error={errors.title?.message}
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Descrição</label>
        <textarea
          {...register('description')}
          className="input-base resize-none"
          rows={2}
          placeholder="Detalhes do evento..."
        />
      </div>

      <Input
        {...register('startAt')}
        id="startAt"
        type="datetime-local"
        label="Data e hora *"
        error={errors.startAt?.message}
      />

      <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
        <input type="checkbox" {...register('allDay')} className="accent-accent-green" />
        Dia inteiro
      </label>

      <div className="flex gap-2 pt-2 justify-end">
        {onDelete && (
          <Button
            type="button"
            variant="danger"
            onClick={onDelete}
            disabled={isSubmitting}
            className="mr-auto"
          >
            Excluir
          </Button>
        )}
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : event ? 'Salvar alterações' : 'Criar evento'}
        </Button>
      </div>
    </form>
  );
}
