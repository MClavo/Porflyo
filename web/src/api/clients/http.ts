/**
 * HTTP client configuration for metrics API
 */

import axios, { type AxiosInstance, type AxiosError } from 'axios';

/**
 * Base URL from environment or fallback to development proxy
 */
const getBaseURL = (): string => {
  // In production, use environment variable
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // In development, use Vite proxy (see vite.config.ts)
  return '';
};

/**
 * Axios instance for metrics API calls
 */
export const httpClient: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Include session cookies for authentication
});

/**
 * Response interceptor - pass through successful responses
 */
httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Normalize error message for consistent handling
    const errorData = error.response?.data as Record<string, unknown>;
    const normalizedError = {
      message: (errorData?.message as string) || error.message || 'Network error occurred',
      status: error.response?.status || 0,
      originalError: error,
    };
    
    return Promise.reject(normalizedError);
  }
);

/**
 * Error type for normalized API errors
 */
export interface ApiError {
  message: string;
  status: number;
  originalError: AxiosError;
}