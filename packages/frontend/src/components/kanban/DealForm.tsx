import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Stage } from '@/services/pipeline.service';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  stageId: z.string().uuid('Select a stage'),
  value: z.coerce.number().min(0).optional(),
  expectedClose: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface DealFormProps {
  stages: Stage[];
  defaultStageId?: string;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function DealForm({ stages, defaultStageId, onSubmit, onCancel, isSubmitting }: DealFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { stageId: defaultStageId ?? stages[0]?.id, value: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('title')}
        id="title"
        label="Deal title *"
        placeholder="e.g. Acme Corp — Enterprise plan"
        error={errors.title?.message}
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Stage *</label>
        <select {...register('stageId')} className="input-base">
          {stages.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.stageId && <p className="text-xs text-status-lost">{errors.stageId.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          {...register('value')}
          id="value"
          type="number"
          label="Value (BRL)"
          placeholder="0"
          min={0}
        />
        <Input
          {...register('expectedClose')}
          id="expectedClose"
          type="date"
          label="Expected close"
        />
      </div>

      <div className="flex gap-2 pt-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Create deal'}
        </Button>
      </div>
    </form>
  );
}
