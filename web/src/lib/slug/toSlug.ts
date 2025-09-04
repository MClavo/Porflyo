import slugify from 'slugify';

/**
 * Slug generation utilities that match backend rules
 */

/**
 * Default slugify options to match backend behavior
 */
const DEFAULT_SLUG_OPTIONS = {
  lower: true,           // Convert to lowercase
  strict: true,          // Remove special characters
  trim: true,            // Trim whitespace
  replacement: '-',      // Replace spaces with hyphens
} as const;

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

  // First pass with slugify
  let slug = slugify(text, DEFAULT_SLUG_OPTIONS);

  // Remove any leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Replace multiple consecutive hyphens with single hyphen
  slug = slug.replace(/-{2,}/g, '-');

  // Ensure it only contains valid characters (safety check)
  slug = slug.replace(/[^a-z0-9-]/g, '');

  // Remove leading/trailing hyphens again (in case the regex above created them)
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}

/**
 * Generate a unique slug by appending a number if needed
 * Used when the base slug already exists
 */
export function generateUniqueSlug(
  baseText: string,
  existingSlugs: string[],
  maxAttempts: number = 100
): string {
  const baseSlug = toSlug(baseText);
  
  if (!baseSlug) {
    return '';
  }

  // If base slug is unique, return it
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  // Try appending numbers until we find a unique slug
  for (let i = 2; i <= maxAttempts; i++) {
    const candidateSlug = `${baseSlug}-${i}`;
    if (!existingSlugs.includes(candidateSlug)) {
      return candidateSlug;
    }
  }

  // Fallback: append current timestamp
  return `${baseSlug}-${Date.now()}`;
}

/**
 * Validate if a string is a valid slug
 * Must match backend validation rules
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

/**
 * Sanitize user input to create a valid slug
 * More permissive than toSlug - preserves user intent when possible
 */
export function sanitizeSlugInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Convert to lowercase and replace problematic characters
  let sanitized = input
    .toLowerCase()
    .trim()
    // Replace underscores with hyphens
    .replace(/_/g, '-')
    // Replace multiple spaces/hyphens with single hyphen
    .replace(/[\s-]+/g, '-')
    // Remove any character that's not alphanumeric or hyphen
    .replace(/[^a-z0-9-]/g, '');

  // Remove leading/trailing hyphens
  sanitized = sanitized.replace(/^-+|-+$/g, '');

  return sanitized;
}

/**
 * Generate a slug from a portfolio title
 * Includes special handling for common portfolio naming patterns
 */
export function portfolioTitleToSlug(title: string): string {
  if (!title) {
    return '';
  }

  // Handle common patterns in portfolio titles
  const processedTitle = title
    // Remove common prefixes/suffixes
    .replace(/^(my\s+|the\s+)/i, '')
    .replace(/(\s+portfolio|\s+website|\s+site)$/i, '')
    // Handle version numbers
    .replace(/\s+v?\d+(\.\d+)*$/i, '')
    // Handle "John Doe's Portfolio" -> "john-doe"
    .replace(/['']s\s+portfolio$/i, '');

  return toSlug(processedTitle);
}

/**
 * Generate a slug from a repository name
 * Handles GitHub repository naming conventions
 */
export function repoNameToSlug(repoName: string): string {
  if (!repoName) {
    return '';
  }

  // Convert repository naming conventions to slug format
  const processedName = repoName
    // Convert camelCase and PascalCase to kebab-case
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    // Convert underscores to hyphens
    .replace(/_/g, '-')
    // Handle dots (common in repo names)
    .replace(/\./g, '-');

  return toSlug(processedName);
}

/**
 * Get slug suggestions from a text input
 * Returns multiple options for user to choose from
 */
export function getSlugSuggestions(
  text: string,
  maxSuggestions: number = 3
): string[] {
  if (!text) {
    return [];
  }

  const suggestions: string[] = [];
  
  // Primary suggestion: standard slug
  const primarySlug = toSlug(text);
  if (primarySlug) {
    suggestions.push(primarySlug);
  }

  // Alternative suggestions
  if (suggestions.length < maxSuggestions) {
    // Try without common words
    const withoutCommonWords = text
      .replace(/\b(the|and|or|but|in|on|at|to|for|of|with|by)\b/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    const altSlug = toSlug(withoutCommonWords);
    if (altSlug && !suggestions.includes(altSlug)) {
      suggestions.push(altSlug);
    }
  }

  if (suggestions.length < maxSuggestions) {
    // Try abbreviated version (first letter of each word)
    const abbreviated = text
      .split(/\s+/)
      .map(word => word.charAt(0))
      .join('');
    
    const abbrevSlug = toSlug(abbreviated);
    if (abbrevSlug && abbrevSlug.length >= 2 && !suggestions.includes(abbrevSlug)) {
      suggestions.push(abbrevSlug);
    }
  }

  return suggestions.slice(0, maxSuggestions);
}
