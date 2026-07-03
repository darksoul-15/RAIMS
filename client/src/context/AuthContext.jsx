import { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount, restore the session if an access token is present
  useEffect(() => {
    const bootstrap = async () => {
      if (!authService.isAuthenticated()) {
        setLoading(false);
        return;
      }
      try {
        const current = await authService.getMe();
        setUser(current);
      } catch {
        authService.logout();
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = useCallback(async (credentials) => {
    const loggedIn = await authService.login(credentials);
    setUser(loggedIn);
    return loggedIn;
  }, []);

  const register = useCallback(async (payload) => {
    const created = await authService.register(payload);
    setUser(created);
    return created;
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    hasRole: (...roles) => !!user && roles.includes(user.role),
    login,
    register,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
