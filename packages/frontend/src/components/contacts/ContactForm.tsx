import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import type { Contact } from '@/services/contacts.service';

const schema = z.object({
  type: z.enum(['lead', 'contact', 'client']).default('lead'),
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
  source: z.string().optional(),
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
  { value: 'contact', label: 'Contact' },
  { value: 'client', label: 'Client' },
];

const sourceOptions = [
  { value: '', label: 'None' },
  { value: 'organic', label: 'Organic' },
  { value: 'ads', label: 'Ads' },
  { value: 'referral', label: 'Referral' },
  { value: 'social', label: 'Social media' },
  { value: 'event', label: 'Event' },
  { value: 'api', label: 'API' },
];

export function ContactForm({ defaultValues, onSubmit, onCancel, isSubmitting }: ContactFormProps) {
  const {
    register,
    handleSubmit,
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
      source: defaultValues?.source ?? '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Type</label>
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
        label="Full name *"
        placeholder="Jane Smith"
        error={errors.fullName?.message}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          {...register('email')}
          id="email"
          type="email"
          label="Email"
          placeholder="jane@company.com"
          error={errors.email?.message}
        />
        <Input
          {...register('phone')}
          id="phone"
          label="Phone"
          placeholder="+55 11 9xxxx-xxxx"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          {...register('companyName')}
          id="companyName"
          label="Company"
          placeholder="Acme Corp"
        />
        <Input
          {...register('jobTitle')}
          id="jobTitle"
          label="Job title"
          placeholder="CEO"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Source</label>
        <select {...register('source')} className="input-base">
          {sourceOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 pt-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}
