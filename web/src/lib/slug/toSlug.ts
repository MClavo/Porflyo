/**
 * Slug generation utilities that match backend rules
 */

/**
 * Generate a URL-friendly slug from text
 * Matches backend slug generation rules:
 * - Lowercase only
 * - Alphanumeric characters and hyphens
 * - Cannot start or end with hyphen
 * - Multiple consecutive hyphens become single hyphen
 */
export function toSlug(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Convert to lowercase and normalize
  const slug = text
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove accents and special characters
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Keep only alphanumeric and hyphens
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-{2,}/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Sanitize user input to create a valid slug in real-time
 * More permissive than toSlug - preserves user intent when possible
 */
export function sanitizeSlugInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Convert to lowercase and replace problematic characters
  const sanitized = input
    .toLowerCase()
    .trim()
    // Replace spaces with hyphens
    .replace(/\s+/g, '-')
    // Remove accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Replace underscores with hyphens
    .replace(/_/g, '-')
    // Remove any character that's not alphanumeric or hyphen
    .replace(/[^a-z0-9-]/g, '')
    // Replace multiple consecutive hyphens with single hyphen
    .replace(/-{2,}/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');

  return sanitized;
}

/**
 * Validate if a string is a valid slug
 */
export function isValidSlug(slug: string): boolean {
  if (!slug || typeof slug !== 'string') {
    return false;
  }

  // Must match the pattern: lowercase alphanumeric with hyphens,
  // cannot start or end with hyphen
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug);
}