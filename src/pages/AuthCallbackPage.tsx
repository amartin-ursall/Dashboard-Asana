import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Loader2 } from 'lucide-react';
export function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const checkAuthStatus = useAuthStore(s => s.checkAuthStatus);
  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    if (error) {
      console.error('OAuth Error:', error);
      navigate('/login?error=oauth_failed');
      return;
    }
    if (code) {
      fetch(`/api/auth/callback?code=${code}`)
        .then(res => {
          if (!res.ok) throw new Error('Token exchange failed');
          return res.json();
        })
        .then(data => {
          if (data.success) {
            checkAuthStatus().then(() => {
              navigate('/');
            });
          } else {
            throw new Error(data.error || 'Authentication failed');
          }
        })
        .catch(err => {
          console.error('Callback Error:', err);
          navigate('/login?error=callback_failed');
        });
    } else {
      navigate('/login?error=no_code');
    }
  }, [searchParams, navigate, checkAuthStatus]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Autenticando con Asana...</p>
      </div>
    </div>
  );
}