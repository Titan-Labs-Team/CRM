import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { KeyRound } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { toast } from 'sonner';

const schema = z.object({
  password: z.string().min(8, 'Mínimo 8 caracteres'),
  confirm: z.string().min(1, 'Confirme a senha'),
}).refine((d) => d.password === d.confirm, {
  message: 'As senhas não coincidem',
  path: ['confirm'],
});

type FormData = z.infer<typeof schema>;

export function ChangePasswordModal() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const open = user?.must_change_password === true;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }: FormData) => {
    try {
      const updated = await authService.updateMe({ password });
      setAuth({ ...user!, ...updated }, accessToken!, refreshToken!);
      toast.success('Senha atualizada com sucesso');
    } catch {
      toast.error('Erro ao atualizar senha');
    }
  };

  if (!open) return null;

  return (
    <Modal open title="Defina sua senha" onClose={() => {}}>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-accent-green/10 border border-accent-green/20 rounded-lg">
          <KeyRound size={16} className="text-accent-green mt-0.5 flex-shrink-0" />
          <p className="text-sm text-text-secondary">
            Por segurança, defina uma senha pessoal antes de continuar. A senha temporária não poderá ser usada após esta alteração.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <Input
            {...register('password')}
            id="new-password"
            type="password"
            label="Nova senha *"
            placeholder="Mínimo 8 caracteres"
            error={errors.password?.message}
            autoFocus
          />
          <Input
            {...register('confirm')}
            id="confirm-password"
            type="password"
            label="Confirmar senha *"
            placeholder="Repita a nova senha"
            error={errors.confirm?.message}
          />
          <div className="pt-1">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando…' : 'Definir senha e continuar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
