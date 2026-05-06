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
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError('');
    try {
      const result = await authService.login(data);
      setAuth(result.user, result.accessToken, result.refreshToken);
      navigate('/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ??
        'Login failed';
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
            <h1 className="text-lg font-semibold text-text-primary">Sign in</h1>
            <p className="text-sm text-text-secondary mt-1">Welcome back to your workspace</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              {...register('email')}
              id="email"
              type="email"
              label="Email"
              placeholder="you@company.com"
              error={errors.email?.message}
              autoComplete="email"
            />
            <Input
              {...register('password')}
              id="password"
              type="password"
              label="Password"
              placeholder="••••••••"
              error={errors.password?.message}
              autoComplete="current-password"
            />

            {serverError && (
              <p className="text-sm text-status-lost bg-status-lost/10 px-3 py-2 rounded">
                {serverError}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="text-sm text-text-secondary text-center">
            Don't have a workspace?{' '}
            <Link to="/register" className="text-accent-green hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
