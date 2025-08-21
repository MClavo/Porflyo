/**
 * Portfolio Save Hook
 * Custom hook for managing portfolio save operations
 */

import { useState } from 'react';
import { executeSavePipeline, type SavePipelineProgress, type SavePipelineResult } from '../services/savePipeline';
import type { PortfolioSectionData } from '../types/sections';

/**
 * Portfolio Save Action Hook
 */
export function usePortfolioSave() {
  const [isSaving, setIsSaving] = useState(false);
  const [progress, setProgress] = useState<SavePipelineProgress | null>(null);
  const [lastResult, setLastResult] = useState<SavePipelineResult | null>(null);

  const save = async (options: {
    portfolioId: string;
    sections: PortfolioSectionData[];
    title?: string;
    description?: string;
    template?: string;
    modelVersion?: number;
    shouldPublish?: boolean;
    slug?: string;
    published?: boolean;
  }) => {
    setIsSaving(true);
    setProgress({ stage: 'validation', message: 'Starting save...' });
    
    try {
      const result = await executeSavePipeline(
        {
          portfolioId: options.portfolioId,
          sections: options.sections,
          title: options.title,
          description: options.description,
          template: options.template,
          modelVersion: options.modelVersion,
          shouldPublish: options.shouldPublish,
          slug: options.slug,
          published: options.published,
        },
        setProgress
      );
      
      setLastResult(result);
      return result;
      
    } catch (error) {
      const errorResult: SavePipelineResult = {
        success: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: []
      };
      setLastResult(errorResult);
      return errorResult;
    } finally {
      setIsSaving(false);
    }
  };

  const saveDraft = async (
    portfolioId: string,
    sections: PortfolioSectionData[],
    options?: {
      title?: string;
      description?: string;
      template?: string;
      modelVersion?: number;
    }
  ) => {
    return save({
      portfolioId,
      sections,
      shouldPublish: false,
      ...options
    });
  };

  const saveAndPublish = async (
    portfolioId: string,
    sections: PortfolioSectionData[],
    slug: string,
    options?: {
      title?: string;
      description?: string;
      template?: string;
      modelVersion?: number;
    }
  ) => {
    return save({
      portfolioId,
      sections,
      shouldPublish: true,
      slug,
      published: true,
      ...options
    });
  };

  return {
    save,
    saveDraft,
    saveAndPublish,
    isSaving,
    progress,
    lastResult,
    clearResult: () => setLastResult(null),
    clearProgress: () => setProgress(null)
  };
}
