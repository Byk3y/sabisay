'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';

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

  // Check authentication status on mount - only once
  useEffect(() => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingRef.current || hasChecked) {
      return;
    }

    console.log('AuthContext: Starting auth check');

    // Skip auth check if OAuth callback is in progress
    if (isOAuthCallbackInProgress) {
      console.log(
        'AuthContext: OAuth callback in progress, skipping initial auth check'
      );
      setIsLoading(false);
      setHasChecked(true);
      return;
    }

    // Check authentication with proper sequencing to avoid race conditions
    const performAuthCheck = async () => {
      try {
        // First check for existing server session
        const serverAuthSuccess = await checkAuth();

        // If server auth didn't find a user, then check Magic Link session
        if (!serverAuthSuccess) {
          await checkMagicLinkSession();
        }
      } catch (error) {
        console.error('Auth check sequence failed:', error);
      }
    };

    performAuthCheck();
  }, [hasChecked]);

  const checkAuth = async (): Promise<boolean> => {
    // Prevent multiple simultaneous auth checks
    if (isCheckingRef.current) {
      return false;
    }

    try {
      isCheckingRef.current = true;
      setIsLoading(true);
      console.log('Checking auth...');

      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
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
          username: userData.username || '',
          isLoggedIn: userData.isLoggedIn,
          isAdmin: userData.isAdmin || false,
        });
        return true; // Successfully authenticated
      } else {
        console.log('Auth failed, setting user to null');
        setUser(null);
        return false; // Authentication failed
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      return false; // Authentication failed
    } finally {
      console.log('Auth check complete, setting loading to false');
      isCheckingRef.current = false;
      setIsLoading(false);
      setHasChecked(true);
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
      // Only check if we don't have a user and haven't checked yet
      if (user || hasChecked) return;

      console.log('Checking for existing Magic Link session...');

      // Dynamically import Magic to avoid SSR issues
      const { createMagicClient } = await import('@/lib/magic');
      const magic = createMagicClient();

      const isLoggedIn = await magic.user.isLoggedIn();
      if (isLoggedIn) {
        console.log('Found existing Magic Link session, getting DID token...');
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
            console.log('Magic Link session restored:', result);

            // Only set user if we don't already have one (prevent override)
            setUser(prevUser => {
              if (prevUser) {
                console.log(
                  'User already exists, not overriding with Magic Link data'
                );
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
    } catch (error) {
      console.log('No Magic Link session found or error checking:', error);
    }
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

  const refreshAuth = async () => {
    console.log('AuthContext: Refreshing auth state...');
    setHasChecked(false); // Allow re-checking
    await checkAuth();
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
