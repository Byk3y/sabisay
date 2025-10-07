/**
 * Client-side CSRF token management
 */

let csrfTokenCache: string | null = null;
let tokenPromise: Promise<string> | null = null;

/**
 * Fetch CSRF token from the server
 */
async function fetchCSRFToken(): Promise<string> {
  try {
    const response = await fetch('/api/auth/csrf', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }

    const data = await response.json();
    return data.csrfToken;
  } catch (error) {
    console.error('CSRF token fetch error:', error);
    throw new Error('Failed to retrieve CSRF token');
  }
}

/**
 * Get CSRF token (cached or fresh)
 */
export async function getCSRFToken(): Promise<string> {
  // If we have a cached token, return it
  if (csrfTokenCache) {
    return csrfTokenCache;
  }

  // If there's already a request in progress, wait for it
  if (tokenPromise) {
    return tokenPromise;
  }

  // Start a new request
  tokenPromise = fetchCSRFToken();

  try {
    const token = await tokenPromise;
    csrfTokenCache = token;
    return token;
  } finally {
    tokenPromise = null;
  }
}

/**
 * Clear cached CSRF token (call after logout or session changes)
 */
export function clearCSRFToken(): void {
  csrfTokenCache = null;
  tokenPromise = null;
}

/**
 * Make an authenticated API request with CSRF token
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const csrfToken = await getCSRFToken();

  const headers = {
    'Content-Type': 'application/json',
    'x-csrf-token': csrfToken,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });
}

/**
 * Make an authenticated API request with FormData (for file uploads)
 */
export async function authenticatedFormDataFetch(
  url: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<Response> {
  const csrfToken = await getCSRFToken();

  const headers = {
    'x-csrf-token': csrfToken,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });
}
