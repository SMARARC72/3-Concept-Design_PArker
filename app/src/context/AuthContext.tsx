import React, { createContext, useContext, useState, useCallback } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading] = useState(false);

  const login = useCallback(async (email: string, _password: string): Promise<{ error?: string }> => {
    // Simple mock login - accept any email
    if (email) {
      setUser({
        id: 'usr_' + Date.now(),
        email,
        firstName: email.split('@')[0],
        lastName: 'User'
      });
      setIsAuthenticated(true);
      return {};
    }
    return { error: 'Invalid credentials' };
  }, []);

  const signup = useCallback(async (
    email: string, 
    _password: string, 
    firstName: string, 
    lastName: string
  ): Promise<{ error?: string }> => {
    setUser({
      id: 'usr_' + Date.now(),
      email,
      firstName,
      lastName
    });
    setIsAuthenticated(true);
    return {};
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  const resetPassword = useCallback(async (_email: string): Promise<{ error?: string }> => {
    return {};
  }, []);

  const updatePassword = useCallback(async (_newPassword: string): Promise<{ error?: string }> => {
    return {};
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      isLoading, 
      login, 
      signup,
      logout,
      resetPassword,
      updatePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
