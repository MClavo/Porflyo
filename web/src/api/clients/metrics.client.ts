/**
 * Metrics API client for fetching analytics data
 */

import { httpClient } from './http';
import type { BootstrapResponse } from '../types';

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

  // Validate dailyAgg array
  if (!Array.isArray(response.dailyAgg)) {
    throw new Error('Invalid response: dailyAgg must be an array');
  }

  // Validate slots array
  if (!Array.isArray(response.slots)) {
    throw new Error('Invalid response: slots must be an array');
  }
}

/**
 * Parameters for getMetrics function
 */
export interface GetMetricsParams {
  portfolioId: string;
}

/**
 * Fetch bootstrap metrics data for a portfolio
 * 
 * @param params - Parameters containing portfolioId
 * @returns Promise resolving to typed BootstrapResponse
 * @throws Error if response validation fails or network error occurs
 */
export async function getMetrics({ portfolioId }: GetMetricsParams): Promise<BootstrapResponse> {
  try {
    const response = await httpClient.get('/metrics', {
      params: {
        portfolioId,
      },
    });

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