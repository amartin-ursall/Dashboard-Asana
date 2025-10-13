import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { Loader2 } from 'lucide-react';
export function ProtectedLayout() {
  const navigate = useNavigate();
  // FIX: Select state primitives individually to prevent infinite loops
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const checkAuthStatus = useAuthStore(state => state.checkAuthStatus);
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isLoading, isAuthenticated, navigate]);
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }
  if (!isAuthenticated) {
    return null;
  }
  return (
    <div className="min-h-screen w-full flex">
      <Sidebar />
      <div className="flex flex-col w-full md:pl-64">
        <Header />
        <main className="flex-1 bg-muted/40">
          <Outlet />
        </main>
      </div>
    </div>
  );
}