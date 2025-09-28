'use client';

import { useEffect, useState, useRef } from 'react';
import { Magic } from 'magic-sdk';
import { OAuthExtension } from '@magic-ext/oauth2';
import { useRouter } from 'next/navigation';
import { useAuth, setOAuthCallbackInProgress } from '@/contexts/AuthContext';

export default function AuthCallback() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const ran = useRef(false);
  const { refreshAuth } = useAuth();

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    
    // Set OAuth callback in progress flag
    setOAuthCallbackInProgress(true);
    
    (async () => {
      try {
        console.log('Auth callback page loaded, processing OAuth result...');

        // First check if user is already authenticated
        const authCheck = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (authCheck.ok) {
          console.log('User already authenticated, refreshing auth context and redirecting to home...');
          await refreshAuth();
          setStatus('success');
          setTimeout(() => {
            router.push('/');
          }, 1500);
          return;
        }

        // Initialize Magic client
        const magic = new Magic(process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY!, {
          extensions: [new OAuthExtension()],
        });

        // Get the result from the redirect
        const result = await magic.oauth2.getRedirectResult({});
        const didToken = result?.magic?.idToken;
        
        if (didToken) {
          console.log('OAuth redirect successful, sending to API...');
          
          // Send DID token to our API
          const response = await fetch('/api/auth/magic/login', {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ didToken }),
          });

          if (response.ok) {
            console.log('Login successful, refreshing auth context and redirecting to home...');
            await refreshAuth();
            setStatus('success');
            // Redirect to home page after successful login
            setTimeout(() => {
              router.push('/');
            }, 1500);
          } else {
            const errorData = await response.json();
            console.error('Login failed:', errorData);
            
            // Handle the "User is already logged in" error gracefully
            if (errorData.error && errorData.error.includes('already logged in')) {
              console.log('User already logged in, refreshing auth context and redirecting to home...');
              await refreshAuth();
              setStatus('success');
              setTimeout(() => {
                router.push('/');
              }, 1500);
            } else {
              setError(errorData.error || 'Login failed');
              setStatus('error');
            }
          }
        } else {
          console.error('No ID token received from OAuth redirect');
          setError('No authentication token received');
          setStatus('error');
        }
      } catch (err) {
        console.error('OAuth callback error:', err);
        
        // Check if the error is about user already being logged in
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (errorMessage.includes('already logged in') || errorMessage.includes('Skipped remaining OAuth verification steps')) {
          console.log('User already logged in, refreshing auth context and treating as success...');
          await refreshAuth();
          setStatus('success');
          setTimeout(() => {
            router.push('/');
          }, 1500);
        } else {
          setError(errorMessage);
          setStatus('error');
        }
      } finally {
        // Clear OAuth callback in progress flag
        setOAuthCallbackInProgress(false);
      }
    })();
  }, [router]);

  // Cleanup effect to clear OAuth flag on unmount
  useEffect(() => {
    return () => {
      setOAuthCallbackInProgress(false);
    };
  }, []);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b1220]" suppressHydrationWarning>
        <div className="text-center" suppressHydrationWarning>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" suppressHydrationWarning></div>
          <p className="text-gray-600 dark:text-gray-400">Completing authentication...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b1220]" suppressHydrationWarning>
        <div className="text-center max-w-md mx-auto p-6" suppressHydrationWarning>
          <div className="text-red-500 text-6xl mb-4" suppressHydrationWarning>⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Authentication Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || 'Something went wrong during authentication.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            suppressHydrationWarning
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0b1220]" suppressHydrationWarning>
      <div className="text-center" suppressHydrationWarning>
        <div className="text-green-500 text-6xl mb-4" suppressHydrationWarning>✅</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Authentication Successful!
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Redirecting you to the home page...
        </p>
      </div>
    </div>
  );
}
