/**
 * Date utilities for metrics data processing
 * Handles date ranges, grouping, and filtering operations
 */

/**
 * Get the latest (most recent) date from a sorted date index
 * @param dailyIndex - Array of dates sorted in descending order (newest first)
 * @returns Latest date or null if empty
 */
export function latest(dailyIndex: string[]): string | null {
  if (dailyIndex.length === 0) {
    return null;
  }
  return dailyIndex[0]; // First item in desc-sorted array
}

/**
 * Get dates from the last N days (including today)
 * @param dates - Array of dates sorted in descending order
 * @param n - Number of days to include
 * @returns Array of dates from the last N days
 */
export function sliceByLastNDays(dates: string[], n: number): string[] {
  return dates.slice(0, n);
}

/**
 * Group dates by month (YYYY-MM format)
 * @param dates - Array of date strings (YYYY-MM-DD format)
 * @returns Object mapping month keys to arrays of dates
 */
export function groupByMonth(dates: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {};
  
  for (const date of dates) {
    const monthKey = date.substring(0, 7); // Extract YYYY-MM
    if (!grouped[monthKey]) {
      grouped[monthKey] = [];
    }
    grouped[monthKey].push(date);
  }
  
  return grouped;
}

/**
 * Get dates within a specific date range (inclusive)
 * @param dates - Array of dates sorted in descending order
 * @param startDate - Start date (YYYY-MM-DD format)
 * @param endDate - End date (YYYY-MM-DD format)
 * @returns Array of dates within the range
 */
export function filterDateRange(dates: string[], startDate: string, endDate: string): string[] {
  return dates.filter(date => date >= startDate && date <= endDate);
}

/**
 * Get dates for a specific month
 * @param dates - Array of dates sorted in descending order
 * @param month - Month in YYYY-MM format
 * @returns Array of dates for the specified month
 */
export function filterByMonth(dates: string[], month: string): string[] {
  return dates.filter(date => date.startsWith(month));
}

/**
 * Calculate date N days ago from a reference date
 * @param referenceDate - Reference date (YYYY-MM-DD format)
 * @param daysAgo - Number of days to subtract
 * @returns Date string N days ago
 */
export function daysAgo(referenceDate: string, daysAgo: number): string {
  const date = new Date(referenceDate);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

/**
 * Get the start date for a window of N days ending on a reference date
 * @param referenceDate - End date of the window (YYYY-MM-DD format)
 * @param windowDays - Size of the window in days
 * @returns Start date of the window
 */
export function windowStartDate(referenceDate: string, windowDays: number): string {
  return daysAgo(referenceDate, windowDays - 1);
}

/**
 * Check if a date is within the last N days from a reference date
 * @param date - Date to check (YYYY-MM-DD format)
 * @param referenceDate - Reference date (YYYY-MM-DD format)
 * @param days - Number of days
 * @returns True if date is within the last N days
 */
export function isWithinLastNDays(date: string, referenceDate: string, days: number): boolean {
  const startDate = windowStartDate(referenceDate, days);
  return date >= startDate && date <= referenceDate;
}

/**
 * Sort dates in descending order (newest first)
 * @param dates - Array of date strings
 * @returns Sorted array (newest first)
 */
export function sortDatesDesc(dates: string[]): string[] {
  return [...dates].sort((a, b) => b.localeCompare(a));
}

/**
 * Sort dates in ascending order (oldest first)
 * @param dates - Array of date strings
 * @returns Sorted array (oldest first)
 */
export function sortDatesAsc(dates: string[]): string[] {
  return [...dates].sort((a, b) => a.localeCompare(b));
}

/**
 * Get unique months from an array of dates
 * @param dates - Array of date strings (YYYY-MM-DD format)
 * @returns Array of unique month strings (YYYY-MM format) sorted desc
 */
export function getUniqueMonths(dates: string[]): string[] {
  const months = new Set(dates.map(date => date.substring(0, 7)));
  return Array.from(months).sort((a, b) => b.localeCompare(a));
}

/**
 * Format date for display
 * @param date - Date string in YYYY-MM-DD format
 * @param format - Format type ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(date: string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const dateObj = new Date(date);
  
  switch (format) {
    case 'short':
      return dateObj.toLocaleDateString('en-US', { 
        month: 'numeric', 
        day: 'numeric' 
      });
    case 'long':
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    case 'medium':
    default:
      return dateObj.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
  }
}