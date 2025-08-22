import { ApiClientError } from '../../../lib/http/apiClient';

/**
 * Lightweight auth check against backend /auth endpoint.
 * This endpoint is expected to return 200 when a session exists and
 * 401/403 when not authenticated. It intentionally does NOT return the
 * full user object so it can be used for cheap session checks.
 */
export async function checkAuth(): Promise<boolean> {
  const res = await fetch('/auth', { credentials: 'include' });

  if (res.ok) return true;

  // For 401/403, throw a structured error so callers can detect unauthenticated
  if (res.status === 401 || res.status === 403) {
    throw new ApiClientError('Not authenticated', res.status);
  }

  // For other non-OK responses include body/text when possible
  let details: unknown = undefined;
  try {
    details = await res.json();
  } catch {
    try {
      details = await res.text();
    } catch {
      details = res.statusText;
    }
  }

  throw new ApiClientError(String(details ?? 'Auth check failed'), res.status);
}

export default { checkAuth };
