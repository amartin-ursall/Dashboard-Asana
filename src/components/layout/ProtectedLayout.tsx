import { useEffect, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { Sidebar } from './Sidebar';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
export function ProtectedLayout() {
  const navigate = useNavigate();
  const hasCheckedAuth = useRef(false);

  // FIX: Select state primitives individually to prevent infinite loops
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const isLoading = useAuthStore(state => state.isLoading);
  const checkAuthStatus = useAuthStore(state => state.checkAuthStatus);
  const sidebarCollapsed = useUIStore(state => state.sidebarCollapsed);

  useEffect(() => {
    if (!hasCheckedAuth.current) {
      hasCheckedAuth.current = true;
      checkAuthStatus();
    }
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
    <div className="min-h-screen w-full flex bg-muted/40">
      <Sidebar />
      <motion.main
        initial={false}
        animate={{
          marginLeft: sidebarCollapsed ? '80px' : '256px',
        }}
        transition={{
          duration: 0.3,
          ease: [0.4, 0, 0.2, 1],
        }}
        className="flex-1 w-full md:ml-64 min-h-screen"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}