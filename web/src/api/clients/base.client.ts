/**
 * Base API client configuration using axios
 * Provides authenticated and public endpoints
 */

import axios, { type AxiosInstance, type AxiosResponse } from 'axios';

/**
 * Authenticated API client for endpoints that require session cookies
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include session cookies
});

/**
 * Response interceptor to handle 401 errors 
 * Only redirect if we're NOT already on the root page to avoid infinite loops
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect if we're not already on the root page
      if (window.location.pathname !== '/') {
        // Session expired or unauthorized - redirect to home page
        window.location.href = '/';
      }
      return Promise.reject(error);
    }
    return Promise.reject(error);
  }
);

/**
 * Public API client for endpoints that don't require authentication
 */
export const publicClient: AxiosInstance = axios.create({
  baseURL: '/public',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // No credentials for public endpoints
});

/**
 * Error handling for API responses
 */
export class ApiClientError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Generic GET request with authenticated client
 */
export async function apiGet<T>(endpoint: string): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new ApiClientError(message, error.response?.status || 500, error.response?.data);
    }
    throw error;
  }
}

/**
 * Generic POST request with authenticated client
 */
export async function apiPost<T>(endpoint: string, data?: unknown): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new ApiClientError(message, error.response?.status || 500, error.response?.data);
    }
    throw error;
  }
}

/**
 * Generic PATCH request with authenticated client
 */
export async function apiPatch<T>(endpoint: string, data?: unknown): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClient.patch(endpoint, data);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new ApiClientError(message, error.response?.status || 500, error.response?.data);
    }
    throw error;
  }
}

/**
 * Generic DELETE request with authenticated client
 */
export async function apiDelete<T>(endpoint: string): Promise<T> {
  try {
    const response: AxiosResponse<T> = await apiClient.delete(endpoint);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new ApiClientError(message, error.response?.status || 500, error.response?.data);
    }
    throw error;
  }
}

/**
 * Generic GET request with public client
 */
export async function publicGet<T>(endpoint: string): Promise<T> {
  try {
    const response: AxiosResponse<T> = await publicClient.get(endpoint);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.message || error.message;
      throw new ApiClientError(message, error.response?.status || 500, error.response?.data);
    }
    throw error;
  }
}