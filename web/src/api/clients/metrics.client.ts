/**
 * Metrics API client for fetching and submitting analytics data
 */

import { httpClient } from './http';
import type { BootstrapResponse, SessionMetricsPayload } from '../types';

/**
 * Runtime validation for BootstrapResponse
 */
function validateBootstrapResponse(data: unknown): asserts data is BootstrapResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: expected object');
  }

  const response = data as Record<string, unknown>;

  // Validate meta object
  if (!response.meta || typeof response.meta !== 'object') {
    throw new Error('Invalid response: missing or invalid meta object');
  }

  const meta = response.meta as Record<string, unknown>;
  
  // Validate meta.units and meta.units.timeBase
  if (!meta.units || typeof meta.units !== 'object') {
    throw new Error('Invalid response: missing or invalid meta.units');
  }

  const units = meta.units as Record<string, unknown>;
  if (!units.timeBase || (units.timeBase !== 'ds' && units.timeBase !== 'ms')) {
    throw new Error('Invalid response: meta.units.timeBase must be "ds" or "ms"');
  }

  // Validate dailyAgg array (can be empty)
  if (response.dailyAgg !== undefined && !Array.isArray(response.dailyAgg)) {
    throw new Error('Invalid response: dailyAgg must be an array');
  }

  // Validate slots array (can be empty)
  if (response.slots !== undefined && !Array.isArray(response.slots)) {
    throw new Error('Invalid response: slots must be an array');
  }
  
  // Set empty arrays if missing
  if (!response.dailyAgg) {
    (response as Record<string, unknown>).dailyAgg = [];
  }
  if (!response.slots) {
    (response as Record<string, unknown>).slots = [];
  }
}

/**
 * Parameters for getMetrics function
 */
export interface GetMetricsParams {
  portfolioId: string;
  months?: number; // Number of months back to fetch (default: 3)
}

/**
 * Fetch bootstrap metrics data for a portfolio
 * 
 * @param params - Parameters containing portfolioId and optional months
 * @returns Promise resolving to typed BootstrapResponse
 * @throws Error if response validation fails or network error occurs
 */
export async function getMetrics({ portfolioId, months = 3 }: GetMetricsParams): Promise<BootstrapResponse> {
  try {
    const response = await httpClient.get(`/metrics/${portfolioId}/${months}`);

    // Runtime validation
    validateBootstrapResponse(response.data);

    return response.data;
  } catch (error) {
    // Re-throw with additional context if it's a validation error
    if (error instanceof Error && error.message.startsWith('Invalid response:')) {
      throw new Error(`Metrics API validation failed: ${error.message}`);
    }
    
    // Re-throw other errors (network, HTTP status, etc.)
    throw error;
  }
}

export interface SendSessionMetricsParams {
  url: string;
  portfolioId: string;
  metrics: SessionMetricsPayload;
}

/**
 * Send session metrics to backend via POST request
 * Uses text/plain content-type to avoid CORS preflight OPTIONS request
 */
export async function sendSessionMetrics({
  url,
  portfolioId,
  metrics,
}: SendSessionMetricsParams): Promise<void> {
  const payload = {
    portfolioId,
    ...metrics,
  };

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'text/plain',
    },
    body: JSON.stringify(payload),
  });
}