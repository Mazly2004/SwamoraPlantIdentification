import { create } from 'zustand';
import type { AuthUser } from '@/lib/auth-client';

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  token: string | null;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
}

const loadUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem('authToken'),
  user: loadUser(),
  token: localStorage.getItem('authToken'),
  setAuth: (user, token) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    set({ isAuthenticated: true, user, token });
  },
  clearAuth: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    set({ isAuthenticated: false, user: null, token: null });
  },
}));
