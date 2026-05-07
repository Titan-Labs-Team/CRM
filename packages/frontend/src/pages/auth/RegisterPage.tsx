import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '@/services/auth.service';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useState } from 'react';

const schema = z.object({
  workspaceName: z.string().min(2, 'Nome do workspace é obrigatório'),
  slug: z
    .string()
    .min(2, 'URL é obrigatória')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Apenas letras minúsculas, números e hífens'),
  fullName: z.string().min(2, 'Nome completo é obrigatório'),
  email: z.string().email('Digite um e-mail válido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
});

type FormData = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const workspaceName = watch('workspaceName', '');

  const handleWorkspaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setValue('workspaceName', name);
    const slug = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    setValue('slug', slug);
  };

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const result = await authService.register(data);
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
        'Falha no cadastro';
      setServerError(msg);
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="h-8 w-8 rounded-md bg-accent-green" />
          <span className="text-xl font-bold text-text-primary">Titan Labs CRM</span>
        </div>

        <div className="card p-6 space-y-5">
          <div>
            <h1 className="text-lg font-semibold text-text-primary">Crie seu workspace</h1>
            <p className="text-sm text-text-secondary mt-1">Comece em minutos</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="workspaceName"
              label="Nome do workspace"
              placeholder="Minha Empresa"
              error={errors.workspaceName?.message}
              onChange={handleWorkspaceNameChange}
              value={workspaceName}
            />
            <Input
              {...register('slug')}
              id="slug"
              label="URL do workspace"
              placeholder="minha-empresa"
              error={errors.slug?.message}
              className="font-mono text-xs"
            />
            <Input
              {...register('fullName')}
              id="fullName"
              label="Seu nome"
              placeholder="João Silva"
              error={errors.fullName?.message}
            />
            <Input
              {...register('email')}
              id="email"
              type="email"
              label="E-mail"
              placeholder="joao@empresa.com"
              error={errors.email?.message}
              autoComplete="email"
            />
            <Input
              {...register('password')}
              id="password"
              type="password"
              label="Senha"
              placeholder="Mín. 8 caracteres"
              error={errors.password?.message}
              autoComplete="new-password"
            />

            {serverError && (
              <p className="text-sm text-status-lost bg-status-lost/10 px-3 py-2 rounded">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Criando workspace…' : 'Criar workspace'}
            </Button>
          </form>

          <p className="text-sm text-text-secondary text-center">
            Já tem um workspace?{' '}
            <Link to="/login" className="text-accent-green hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
