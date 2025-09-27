'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  userId: string;
  email: string;
  isLoggedIn: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userId: string, email: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    console.log('AuthContext: Starting auth check');
    checkAuth();

    // Fallback timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.log('AuthContext: Timeout reached, stopping loading');
        setIsLoading(false);
      }
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      console.log('Checking auth...');

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      console.log('Auth response:', response.status);

      if (response.ok) {
        const userData = await response.json();
        console.log('User data:', userData);
        setUser({
          userId: userData.userId,
          email: userData.email,
          isLoggedIn: userData.isLoggedIn,
        });
      } else {
        console.log('Auth failed, setting user to null');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      console.log('Auth check complete, setting loading to false');
      setIsLoading(false);
      setHasChecked(true);
    }
  };

  const login = (userId: string, email: string) => {
    setUser({
      userId,
      email,
      isLoggedIn: true,
    });
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        checkAuth,
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
