import { useCallback } from 'react';
import { sendSessionMetrics } from '../clients/metrics.client';
import type { SessionMetricsPayload } from '../types';

export interface UseSendMetricsParams {
  portfolioId: string;
}

export function useSendMetrics({ portfolioId }: UseSendMetricsParams) {
  const sendMetrics = useCallback(
    async (metrics: SessionMetricsPayload) => {
      const url = `/metrics/${portfolioId}`;
      await sendSessionMetrics({ url, portfolioId, metrics });
    },
    [portfolioId]
  );

  return { sendMetrics };
}

/**
 * Send metrics on page unload using keepalive fetch
 * Uses text/plain to avoid CORS preflight
 */
export function sendMetricsOnUnload(
  portfolioId: string,
  metrics: SessionMetricsPayload
): void {
  const url = `/metrics/${portfolioId}`;
  const payload = JSON.stringify({
    portfolioId,
    ...metrics,
  });

  fetch(url, {
    method: 'POST',
    body: payload,
    keepalive: true,
    headers: {
      'Content-Type': 'text/plain',
    },
  }).catch(() => {
    // Ignore errors during unload
  });
}