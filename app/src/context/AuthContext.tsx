import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '../services/supabaseApi';

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
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if Supabase is properly configured
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          console.warn('Supabase not configured - auth features disabled');
          setIsLoading(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session check error:', error);
          setIsLoading(false);
          return;
        }
        
        if (session?.user) {
          // Fetch user profile from customer_profiles
          const { data: profile, error: profileError } = await supabase
            .from('customer_profiles')
            .select('first_name, last_name')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile fetch error:', profileError);
          }

          setUser({
            id: session.user.id,
            email: session.user.email!,
            firstName: profile?.first_name || session.user.user_metadata?.first_name || '',
            lastName: profile?.last_name || session.user.user_metadata?.last_name || '',
          });
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.email);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const { data: profile } = await supabase
          .from('customer_profiles')
          .select('first_name, last_name')
          .eq('id', session.user.id)
          .single();

        setUser({
          id: session.user.id,
          email: session.user.email!,
          firstName: profile?.first_name || session.user.user_metadata?.first_name || '',
          lastName: profile?.last_name || session.user.user_metadata?.last_name || '',
        });
        setIsAuthenticated(true);
        setIsLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsAuthenticated(false);
        setIsLoading(false);
      } else if (event === 'USER_UPDATED' && session?.user) {
        // Handle user updates
        setUser(prev => prev ? {
          ...prev,
          email: session.user.email!,
        } : null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user && data.session) {
        // User is set by onAuthStateChange listener, but we can set it here for immediate feedback
        const { data: profile } = await supabase
          .from('customer_profiles')
          .select('first_name, last_name')
          .eq('id', data.user.id)
          .single();

        setUser({
          id: data.user.id,
          email: data.user.email!,
          firstName: profile?.first_name || data.user.user_metadata?.first_name || '',
          lastName: profile?.last_name || data.user.user_metadata?.last_name || '',
        });
        setIsAuthenticated(true);
        setIsLoading(false);
        return {};
      }
      
      setIsLoading(false);
      return { error: 'Login failed - no user data received' };
    } catch (error: any) {
      setIsLoading(false);
      return { error: error?.message || 'An unexpected error occurred' };
    }
  }, []);

  const signup = useCallback(async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        setIsLoading(false);
        return { error: error.message };
      }

      if (data.user) {
        // Create customer profile
        const { error: profileError } = await supabase.from('customer_profiles').insert({
          id: data.user.id,
          email: data.user.email,
          first_name: firstName,
          last_name: lastName,
          marketing_consent: false,
        });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // If email confirmation is not required, sign in immediately
        if (data.session) {
          setUser({
            id: data.user.id,
            email: data.user.email!,
            firstName,
            lastName,
          });
          setIsAuthenticated(true);
        }
        
        setIsLoading(false);
        return {};
      }
      
      setIsLoading(false);
      return { error: 'Signup failed - no user data received' };
    } catch (error: any) {
      setIsLoading(false);
      return { error: error?.message || 'An unexpected error occurred' };
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Logout error:', error);
    }
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error: any) {
      return { error: error?.message || 'An unexpected error occurred' };
    }
  }, []);

  const updatePassword = useCallback(async (newPassword: string): Promise<{ error?: string }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (error: any) {
      return { error: error?.message || 'An unexpected error occurred' };
    }
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
