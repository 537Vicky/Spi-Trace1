// Frontend/src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'client' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  resetPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Backend API URL
const API_URL = 'http://127.0.0.1:5000';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('darkwatch_user');
    const storedToken = localStorage.getItem('darkwatch_token');

    if (storedUser && storedToken) {
      try {
        // Verify token with backend
        fetch(`${API_URL}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${storedToken}`
          }
        })
          .then(res => res.json())
          .then(data => {
            if (data.id) {
              const userData = {
                id: String(data.id),
                email: data.email,
                role: data.role as UserRole,
                name: data.name,
                createdAt: new Date(data.createdAt)
              };
              setUser(userData);
              localStorage.setItem('darkwatch_user', JSON.stringify(userData));
            } else {
              // Token invalid, clear storage
              localStorage.removeItem('darkwatch_user');
              localStorage.removeItem('darkwatch_token');
            }
            setIsLoading(false);
          })
          .catch(() => {
            localStorage.removeItem('darkwatch_user');
            localStorage.removeItem('darkwatch_token');
            setIsLoading(false);
          });
      } catch {
        localStorage.removeItem('darkwatch_user');
        localStorage.removeItem('darkwatch_token');
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        const userData: User = {
          id: String(data.user.id),
          email: data.user.email,
          role: data.user.role as UserRole,
          name: data.user.name,
          createdAt: new Date(data.user.createdAt)
        };

        setUser(userData);
        localStorage.setItem('darkwatch_user', JSON.stringify(userData));
        localStorage.setItem('darkwatch_token', data.access_token);
        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: data.error || data.msg || 'Sign in failed' };
    } catch (error) {
      console.error('Sign in error:', error);
      setIsLoading(false);
      return { success: false, error: 'Unable to connect to server. Please ensure the backend is running on http://localhost:5000' };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          name: fullName
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // After successful registration, sign in
        const signInResult = await signIn(email, password);
        return signInResult;
      }

      setIsLoading(false);
      return { success: false, error: data.error || data.msg || 'Sign up failed' };
    } catch (error) {
      console.error('Sign up error:', error);
      setIsLoading(false);
      return { success: false, error: 'Unable to connect to server. Please ensure the backend is running on http://localhost:5000' };
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('darkwatch_user');
    localStorage.removeItem('darkwatch_token');
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      }

      return { success: false, error: data.msg || 'Failed to send reset email' };
    } catch (error) {
      console.error('Forgot password error:', error);
      return { success: false, error: 'Unable to connect to server' };
    }
  };

  const resetPassword = async (token: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true };
      }

      return { success: false, error: data.msg || 'Failed to reset password' };
    } catch (error) {
      console.error('Reset password error:', error);
      return { success: false, error: 'Unable to connect to server' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}