/**
 * Public client for unauthenticated endpoints
 * Uses credentials:'omit' to avoid sending session cookies
 */

export interface PublicApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PublicApiError {
  message: string;
  status: number;
  details?: unknown;
}

class PublicClientError extends Error {
  public status: number;
  public details?: unknown;

  constructor(
    message: string,
    status: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'PublicClientError';
    this.status = status;
    this.details = details;
  }
}

/**
 * Base fetch wrapper for public endpoints without credentials
 */
async function publicFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `/public${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const response = await fetch(url, {
    credentials: 'omit', // Never send credentials
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

    throw new PublicClientError(errorMessage, response.status, errorDetails);
  }

  // Handle empty responses
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  try {
    return await response.json();
  } catch (error) {
    throw new PublicClientError('Invalid JSON response', response.status, error);
  }
}

/**
 * GET request to public endpoint
 */
export function publicGet<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return publicFetch<T>(endpoint, { method: 'GET', ...options });
}

/**
 * POST request to public endpoint
 */
export function publicPost<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return publicFetch<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PUT request to public endpoint
 */
export function publicPut<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return publicFetch<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * PATCH request to public endpoint
 */
export function publicPatch<T>(
  endpoint: string,
  data?: unknown,
  options?: RequestInit
): Promise<T> {
  return publicFetch<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
    ...options,
  });
}

/**
 * DELETE request to public endpoint
 */
export function publicDelete<T>(endpoint: string, options?: RequestInit): Promise<T> {
  return publicFetch<T>(endpoint, { method: 'DELETE', ...options });
}

export { PublicClientError };
