import { useState, useCallback } from 'react';
import { authApi } from '../api/client';

export interface User {
  id: string;
  email: string;
  username?: string | null;
  role: string;
}

/**
 * Hook to manage authentication state.
 * Reads/writes token and user from localStorage.
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (usernameOrEmail: string, password: string) => {
    const res = await authApi.login(usernameOrEmail, password);
    const { token, user: userData } = res.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(async (email: string, password: string, username?: string) => {
    await authApi.register(email, password, username);
    // Auto-login after register
    return login(username || email, password);
  }, [login]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  const isAdmin = user?.role === 'ADMIN';
  const isDemo = user?.role === 'DEMO';

  return { user, isAdmin, isDemo, login, register, logout };
}
