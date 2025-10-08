'use client';

import { useState } from 'react';
import { createMagicClient } from '@/lib/magic';

export default function MagicCheckPage() {
  // Only available in development
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Magic Auth Test
          </h1>
          <div className="text-center text-gray-600">
            This page is only available in development mode.
          </div>
        </div>
      </div>
    );
  }
  const [email, setEmail] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleMagicLogin = async () => {
    if (!email) {
      alert('Please enter an email address');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Initialize Magic client
      const magic = createMagicClient();

      // Login with email OTP
      const didToken = await magic.auth.loginWithEmailOTP({ email });

      // Send DID token to our API
      const loginResponse = await fetch('/api/auth/magic/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ didToken }),
      });

      const loginResult = await loginResponse.json();

      // Check session
      const meResponse = await fetch('/api/auth/me');
      const meResult = await meResponse.json();

      setResult({
        login: loginResult,
        me: meResult,
        success: loginResponse.ok && meResponse.ok,
      });
    } catch (error) {
      console.error('Magic login error:', error);
      setResult({
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Magic Auth Test
        </h1>

        <div className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter your email"
            />
          </div>

          <button
            onClick={handleMagicLogin}
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Magic Login'}
          </button>

          {result && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Test Results
              </h3>
              <div
                className={`p-4 rounded-md ${
                  result.success
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
