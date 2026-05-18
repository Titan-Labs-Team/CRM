import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/auth.service';
import { Spinner } from '@/components/ui/Spinner';

export function AuthCallbackPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');
    const isNew = params.get('isNew') === 'true';

    if (!accessToken || !refreshToken) {
      navigate('/login?error=google_failed');
      return;
    }

    // Temporarily set tokens so getMe works via the Axios interceptor
    useAuthStore.setState({ accessToken, refreshToken, isAuthenticated: false, user: null });

    authService.getMe().then((user) => {
      setAuth(user, accessToken, refreshToken);
      navigate(isNew ? '/onboarding' : '/dashboard');
    }).catch(() => {
      navigate('/login?error=google_failed');
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-sm text-text-secondary">Entrando com Google…</p>
      </div>
    </div>
  );
}
