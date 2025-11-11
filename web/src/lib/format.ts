/**
 * Formatting utilities for metrics display
 * Handles null values gracefully and provides consistent formatting
 */

/**
 * Format milliseconds to human-readable string
 * @param n - Milliseconds value or null
 * @returns Formatted string (e.g., "1.2s", "450ms", "N/A")
 */
export function formatMs(n: number | null): string {
  if (n === null || n === undefined) {
    return 'N/A';
  }
  
  if (n >= 1000) {
    return `${(n / 1000).toFixed(1)}s`;
  }
  
  return `${Math.round(n)}ms`;
}

/**
 * Format percentage (fraction 0..1) to human-readable string
 * @param n - Percentage as fraction (0..1) or null
 * @param digits - Number of decimal digits (default: 0)
 * @returns Formatted string (e.g., "65%", "12.5%", "N/A")
 */
export function formatPct(n: number | null, digits = 0): string {
  if (n === null || n === undefined) {
    return 'N/A';
  }
  
  const percentage = n * 100;
  return `${percentage.toFixed(digits)}%`;
}

/**
 * Format integer to human-readable string with thousands separators
 * @param n - Integer value or null
 * @returns Formatted string (e.g., "1,234", "456", "N/A")
 */
export function formatInt(n: number | null): string {
  if (n === null || n === undefined) {
    return 'N/A';
  }
  
  return Math.round(n).toLocaleString();
}

/**
 * Format decimal number to human-readable string
 * @param n - Number value or null
 * @param digits - Number of decimal digits (default: 1)
 * @returns Formatted string (e.g., "12.5", "0.0", "N/A")
 */
export function formatNumber(n: number | null, digits = 1): string {
  if (n === null || n === undefined) {
    return 'N/A';
  }
  
  return n.toFixed(digits);
}

/**
 * Format large numbers with K/M suffixes
 * @param n - Number value or null
 * @returns Formatted string (e.g., "1.2K", "3.4M", "456", "N/A")
 */
export function formatCompact(n: number | null): string {
  if (n === null || n === undefined) {
    return 'N/A';
  }
  
  if (n >= 1_000_000) {
    return `${(n / 1_000_000).toFixed(1)}M`;
  }
  
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}K`;
  }
  
  return Math.round(n).toString();
}