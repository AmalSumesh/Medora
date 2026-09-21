import React, { useState, useCallback, useMemo } from 'react';
import type { User, RegisterResponse } from '../services/api';
import {
  loginUser,
  registerUser,
  getStoredToken,
  getStoredUser,
  setStoredAuth,
  clearStoredAuth,
} from '../services/api';
import { AuthContext, type AuthContextType } from './auth-context';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      return getStoredUser();
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    try {
      return getStoredToken();
    } catch {
      return null;
    }
  });

  const [isLoading] = useState<boolean>(false);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    const response = await loginUser(email, password);
    if (!response.token || !response.user) {
      throw new Error('Authentication succeeded but response was malformed.');
    }

    setToken(response.token);
    setUser(response.user);
    setStoredAuth(response.token, response.user);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string): Promise<RegisterResponse> => {
      const response = await registerUser(name, email, password);
      return response;
    },
    []
  );

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    clearStoredAuth();
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
