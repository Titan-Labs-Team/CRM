import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, useRef, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useContacts } from '@/hooks/useContacts';
import { useUsers } from '@/hooks/useUsers';
import type { Stage } from '@/services/pipeline.service';

const schema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  stageId: z.string().uuid('Selecione uma etapa'),
  value: z.coerce.number().min(0).optional(),
  expectedClose: z.string().optional(),
  contactId: z.string().optional(),
  ownerId: z.string().optional(),
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
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { stageId: defaultStageId ?? stages[0]?.id, value: 0 },
  });

  const [contactSearch, setContactSearch] = useState('');
  const [contactDropdownOpen, setContactDropdownOpen] = useState(false);
  const [selectedContactName, setSelectedContactName] = useState('');
  const contactDropdownRef = useRef<HTMLDivElement>(null);

  const { data: contactsData } = useContacts({ search: contactSearch || undefined, limit: 20 });
  const { data: usersData } = useUsers();

  const contacts = contactsData?.data ?? [];
  const users = usersData?.data ?? [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (contactDropdownRef.current && !contactDropdownRef.current.contains(e.target as Node)) {
        setContactDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelectContact = (id: string, name: string) => {
    setValue('contactId', id);
    setSelectedContactName(name);
    setContactSearch('');
    setContactDropdownOpen(false);
  };

  const handleClearContact = () => {
    setValue('contactId', undefined);
    setSelectedContactName('');
    setContactSearch('');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        {...register('title')}
        id="title"
        label="Título do negócio *"
        placeholder="Ex: Acme Corp — Plano Enterprise"
        error={errors.title?.message}
      />

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Etapa *</label>
        <select {...register('stageId')} className="input-base">
          {stages.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
        {errors.stageId && <p className="text-xs text-status-lost">{errors.stageId.message}</p>}
      </div>

      {/* Contact / Lead selector */}
      <div className="flex flex-col gap-1" ref={contactDropdownRef}>
        <label className="text-xs font-medium text-text-secondary">Lead / Contato</label>
        {selectedContactName ? (
          <div className="flex items-center gap-2 px-3 py-2 bg-bg-surface border border-bg-border rounded text-sm text-text-primary">
            <span className="flex-1 truncate">{selectedContactName}</span>
            <button type="button" onClick={handleClearContact} className="text-text-muted hover:text-text-primary">
              <X size={14} />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              className="input-base pl-8"
              placeholder="Buscar lead ou contato..."
              value={contactSearch}
              onChange={(e) => {
                setContactSearch(e.target.value);
                setContactDropdownOpen(true);
              }}
              onFocus={() => setContactDropdownOpen(true)}
            />
            {contactDropdownOpen && (
              <div className="absolute z-50 top-full mt-1 w-full bg-bg-surface border border-bg-border rounded shadow-lg max-h-48 overflow-y-auto">
                {contacts.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-text-muted">Nenhum contato encontrado</p>
                ) : (
                  contacts.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-bg-border flex items-center gap-2"
                      onMouseDown={() => handleSelectContact(c.id, c.full_name)}
                    >
                      <span className="flex-1 truncate">{c.full_name}</span>
                      {c.company_name && (
                        <span className="text-xs text-text-muted truncate">{c.company_name}</span>
                      )}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                        c.type === 'lead' ? 'bg-status-open/20 text-status-open'
                        : c.type === 'client' ? 'bg-accent-green/20 text-accent-green'
                        : 'bg-bg-border text-text-muted'
                      }`}>
                        {{ lead: 'Lead', contact: 'Contato', client: 'Cliente' }[c.type]}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Owner selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-text-secondary">Responsável</label>
        <select {...register('ownerId')} className="input-base">
          <option value="">Sem responsável</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.full_name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input
          {...register('value')}
          id="value"
          type="number"
          label="Valor (R$)"
          placeholder="0"
          min={0}
        />
        <Input
          {...register('expectedClose')}
          id="expectedClose"
          type="date"
          label="Previsão de fechamento"
        />
      </div>

      <div className="flex gap-2 pt-2 justify-end">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Salvando...' : 'Criar negócio'}
        </Button>
      </div>
    </form>
  );
}
