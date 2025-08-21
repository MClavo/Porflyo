/**
 * Image processing pipeline for portfolio save workflow
 * Handles validation, compression, and upload of images across portfolio sections
 */

import { compressImage, validateImageFile } from '../../../lib/images/compression';
import { requestPresignedPost, uploadToS3, calculateMD5 } from '../../../services/mediaService';
import type { PresignRequestDto } from '../../../types/dto';
import type { PortfolioSectionData } from '../types/sections';

export interface ImageUploadJob {
  file: File;
  key: string;
  sectionId?: string;
  fieldName?: string;
}

export interface ImageUploadResult {
  originalFile: File;
  compressedFile: File;
  key: string;
  uploadedSuccessfully: boolean;
  error?: string;
}

export interface ImagePipelineResult {
  successful: ImageUploadResult[];
  failed: ImageUploadResult[];
  newImageKeys: Record<string, string>; // originalKey -> newKey mapping
}

/**
 * Extract all image references from portfolio sections
 */
export function extractImageReferences(sections: PortfolioSectionData[]): string[] {
  const imageKeys: string[] = [];
  
  for (const section of sections) {
    switch (section.kind) {
      case 'TEXT_WITH_IMAGE_LEFT':
      case 'TEXT_WITH_IMAGE_RIGHT':
        if (section.image) {
          imageKeys.push(section.image);
        }
        break;
      case 'GALLERY_LARGE':
      case 'GALLERY_SMALL':
      case 'GALLERY_GRID':
        imageKeys.push(...section.images);
        break;
      case 'ABOUT':
        if (section.avatar) {
          imageKeys.push(section.avatar);
        }
        break;
    }
  }
  
  return imageKeys;
}

/**
 * Identify new/changed images by checking for File objects or blob URLs
 * Note: This assumes that the sections may contain File objects or blob URLs temporarily
 * during editing before being converted to final image keys
 */
export function identifyNewImages(sections: PortfolioSectionData[]): ImageUploadJob[] {
  const uploadJobs: ImageUploadJob[] = [];
  
  for (const section of sections) {
    switch (section.kind) {
      case 'TEXT_WITH_IMAGE_LEFT':
      case 'TEXT_WITH_IMAGE_RIGHT':
        // Check if image is a File object or blob URL (needs uploading)
        if (section.image) {
          const imageValue = section.image as unknown;
          if (imageValue instanceof File) {
            uploadJobs.push({
              file: imageValue,
              key: generateImageKey(imageValue.name),
              sectionId: section.id,
              fieldName: 'image'
            });
          } else if (typeof imageValue === 'string' && imageValue.startsWith('blob:')) {
            // Handle blob URLs - this would need additional conversion logic
            console.warn('Blob URL detected but File object expected:', imageValue);
          }
        }
        break;
      case 'GALLERY_LARGE':
      case 'GALLERY_SMALL':
      case 'GALLERY_GRID':
        section.images.forEach((image, index) => {
          if (image) {
            const imageValue = image as unknown;
            if (imageValue instanceof File) {
              uploadJobs.push({
                file: imageValue,
                key: generateImageKey(imageValue.name),
                sectionId: section.id,
                fieldName: `images[${index}]`
              });
            } else if (typeof imageValue === 'string' && imageValue.startsWith('blob:')) {
              console.warn('Blob URL detected but File object expected:', imageValue);
            }
          }
        });
        break;
      case 'ABOUT':
        if (section.avatar) {
          const avatarValue = section.avatar as unknown;
          if (avatarValue instanceof File) {
            uploadJobs.push({
              file: avatarValue,
              key: generateImageKey(avatarValue.name),
              sectionId: section.id,
              fieldName: 'avatar'
            });
          } else if (typeof avatarValue === 'string' && avatarValue.startsWith('blob:')) {
            console.warn('Blob URL detected but File object expected:', avatarValue);
          }
        }
        break;
    }
  }
  
  return uploadJobs;
}

/**
 * Generate unique image key for S3 storage
 */
function generateImageKey(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalFilename.split('.').pop()?.toLowerCase() || 'webp';
  return `portfolio-images/${timestamp}-${random}.${extension}`;
}

/**
 * Validate all image files before processing
 */
export function validateImageFiles(uploadJobs: ImageUploadJob[]): {
  valid: ImageUploadJob[];
  invalid: { job: ImageUploadJob; error: string }[];
} {
  const valid: ImageUploadJob[] = [];
  const invalid: { job: ImageUploadJob; error: string }[] = [];
  
  for (const job of uploadJobs) {
    // Check file size limit (5MB before compression)
    const maxSizeBeforeCompression = 5 * 1024 * 1024; // 5MB
    if (job.file.size > maxSizeBeforeCompression) {
      invalid.push({
        job,
        error: `File size (${Math.round(job.file.size / 1024 / 1024 * 100) / 100}MB) exceeds 5MB limit`
      });
      continue;
    }
    
    // Validate image type
    const validation = validateImageFile(job.file);
    if (!validation.isValid) {
      invalid.push({
        job,
        error: validation.error || 'Invalid image file'
      });
      continue;
    }
    
    valid.push(job);
  }
  
  return { valid, invalid };
}

/**
 * Process single image: compress and upload
 */
async function processImageUpload(job: ImageUploadJob): Promise<ImageUploadResult> {
  try {
    // Compress to WebP ≤ 1MB
    const compressedFile = await compressImage(job.file, {
      maxSizeMB: 1,
      fileType: 'image/webp',
      quality: 0.8
    });
    
    // Calculate MD5 for integrity
    const md5 = await calculateMD5(compressedFile);
    
    // Request presigned upload URL
    const presignRequest: PresignRequestDto = {
      key: job.key,
      contentType: 'image/webp',
      size: compressedFile.size,
      md5
    };
    
    const presignedPost = await requestPresignedPost(presignRequest);
    
    // Upload to S3
    await uploadToS3(presignedPost, compressedFile);
    
    return {
      originalFile: job.file,
      compressedFile,
      key: job.key,
      uploadedSuccessfully: true
    };
    
  } catch (error) {
    return {
      originalFile: job.file,
      compressedFile: job.file, // Fallback
      key: job.key,
      uploadedSuccessfully: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}

/**
 * Execute complete image pipeline
 */
export async function executeImagePipeline(
  uploadJobs: ImageUploadJob[],
  onProgress?: (completed: number, total: number) => void
): Promise<ImagePipelineResult> {
  const successful: ImageUploadResult[] = [];
  const failed: ImageUploadResult[] = [];
  const newImageKeys: Record<string, string> = {};
  
  // Process uploads sequentially to avoid overwhelming the backend
  for (let i = 0; i < uploadJobs.length; i++) {
    const job = uploadJobs[i];
    
    try {
      const result = await processImageUpload(job);
      
      if (result.uploadedSuccessfully) {
        successful.push(result);
        // Map the key for section reference replacement
        newImageKeys[job.key] = job.key; // Key remains the same after upload
      } else {
        failed.push(result);
      }
      
      // Report progress
      onProgress?.(i + 1, uploadJobs.length);
      
    } catch (error) {
      failed.push({
        originalFile: job.file,
        compressedFile: job.file,
        key: job.key,
        uploadedSuccessfully: false,
        error: error instanceof Error ? error.message : 'Unexpected error'
      });
    }
  }
  
  return { successful, failed, newImageKeys };
}

/**
 * Replace image references in sections with uploaded keys
 */
export function replaceImageReferences(
  sections: PortfolioSectionData[],
  imageKeyMap: Record<string, string>
): PortfolioSectionData[] {
  return sections.map(section => {
    switch (section.kind) {
      case 'TEXT_WITH_IMAGE_LEFT':
      case 'TEXT_WITH_IMAGE_RIGHT':
        return {
          ...section,
          image: imageKeyMap[section.image] || section.image
        };
      case 'GALLERY_LARGE':
      case 'GALLERY_SMALL':
      case 'GALLERY_GRID':
        return {
          ...section,
          images: section.images.map(image => imageKeyMap[image] || image)
        };
      case 'ABOUT':
        return {
          ...section,
          avatar: section.avatar ? (imageKeyMap[section.avatar] || section.avatar) : section.avatar
        };
      default:
        return section;
    }
  });
}
