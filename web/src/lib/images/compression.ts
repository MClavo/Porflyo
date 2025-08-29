import imageCompression from 'browser-image-compression';

/**
 * Image compression utilities for WebP format with 1MB limit
 */

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
  quality?: number;
}

/**
 * Default compression options for WebP format
 */
const DEFAULT_OPTIONS: CompressionOptions = {
  maxSizeMB: 1,             // 1MB limit
  maxWidthOrHeight: 1920,   // Max dimension
  useWebWorker: true,       // Use web worker for better performance
  fileType: 'image/webp',   // Convert to WebP
  quality: 0.8, 
};

/**
 * Compress image to WebP format with size limit
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const compressionOptions = { ...DEFAULT_OPTIONS, ...options };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Verify the compressed file meets our requirements
    if (compressedFile.size > (compressionOptions.maxSizeMB || 1) * 1024 * 1024) {
      throw new Error(
        `Compressed file size (${Math.round(compressedFile.size / 1024 / 1024 * 100) / 100}MB) exceeds limit of ${compressionOptions.maxSizeMB}MB`
      );
    }

    return compressedFile;
  } catch (error) {
    throw new Error(
      `Image compression failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Compress image for avatar/profile picture (smaller size)
 */
export async function compressAvatarImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.5, // 500KB limit for avatars
    maxWidthOrHeight: 512, // 512x512 max for avatars
    quality: 0.85, // Higher quality for profile pictures
  });
}

/**
 * Compress image for portfolio thumbnails
 */
export async function compressThumbnailImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 0.3,         // 300KB limit for thumbnails
    maxWidthOrHeight: 400,  // 400px max for thumbnails
    quality: 0.75,          // Lower quality acceptable for thumbnails
  });
}

/**
 * Compress image for portfolio hero/banner images
 */
export async function compressBannerImage(file: File): Promise<File> {
  return compressImage(file, {
    maxSizeMB: 1,            // 1MB limit for banners
    maxWidthOrHeight: 1920,  // Full HD width
    quality: 0.8,            // Good quality for banners
  });
}

/**
 * Check if file is a valid image type
 */
export function isValidImageFile(file: File): boolean {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
}

/**
 * Get file size in human readable format
 */
export function getFileSizeString(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validate image file before compression
 */
export function validateImageFile(file: File): {
  isValid: boolean;
  error?: string;
} {
  // Check if it's an image
  if (!isValidImageFile(file)) {
    return {
      isValid: false,
      error: 'Please select a valid image file (JPEG, PNG, GIF, or WebP)',
    };
  }

  // Check file size (max 10MB before compression)
  const maxSizeBeforeCompression = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSizeBeforeCompression) {
    return {
      isValid: false,
      error: `Image file is too large (${getFileSizeString(file.size)}). Please select an image smaller than 10MB.`,
    };
  }

  return { isValid: true };
}

/**
 * Create a preview URL for an image file
 */
export function createImagePreview(file: File): string {
  return URL.createObjectURL(file);
}

/**
 * Cleanup preview URL to prevent memory leaks
 */
export function cleanupImagePreview(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Convert image file to data URL for inline display
 */
export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
