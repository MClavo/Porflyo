import { useCallback } from 'react';
import { sendSessionMetrics } from '../clients/metrics.client';
import type { SessionMetricsPayload } from '../types';

export interface UseSendMetricsParams {
  url: string;
  portfolioId: string;
}

export function useSendMetrics({ url, portfolioId }: UseSendMetricsParams) {
  const sendMetrics = useCallback(
    async (metrics: SessionMetricsPayload) => {
      await sendSessionMetrics({ url, portfolioId, metrics });
    },
    [url, portfolioId]
  );

  return { sendMetrics };
}

/**
 * Send metrics on page unload using keepalive fetch
 * Uses text/plain to avoid CORS preflight
 */
export function sendMetricsOnUnload(
  url: string,
  portfolioId: string,
  metrics: SessionMetricsPayload
): void {
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