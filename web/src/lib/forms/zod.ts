import { z } from 'zod';

/**
 * Common Zod validation schemas and helpers
 */

/**
 * String with maximum length validation
 */
export const stringMax = (max: number, message?: string) =>
  z.string().max(max, message || `Must be ${max} characters or less`);

/**
 * String with minimum length validation
 */
export const stringMin = (min: number, message?: string) =>
  z.string().min(min, message || `Must be at least ${min} characters`);

/**
 * String with length range validation
 */
export const stringLength = (min: number, max: number, message?: string) =>
  z.string()
    .min(min, message || `Must be at least ${min} characters`)
    .max(max, message || `Must be ${max} characters or less`);

/**
 * Required string that cannot be empty
 */
export const requiredString = (message?: string) =>
  z.string().min(1, message || 'This field is required');

/**
 * Email validation
 */
export const email = (message?: string) =>
  z.string().email(message || 'Please enter a valid email address');

/**
 * URL validation
 */
export const url = (message?: string) =>
  z.string().url(message || 'Please enter a valid URL');

/**
 * Slug pattern validation
 * Matches backend rules: lowercase, alphanumeric, hyphens only
 * Must start and end with alphanumeric character
 */
export const slug = (message?: string) =>
  z.string()
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      message || 'Slug must contain only lowercase letters, numbers, and hyphens. Cannot start or end with a hyphen.'
    );

/**
 * GitHub username validation
 */
export const githubUsername = (message?: string) =>
  z.string()
    .regex(
      /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9]))*$/,
      message || 'Invalid GitHub username format'
    )
    .max(39, 'GitHub username cannot exceed 39 characters');

/**
 * Repository name validation (GitHub style)
 */
export const repoName = (message?: string) =>
  z.string()
    .regex(
      /^[a-zA-Z0-9._-]+$/,
      message || 'Repository name can only contain letters, numbers, dots, hyphens, and underscores'
    )
    .max(100, 'Repository name cannot exceed 100 characters');

/**
 * Positive integer validation
 */
export const positiveInt = (message?: string) =>
  z.number().int().positive(message || 'Must be a positive integer');

/**
 * Non-negative integer validation (including 0)
 */
export const nonNegativeInt = (message?: string) =>
  z.number().int().min(0, message || 'Must be zero or positive');

/**
 * File size validation (in bytes)
 */
export const fileSize = (maxBytes: number, message?: string) =>
  z.number().max(
    maxBytes,
    message || `File size must not exceed ${Math.round(maxBytes / 1024 / 1024)}MB`
  );

/**
 * Image file type validation
 */
export const imageFileType = (message?: string) =>
  z.string().regex(
    /^image\/(jpeg|jpg|png|gif|webp)$/,
    message || 'Only JPEG, PNG, GIF, and WebP images are allowed'
  );

/**
 * Date string validation (ISO format)
 */
export const dateString = (message?: string) =>
  z.string().datetime(message || 'Please enter a valid date');

/**
 * Optional string that can be empty
 */
export const optionalString = z.string().optional();

/**
 * Transform empty string to undefined
 */
export const emptyStringToUndefined = z
  .string()
  .optional()
  .transform((val) => (val === '' ? undefined : val));

/**
 * Boolean with string coercion (for form inputs)
 */
export const booleanFromString = z
  .string()
  .transform((val) => val === 'true')
  .pipe(z.boolean());

/**
 * Number with string coercion (for form inputs)
 */
export const numberFromString = z
  .string()
  .transform((val) => (val === '' ? undefined : Number(val)))
  .pipe(z.number().optional());

/**
 * Portfolio template types
 */
export const portfolioTemplate = z.enum(['default', 'ats', 'slots'], {
  message: 'Please select a valid template'
});

/**
 * Portfolio visibility types
 */
export const portfolioVisibility = z.enum(['public', 'private', 'unlisted'], {
  message: 'Please select a valid visibility option'
});

/**
 * Common error messages
 */
export const errorMessages = {
  required: 'This field is required',
  invalidEmail: 'Please enter a valid email address',
  invalidUrl: 'Please enter a valid URL',
  tooShort: (min: number) => `Must be at least ${min} characters`,
  tooLong: (max: number) => `Must be ${max} characters or less`,
  invalidSlug: 'Only lowercase letters, numbers, and hyphens allowed',
  invalidFormat: 'Invalid format',
} as const;
