/**
 * API Client with Timeout Support
 * Centralized API calls with proper timeout handling
 */

const DEFAULT_TIMEOUT = 60000; // 60 seconds
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.autojobzy.com/api';

interface FetchOptions extends RequestInit {
  timeout?: number;
}

/**
 * Fetch with timeout support
 * @param url - API endpoint URL
 * @param options - Fetch options with optional timeout
 * @returns Promise with response
 */
export async function fetchWithTimeout(url: string, options: FetchOptions = {}): Promise<Response> {
  const { timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options;

  // Create abort controller
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout / 1000} seconds. Please check your internet connection.`);
    }

    throw error;
  }
}

/**
 * POST request with JSON body and timeout
 */
export async function apiPost(endpoint: string, data: any, timeout?: number): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    timeout,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || responseData.message || 'Request failed');
  }

  return responseData;
}

/**
 * GET request with timeout and optional auth
 */
export async function apiGet(endpoint: string, token?: string, timeout?: number): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers: HeadersInit = token
    ? { 'Authorization': `Bearer ${token}` }
    : {};

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers,
    timeout,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || responseData.message || 'Request failed');
  }

  return responseData;
}

/**
 * DELETE request with timeout and auth
 */
export async function apiDelete(endpoint: string, token: string, timeout?: number): Promise<any> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetchWithTimeout(url, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
    timeout,
  });

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.error || responseData.message || 'Request failed');
  }

  return responseData;
}

/**
 * Login API call with extended timeout
 */
export async function loginAPI(email: string, password: string): Promise<any> {
  return apiPost('/auth/login', { email, password }, 60000); // 60 seconds
}

/**
 * Verify Naukri credentials with extended timeout
 */
export async function verifyNaukriCredentials(
  token: string,
  naukriUsername: string,
  naukriPassword: string
): Promise<any> {
  const url = `${API_BASE_URL}/auth/verify-naukri-credentials`;

  const response = await fetchWithTimeout(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ naukriUsername, naukriPassword }),
    timeout: 120000, // 120 seconds for Naukri verification
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Verification failed');
  }

  return data;
}

export { API_BASE_URL, DEFAULT_TIMEOUT };
