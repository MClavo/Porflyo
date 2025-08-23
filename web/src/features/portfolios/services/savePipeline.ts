/**
 * Portfolio Save Pipeline
 * Coordinates image uploads, portfolio updates, and publishing in the correct order
 */

import { 
  patchPortfolio, 
  publishPortfolio 
} from '../api/portfolios.api';
import {
  identifyNewImages,
  validateImageFiles,
  executeImagePipeline,
  replaceImageReferences,
  type ImagePipelineResult
} from './imagePipeline';
import type { 
  PortfolioPatchDto, 
  PortfolioPublishDto,
  PublicPortfolioDto,
  PortfolioSection
} from '../../../types/dto';
import type { PortfolioSectionData } from '../types/sectionsOLD';

export interface SavePipelineOptions {
  portfolioId: string;
  title?: string;
  description?: string;
  template?: string;
  sections: PortfolioSectionData[];
  shouldPublish?: boolean;
  slug?: string;
  published?: boolean;
  modelVersion?: number;
}

export interface SavePipelineProgress {
  stage: 'validation' | 'images' | 'portfolio' | 'publish' | 'complete';
  message: string;
  imageProgress?: { completed: number; total: number };
  error?: string;
}

export interface SavePipelineResult {
  success: boolean;
  portfolio?: PublicPortfolioDto;
  imageResults?: ImagePipelineResult;
  errors: string[];
  warnings: string[];
}

/**
 * Validate slug for publishing
 */
function validateSlug(slug: string | undefined): {
  isValid: boolean;
  error?: string;
} {
  if (!slug || slug.trim().length === 0) {
    return {
      isValid: false,
      error: 'Slug cannot be empty for published portfolios'
    };
  }

  // Basic slug validation (alphanumeric, hyphens, underscores)
  const slugPattern = /^[a-zA-Z0-9_-]+$/;
  if (!slugPattern.test(slug.trim())) {
    return {
      isValid: false,
      error: 'Slug can only contain letters, numbers, hyphens, and underscores'
    };
  }

  if (slug.trim().length < 3) {
    return {
      isValid: false,
      error: 'Slug must be at least 3 characters long'
    };
  }

  if (slug.trim().length > 50) {
    return {
      isValid: false,
      error: 'Slug cannot exceed 50 characters'
    };
  }

  return { isValid: true };
}

/**
 * Execute the complete save pipeline
 */
export async function executeSavePipeline(
  options: SavePipelineOptions,
  onProgress?: (progress: SavePipelineProgress) => void
): Promise<SavePipelineResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  let imageResults: ImagePipelineResult | undefined;

  try {
    // Stage 1: Validation
    onProgress?.({
      stage: 'validation',
      message: 'Validating portfolio data...'
    });

    // Validate publishing requirements
    if (options.shouldPublish) {
      const slugValidation = validateSlug(options.slug);
      if (!slugValidation.isValid) {
        return {
          success: false,
          errors: [slugValidation.error || 'Invalid slug'],
          warnings
        };
      }
    }

    // Stage 2: Image Processing
    onProgress?.({
      stage: 'images',
      message: 'Processing images...'
    });

    // Identify new images that need uploading
    const uploadJobs = identifyNewImages(options.sections);
    
    if (uploadJobs.length > 0) {
      // Validate image files
      const { valid, invalid } = validateImageFiles(uploadJobs);
      
      // Collect validation errors
      for (const { error } of invalid) {
        errors.push(`Image validation failed: ${error}`);
      }
      
      // If there are validation errors, stop here
      if (invalid.length > 0) {
        return {
          success: false,
          errors,
          warnings
        };
      }
      
      // Execute image pipeline
      imageResults = await executeImagePipeline(valid, (completed, total) => {
        onProgress?.({
          stage: 'images',
          message: `Uploading images (${completed}/${total})...`,
          imageProgress: { completed, total }
        });
      });
      
      // Check for upload failures
      if (imageResults.failed.length > 0) {
        const failureMessages = imageResults.failed.map(
          result => `Failed to upload ${result.originalFile.name}: ${result.error}`
        );
        errors.push(...failureMessages);
        
        return {
          success: false,
          errors,
          warnings,
          imageResults
        };
      }
      
      // Add success message
      if (imageResults.successful.length > 0) {
        warnings.push(`Successfully uploaded ${imageResults.successful.length} image(s)`);
      }
    }

    // Stage 3: Update Portfolio
    onProgress?.({
      stage: 'portfolio',
      message: 'Saving portfolio...'
    });

    // Replace image references in sections
    const finalSections = imageResults 
      ? replaceImageReferences(options.sections, imageResults.newImageKeys)
      : options.sections;

    // Prepare portfolio patch
    const patchData: PortfolioPatchDto = {
      ...(options.title !== undefined && { title: options.title }),
      ...(options.description !== undefined && { description: options.description }),
      ...(options.template !== undefined && { template: options.template }),
      sections: finalSections as unknown as PortfolioSection[], // Convert to DTO format
      ...(options.modelVersion !== undefined && { modelVersion: options.modelVersion })
    };

    // Update portfolio
    let portfolio = await patchPortfolio(options.portfolioId, patchData);

    // Stage 4: Publishing (if requested)
    if (options.shouldPublish && options.slug && options.published !== undefined) {
      onProgress?.({
        stage: 'publish',
        message: 'Publishing portfolio...'
      });

      const publishData: PortfolioPublishDto = {
        url: options.slug,
        published: options.published
      };

      try {
        portfolio = await publishPortfolio(options.portfolioId, publishData);
        warnings.push(
          options.published 
            ? `Portfolio published successfully at: ${options.slug}`
            : 'Portfolio unpublished successfully'
        );
      } catch (error) {
        // If publishing fails, we still consider the save successful
        // but add the publish error as a warning
        const publishError = error instanceof Error ? error.message : 'Publishing failed';
        warnings.push(`Portfolio saved but publishing failed: ${publishError}`);
      }
    }

    // Stage 5: Complete
    onProgress?.({
      stage: 'complete',
      message: 'Save completed successfully!'
    });

    return {
      success: true,
      portfolio,
      imageResults,
      errors,
      warnings
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    errors.push(`Save pipeline failed: ${errorMessage}`);

    return {
      success: false,
      errors,
      warnings,
      imageResults
    };
  }
}

/**
 * Quick save without publishing (draft save)
 */
export async function saveDraft(
  portfolioId: string,
  sections: PortfolioSectionData[],
  options?: {
    title?: string;
    description?: string;
    template?: string;
    modelVersion?: number;
  },
  onProgress?: (progress: SavePipelineProgress) => void
): Promise<SavePipelineResult> {
  return executeSavePipeline({
    portfolioId,
    sections,
    shouldPublish: false,
    ...options
  }, onProgress);
}

/**
 * Save and publish portfolio
 */
export async function saveAndPublish(
  portfolioId: string,
  sections: PortfolioSectionData[],
  slug: string,
  options?: {
    title?: string;
    description?: string;
    template?: string;
    modelVersion?: number;
  },
  onProgress?: (progress: SavePipelineProgress) => void
): Promise<SavePipelineResult> {
  return executeSavePipeline({
    portfolioId,
    sections,
    shouldPublish: true,
    slug,
    published: true,
    ...options
  }, onProgress);
}
