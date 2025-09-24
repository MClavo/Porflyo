// Lightweight integration point for the external `analytics` library.
// For now we will not send events; this file provides a place to initialize
// the analytics client later and expose a noop-compatible API.

// We'll import the external `analytics` package lazily when needed.

export type AnalyticsClient = {
  track: (eventName: string, payload?: unknown) => void;
};

let client: AnalyticsClient | null = null;

export function initAnalytics(instance: AnalyticsClient) {
  client = instance;
}

export function getAnalyticsClient(): AnalyticsClient | null {
  return client;
}

export function track(eventName: string, payload?: unknown) {
  if (!client) return;
  try {
    client.track(eventName, payload);
  } catch (err) {
    console.warn('Analytics track failed', err);
  }
}

export default {
  initAnalytics,
  getAnalyticsClient,
  track,
};
