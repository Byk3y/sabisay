'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { clearCSRFToken } from '@/lib/csrf-client';

interface User {
  userId: string;
  email: string;
  username: string;
  isLoggedIn: boolean;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (userId: string, email: string, username: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Global flag to track OAuth callback in progress
let isOAuthCallbackInProgress = false;

export function setOAuthCallbackInProgress(value: boolean) {
  isOAuthCallbackInProgress = value;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChecked, setHasChecked] = useState(false);
  const isCheckingRef = useRef(false);
  const authCheckPromiseRef = useRef<Promise<void> | null>(null);

  // Check authentication status on mount - only once
  useEffect(() => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingRef.current || hasChecked) {
      return;
    }

    // Skip auth check if OAuth callback is in progress
    if (isOAuthCallbackInProgress) {
      setIsLoading(false);
      setHasChecked(true);
      return;
    }

    // Check authentication with proper sequencing to avoid race conditions
    const performAuthCheck = async () => {
      // If there's already an auth check in progress, wait for it
      if (authCheckPromiseRef.current) {
        await authCheckPromiseRef.current;
        return;
      }

      // Create a new auth check promise
      const authCheckPromise = (async () => {
        try {
          isCheckingRef.current = true;
          setIsLoading(true);

          // First check for existing server session
          const serverAuthSuccess = await checkAuth();

          // If server auth didn't find a user, then check Magic Link session
          if (!serverAuthSuccess) {
            await checkMagicLinkSession();
          }
        } catch (error) {
          console.error('Auth check sequence failed:', error);
        } finally {
          isCheckingRef.current = false;
          setIsLoading(false);
          setHasChecked(true);
          authCheckPromiseRef.current = null;
        }
      })();

      authCheckPromiseRef.current = authCheckPromise;
      await authCheckPromise;
    };

    performAuthCheck();
  }, [hasChecked]);

  const checkAuth = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache',
      });

      if (response.ok) {
        const userData = await response.json();
        setUser({
          userId: userData.userId,
          email: userData.email,
          username: userData.username || '',
          isLoggedIn: userData.isLoggedIn,
          isAdmin: userData.isAdmin || false,
        });
        return true; // Successfully authenticated
      } else {
        setUser(null);
        return false; // Authentication failed
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return false; // Authentication failed
    }
  };

  const login = async (userId: string, email: string, username: string) => {
    setUser({
      userId,
      email,
      username,
      isLoggedIn: true,
      isAdmin: false, // Will be updated by checkAuth
    });

    // Refresh auth context to ensure sync with server
    await checkAuth();
  };

  // Check for existing Magic Link session
  const checkMagicLinkSession = async () => {
    try {
      // Only check if we don't already have a user
      if (user) {
        return;
      }

      // Dynamically import Magic to avoid SSR issues
      const { createMagicClient } = await import('@/lib/magic');
      const magic = createMagicClient();

      const isLoggedIn = await magic.user.isLoggedIn();
      if (isLoggedIn) {
        const didToken = await magic.user.getIdToken();
        if (didToken) {
          // Send to API to create session
          const response = await fetch('/api/auth/magic/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ didToken }),
          });

          if (response.ok) {
            const result = await response.json();

            // Only set user if we don't already have one (prevent override)
            setUser(prevUser => {
              if (prevUser) {
                return prevUser;
              }

              return {
                userId: result.userId,
                email: result.email,
                username: result.username || '',
                isLoggedIn: true,
                isAdmin: result.isAdmin || false, // Use admin status from API response
              };
            });
          }
        }
      }
    } catch (error) {}
  };

  const logout = async () => {
    try {
      // 1. Clear Magic Link session (prevents auto-login on refresh)
      try {
        const { createMagicClient } = await import('@/lib/magic');
        const magic = createMagicClient();
        await magic.user.logout();
      } catch (magicError) {
        console.warn('Magic logout failed:', magicError);
        // Continue with other logout steps even if Magic fails
      }

      // 2. Clear Supabase session (prevents auto-login from localStorage)
      try {
        const { supabaseClient } = await import('@/lib/supabase-client');
        await supabaseClient.auth.signOut();
      } catch (supabaseError) {
        console.warn('Supabase logout failed:', supabaseError);
        // Continue with other logout steps even if Supabase fails
      }

      // 3. Clear server Iron session (with CSRF token)
      const { authenticatedFetch } = await import('@/lib/csrf-client');
      await authenticatedFetch('/api/auth/logout', { method: 'POST' });

      // 4. Clear local state
      setUser(null);
      clearCSRFToken(); // Clear cached CSRF token
    } catch (error) {
      console.error('Logout failed:', error);
      // Still clear local state even if API call fails
      setUser(null);
      clearCSRFToken(); // Clear cached CSRF token even on error
    }
  };

  const refreshAuth = async () => {
    // If there's already an auth check in progress, wait for it
    if (authCheckPromiseRef.current) {
      await authCheckPromiseRef.current;
      return;
    }

    // Create a new auth check promise
    const authCheckPromise = (async () => {
      try {
        isCheckingRef.current = true;
        setIsLoading(true);
        await checkAuth();
      } catch (error) {
        console.error('Refresh auth failed:', error);
      } finally {
        isCheckingRef.current = false;
        setIsLoading(false);
        authCheckPromiseRef.current = null;
      }
    })();

    authCheckPromiseRef.current = authCheckPromise;
    await authCheckPromise;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        logout,
        checkAuth,
        refreshAuth,
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

// Safe version that doesn't throw
export function useAuthSafe() {
  const context = useContext(AuthContext);
  return context;
}
