import { create } from 'zustand';
import { api } from '@/lib/api';
export interface UserProfile {
  gid: string;
  email: string;
  name: string;
  photo?: string;
}
interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  isLoading: boolean;
  login: (user: UserProfile) => void;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}
export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: (user) => set({ isAuthenticated: true, user, isLoading: false }),
  logout: async () => {
    try {
      await api.post('/api/auth/logout', {});
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
  checkAuthStatus: async () => {
    try {
      set({ isLoading: true });
      const data = await api.get<{ user: UserProfile }>('/api/auth/status');
      if (data && data.user) {
        set({ isAuthenticated: true, user: data.user, isLoading: false });
      } else {
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },
}));