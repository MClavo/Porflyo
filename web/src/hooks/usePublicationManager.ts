import { useState, useCallback, useEffect } from 'react';
import { usePublishPortfolio } from '../api/hooks/usePortfolios';
import type { PublicPortfolioDto } from '../api/types/dto';

interface UsePublicationManagerProps {
  portfolioId?: string;
  existingPortfolio?: PublicPortfolioDto | null;
  onSuccess?: (portfolio: PublicPortfolioDto) => void;
}

export function usePublicationManager({ 
  portfolioId, 
  existingPortfolio,
  onSuccess 
}: UsePublicationManagerProps) {
  const [isPublished, setIsPublished] = useState(false);
  const [normalizedSlugForPublish, setNormalizedSlugForPublish] = useState('');
  
  const publishMutation = usePublishPortfolio();

  // Initialize publication state when existingPortfolio changes
  useEffect(() => {
    if (existingPortfolio) {
      console.log('Initializing publication state from portfolio:', {
        id: existingPortfolio.id,
        isPublished: existingPortfolio.isPublished,
        reservedSlug: existingPortfolio.reservedSlug
      });
      setIsPublished(existingPortfolio.isPublished || false);
      setNormalizedSlugForPublish(existingPortfolio.reservedSlug || '');
    } else {
      console.log('Resetting publication state for new portfolio');
      // Reset for new portfolio
      setIsPublished(false);
      setNormalizedSlugForPublish('');
    }
  }, [existingPortfolio]);

  // Initialize publication state when portfolio changes
  const initializeFromPortfolio = useCallback((portfolio: PublicPortfolioDto) => {
    setIsPublished(portfolio.isPublished || false);
    setNormalizedSlugForPublish(portfolio.reservedSlug || '');
  }, []);

  // Handle publication settings update
  const handlePublish = useCallback(async (slug: string) => {
    if (!portfolioId) return;
    
    // Use the normalized slug from backend for publication
    const publishDto = {
      url: normalizedSlugForPublish || slug,
      published: isPublished
    };
    
    try {
      const updatedPortfolio = await publishMutation.mutate({ 
        id: portfolioId, 
        body: publishDto 
      });
      
      // Update local states from response
      setIsPublished(updatedPortfolio.isPublished || false);
      setNormalizedSlugForPublish(updatedPortfolio.reservedSlug || '');
      
      // Call success callback with updated portfolio
      onSuccess?.(updatedPortfolio);
      
      return updatedPortfolio;
    } catch (error) {
      console.error('Failed to update publication settings:', error);
      throw error;
    }
  }, [portfolioId, normalizedSlugForPublish, isPublished, publishMutation, onSuccess]);

  // Update slug for publication when it's normalized by backend
  const updateNormalizedSlug = useCallback((slug: string) => {
    setNormalizedSlugForPublish(slug);
  }, []);

  return {
    isPublished,
    setIsPublished,
    normalizedSlugForPublish,
    updateNormalizedSlug,
    handlePublish,
    isPublishing: publishMutation.loading,
    initializeFromPortfolio
  };
}