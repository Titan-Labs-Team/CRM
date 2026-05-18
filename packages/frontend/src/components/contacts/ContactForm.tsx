import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useUsers } from '@/hooks/useUsers';
import type { Contact } from '@/services/contacts.service';

const schema = z.object({
  type: z.enum(['lead', 'contact', 'client']).default('lead'),
  fullName: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  source: z.string().optional(),
  customSource: z.string().optional(),
  ownerId: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface ContactFormProps {
  defaultValues?: Partial<Contact>;
  onSubmit: (data: FormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const typeOptions = [
  { value: 'lead', label: 'Lead' },
  { value: 'contact', label: 'Contato' },
  { value: 'client', label: 'Cliente' },
];

const sourceOptions = [
  { value: '', label: 'Nenhuma' },
  { value: 'paid_traffic', label: 'Tráfego pago' },
  { value: 'landing_page', label: 'Landing Page' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'custom', label: 'Personalizado' },
];

// Predefined source values — any other value stored is treated as custom
const PREDEFINED_SOURCES = ['', 'paid_traffic', 'landing_page', 'ecommerce'];

export function ContactForm({ defaultValues, onSubmit, onCancel, isSubmitting }: ContactFormProps) {
  const { data: usersData } = useUsers();
  const activeUsers = usersData?.data.filter((u) => u.is_active) ?? [];

  const existingSource = defaultValues?.source ?? '';
  const isExistingCustom = !!existingSource && !PREDEFINED_SOURCES.includes(existingSource);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: (defaultValues?.type as FormData['type']) ?? 'lead',
      fullName: defaultValues?.full_name ?? '',
      email: defaultValues?.email ?? '',
      phone: defaultValues?.phone ?? '',
      companyName: defaultValues?.company_name ?? '',
      jobTitle: defaultValues?.job_title ?? '',
      source: isExistingCustom ? 'custom' : existingSource,
      customSource: isExistingCustom ? existingSource : '',
      ownerId: defaultValues?.owner_id ?? '',
    },
  });

  const sourceValue = useWatch({ control, name: 'source' });

  const handleFormSubmit = handleSubmit((data) => {
    const resolvedSource = data.source === 'custom' ? (data.customSource || '') : data.source;
    return onSubmit({ ...data, source: resolvedSource, ownerId: data.ownerId || undefined });
  });

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Tipo</label>
        <select
          {...register('type')}
          className="input-base"
        >
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <Input
        {...register('fullName')}
        id="fullName"
        label="Nome completo *"
        placeholder="João Silva"
        error={errors.fullName?.message}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          {...register('email')}
          id="email"
          type="email"
          label="E-mail"
          placeholder="joao@empresa.com"
          error={errors.email?.message}
        />
        <Input
          {...register('phone')}
          id="phone"
          label="Telefone"
          placeholder="+55 11 9xxxx-xxxx"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          {...register('companyName')}
          id="companyName"
          label="Empresa"
          placeholder="Acme Corp"
        />
        <Input
          {...register('jobTitle')}
          id="jobTitle"
          label="Cargo"
          placeholder="CEO"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Origem</label>
        <select {...register('source')} className="input-base">
          {sourceOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        {sourceValue === 'custom' && (
          <input
            {...register('customSource')}
            className="input-base mt-2"
            placeholder="Digite a origem personalizada"
          />
        )}
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Responsável</label>
        <select {...register('ownerId')} className="input-base">
          <option value="">Sem responsável</option>
          {activeUsers.map((u) => (
            <option key={u.id} value={u.id}>{u.full_name}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando…' : 'Salvar'}
        </Button>
      </div>
    </form>
  );
}
