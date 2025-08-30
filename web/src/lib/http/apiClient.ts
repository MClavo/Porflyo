/**
 * API client for authenticated endpoints
 * Uses credentials:'include' to send session cookies
 */

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

class ApiClientError extends Error {
  public status: number;
  public details?: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Base fetch wrapper for API endpoints with session credentials
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/api${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    credentials: 'include', // Always include session cookies
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorDetails: unknown;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorDetails = errorData;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiClientError(errorMessage, response.status, errorDetails);
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ApiClientError('Invalid JSON response', response.status, error);
  }
}

/**
 * Base fetch wrapper for public endpoints (no /api prefix)
 */
async function publicFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Request failed with status ${response.status}`;
    let errorDetails: unknown;

    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      errorDetails = errorData;
    } catch {
      // If response is not JSON, use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new ApiClientError(errorMessage, response.status, errorDetails);
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new ApiClientError('Invalid JSON response', response.status, error);
  }
}

/**
 * GET request to API endpoint
 */
export function apiGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'GET', ...options });
}

/**
 * POST request to API endpoint
 */
export function apiPost<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PUT request to API endpoint
 */
export function apiPut<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PATCH request to API endpoint
 */
export function apiPatch<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return apiFetch<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * DELETE request to API endpoint
 */
export function apiDelete<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return apiFetch<T>(endpoint, { method: 'DELETE', ...options });
}

/**
 * Upload file to API endpoint
 */
export function apiUpload<T>(
  endpoint: string,
  file: File,
  additionalData?: Record<string, string>,
  options?: RequestInit
): Promise<T> {
  const formData = new FormData();
  formData.append('file', file);
  
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });
  }

  // Remove Content-Type to let browser set it with boundary
  const headers = { ...options?.headers };
  if ('Content-Type' in headers) {
    delete headers['Content-Type'];
  }

  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: formData,
    headers,
    ...options,
  });
}

/**
 * GET request to public endpoint (no /api prefix)
 */
export function publicGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return publicFetch<T>(endpoint, { method: 'GET', ...options });
}

export { ApiClientError };
