/**
 * API Configuration
 * Central configuration for all API endpoints
 */

// Get API base URL from environment variable
// In production: https://api.autojobzy.com/api
// In development: http://localhost:5000/api
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Remove trailing slash if present
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${cleanEndpoint}`;
};

// Helper function to make authenticated API calls
export const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token') ||
                localStorage.getItem('superAdminToken') ||
                localStorage.getItem('instituteAdminToken');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(getApiUrl(endpoint), {
    ...options,
    headers,
  });

  return response;
};

export default {
  API_BASE_URL,
  getApiUrl,
  fetchWithAuth,
};
