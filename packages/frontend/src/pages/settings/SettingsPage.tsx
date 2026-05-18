import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Shield, ShieldCheck, Briefcase, ToggleLeft, ToggleRight, Zap, ExternalLink, CreditCard } from 'lucide-react';
import { ApiKeysSection } from '@/components/integrations/ApiKeysSection';
import { WebhooksSection } from '@/components/integrations/WebhooksSection';
import { useUsers, useInviteUser, useUpdateUser } from '@/hooks/useUsers';
import { useBilling, useCreateCheckoutSession, useCreatePortalSession } from '@/hooks/useBilling';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'sonner';
import type { TeamMember } from '@/services/users.service';

const PLAN_LABEL: Record<string, string> = {
  free: 'FREE',
  starter: 'STARTER',
  pro: 'PRO',
  enterprise: 'ENTERPRISE',
};

const PLAN_COLOR: Record<string, string> = {
  free: 'text-text-muted bg-bg-border',
  starter: 'text-status-open bg-status-open/20',
  pro: 'text-accent-green bg-accent-green/20',
  enterprise: 'text-purple-400 bg-purple-500/20',
};

function BillingSection({ isAdmin }: { isAdmin: boolean }) {
  const { data, isLoading } = useBilling();
  const checkout = useCreateCheckoutSession();
  const portal = useCreatePortalSession();

  if (isLoading) {
    return (
      <div className="card px-5 py-6 flex justify-center">
        <Spinner />
      </div>
    );
  }

  const plan = data?.plan ?? 'free';
  const hasPaidPlan = plan !== 'free';
  const periodEnd = data?.subscription?.current_period_end;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-bg-border flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text-primary">Plano & Faturamento</p>
          <p className="text-xs text-text-muted mt-0.5">Gerencie sua assinatura</p>
        </div>
        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${PLAN_COLOR[plan] ?? PLAN_COLOR.free}`}>
          {PLAN_LABEL[plan] ?? plan.toUpperCase()}
        </span>
      </div>

      <div className="px-5 py-5 space-y-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Usuários incluídos</span>
          <span className="font-medium text-text-primary">{data?.maxUsers ?? 3}</span>
        </div>

        {periodEnd && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Próxima renovação</span>
            <span className="font-medium text-text-primary">
              {new Date(periodEnd).toLocaleDateString('pt-BR')}
            </span>
          </div>
        )}

        {isAdmin && (
          <div className="flex flex-wrap gap-2 pt-1">
            {hasPaidPlan ? (
              <Button
                size="sm"
                variant="ghost"
                disabled={portal.isPending}
                onClick={() => portal.mutate()}
                className="flex items-center gap-1.5"
              >
                <ExternalLink size={13} />
                {portal.isPending ? 'Redirecionando…' : 'Gerenciar assinatura'}
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={checkout.isPending}
                  onClick={() => checkout.mutate('starter')}
                  className="flex items-center gap-1.5"
                >
                  <CreditCard size={13} />
                  Starter
                </Button>
                <Button
                  size="sm"
                  disabled={checkout.isPending}
                  onClick={() => checkout.mutate('pro')}
                  className="flex items-center gap-1.5"
                >
                  <Zap size={13} />
                  {checkout.isPending ? 'Redirecionando…' : 'Upgrade para Pro'}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const roleLabel: Record<string, string> = {
  admin: 'Admin',
  manager: 'Gerente',
  seller: 'Vendedor',
};

const roleBadgeVariant: Record<string, 'green' | 'blue' | 'default'> = {
  admin: 'green',
  manager: 'blue',
  seller: 'default',
};

const RoleIcon = ({ role }: { role: string }) => {
  if (role === 'admin') return <Shield size={12} />;
  if (role === 'manager') return <ShieldCheck size={12} />;
  return <Briefcase size={12} />;
};

const inviteSchema = z.object({
  fullName: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('E-mail inválido'),
  role: z.enum(['admin', 'manager', 'seller']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

export function SettingsPage() {
  const currentUser = useAuthStore((s) => s.user);
  const isAdmin = currentUser?.role === 'admin';

  const { data, isLoading } = useUsers();
  const inviteUser = useInviteUser();
  const updateUser = useUpdateUser();

  const [inviteOpen, setInviteOpen] = useState(false);

  const members: TeamMember[] = data?.data ?? [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: 'seller' },
  });

  const handleInvite = async (formData: InviteFormData) => {
    try {
      const result = await inviteUser.mutateAsync(formData);
      if (result?.tempPassword) {
        toast.success(
          `Usuário criado! Senha temporária: ${result.tempPassword}`,
          { duration: 15000 },
        );
      } else {
        toast.success('Convite enviado por e-mail com sucesso');
      }
      reset();
      setInviteOpen(false);
    } catch {
      toast.error('Erro ao convidar usuário');
    }
  };

  const handleRoleChange = async (member: TeamMember, role: 'admin' | 'manager' | 'seller') => {
    try {
      await updateUser.mutateAsync({ id: member.id, input: { role } });
      toast.success('Papel atualizado');
    } catch {
      toast.error('Erro ao atualizar papel');
    }
  };

  const handleToggleActive = async (member: TeamMember) => {
    const next = !member.is_active;
    try {
      await updateUser.mutateAsync({ id: member.id, input: { isActive: next } });
      toast.success(next ? 'Usuário reativado' : 'Usuário desativado');
    } catch {
      toast.error('Erro ao atualizar usuário');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text-primary">Configurações</h1>
          <p className="text-sm text-text-secondary mt-0.5">Gerencie sua equipe e workspace</p>
        </div>
        {isAdmin && (
          <Button size="sm" onClick={() => setInviteOpen(true)}>
            <UserPlus size={14} />
            Convidar membro
          </Button>
        )}
      </div>

      {/* Billing section */}
      <BillingSection isAdmin={isAdmin} />

      {/* Team section */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-bg-border">
          <p className="text-sm font-medium text-text-primary">Equipe</p>
          <p className="text-xs text-text-muted mt-0.5">{members.length} membro{members.length !== 1 ? 's' : ''}</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 gap-2">
            <p className="text-text-muted text-sm">Nenhum membro encontrado</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-border text-text-muted text-xs uppercase tracking-wide">
                <th className="text-left px-5 py-3 font-medium">Membro</th>
                <th className="text-left px-5 py-3 font-medium hidden md:table-cell">Papel</th>
                <th className="text-left px-5 py-3 font-medium hidden lg:table-cell">Último acesso</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                {isAdmin && <th className="px-5 py-3 w-10" />}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id} className="border-b border-bg-border last:border-0 hover:bg-bg-surface/50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.full_name} size="sm" />
                      <div>
                        <p className="font-medium text-text-primary flex items-center gap-1.5">
                          {m.full_name}
                          {m.id === currentUser?.id && (
                            <span className="text-xs text-text-muted">(você)</span>
                          )}
                        </p>
                        <p className="text-xs text-text-muted">{m.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3 hidden md:table-cell">
                    {isAdmin && m.id !== currentUser?.id ? (
                      <select
                        value={m.role}
                        onChange={(e) => handleRoleChange(m, e.target.value as 'admin' | 'manager' | 'seller')}
                        className="input-base py-1 text-xs w-32"
                      >
                        <option value="admin">Admin</option>
                        <option value="manager">Gerente</option>
                        <option value="seller">Vendedor</option>
                      </select>
                    ) : (
                      <Badge variant={roleBadgeVariant[m.role] ?? 'default'}>
                        <span className="flex items-center gap-1">
                          <RoleIcon role={m.role} />
                          {roleLabel[m.role] ?? m.role}
                        </span>
                      </Badge>
                    )}
                  </td>

                  <td className="px-5 py-3 text-text-muted text-xs hidden lg:table-cell">
                    {m.last_login_at
                      ? new Date(m.last_login_at).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'Nunca'}
                  </td>

                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                      m.is_active ? 'text-accent-green' : 'text-text-muted'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${m.is_active ? 'bg-accent-green' : 'bg-text-muted'}`} />
                      {m.is_active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>

                  {isAdmin && (
                    <td className="px-5 py-3">
                      {m.id !== currentUser?.id && (
                        <button
                          onClick={() => handleToggleActive(m)}
                          className="text-text-muted hover:text-text-primary transition-colors"
                          title={m.is_active ? 'Desativar usuário' : 'Reativar usuário'}
                        >
                          {m.is_active
                            ? <ToggleRight size={18} className="text-accent-green" />
                            : <ToggleLeft size={18} />
                          }
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Integrations sections — gated by starter tier */}
      <WebhooksSection isAdmin={isAdmin} />
      <ApiKeysSection isAdmin={isAdmin} />

      {/* Invite modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Convidar membro">
        <form onSubmit={handleSubmit(handleInvite)} className="space-y-4">
          <Input
            {...register('fullName')}
            id="fullName"
            label="Nome completo *"
            placeholder="Maria Silva"
            error={errors.fullName?.message}
          />
          <Input
            {...register('email')}
            id="email"
            type="email"
            label="E-mail *"
            placeholder="maria@empresa.com"
            error={errors.email?.message}
          />
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-text-secondary">Papel</label>
            <select {...register('role')} className="input-base">
              <option value="seller">Vendedor</option>
              <option value="manager">Gerente</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <p className="text-xs text-text-muted">
            O usuário receberá as credenciais de acesso por e-mail.
          </p>
          <div className="flex gap-2 pt-1 justify-end">
            <Button type="button" variant="ghost" onClick={() => setInviteOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={inviteUser.isPending}>
              {inviteUser.isPending ? 'Enviando…' : 'Enviar convite'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
