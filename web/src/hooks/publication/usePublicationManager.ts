import { useState, useEffect, useCallback, useMemo } from 'react';
import { usePublishPortfolio } from '../../api/hooks/usePortfolios';
import type { PublicPortfolioDto, PortfolioPublishDto } from '../../api/types/dto';

interface UsePublicationManagerProps {
  portfolioId?: string;
  existingPortfolio?: PublicPortfolioDto | null;
  currentSlug?: string; // Current slug being edited by user
  onSuccess?: (portfolio: PublicPortfolioDto) => void;
  updatePortfolioInCache?: (portfolio: PublicPortfolioDto) => void;
}

export function usePublicationManager({ 
  portfolioId, 
  existingPortfolio,
  currentSlug,
  onSuccess,
  updatePortfolioInCache
}: UsePublicationManagerProps) {
  const [isPublished, setIsPublished] = useState(false);
  const [normalizedSlugForPublish, setNormalizedSlugForPublish] = useState('');
  
  const publishMutation = usePublishPortfolio();

  // Store initial values from existing portfolio
  const [initialIsPublished, setInitialIsPublished] = useState(false);
  const [initialSlug, setInitialSlug] = useState('');

  useEffect(() => {
    if (existingPortfolio) {
      const published = existingPortfolio.isPublished || false;
      const slug = existingPortfolio.reservedSlug || '';
      
      setIsPublished(published);
      setNormalizedSlugForPublish(slug);
      setInitialIsPublished(published);
      setInitialSlug(slug);
    } else {
      setIsPublished(false);
      setNormalizedSlugForPublish('');
      setInitialIsPublished(false);
      setInitialSlug('');
    }
  }, [existingPortfolio]);

  // Check if there are changes to publish
  const hasChanges = useMemo(() => {
    // Compare current slug (what user is typing) with initial slug
    const slugChanged = currentSlug !== initialSlug;
    const publishedChanged = isPublished !== initialIsPublished;
    return slugChanged || publishedChanged;
  }, [currentSlug, initialSlug, isPublished, initialIsPublished]);

  const handlePublish = useCallback(async (slug: string) => {
    if (!portfolioId) throw new Error('No portfolio id');

    const publishDto: PortfolioPublishDto = {
      url: slug || normalizedSlugForPublish,
      published: isPublished,
    };

    const updated = await publishMutation.mutate({ id: portfolioId, body: publishDto });
    
    // Update local state from API result
    setIsPublished(updated.isPublished || false);
    setNormalizedSlugForPublish(updated.reservedSlug || '');
    
    // Update initial values to reflect the new state
    setInitialIsPublished(updated.isPublished || false);
    setInitialSlug(updated.reservedSlug || '');
    
    // Update cache if function provided
    if (updatePortfolioInCache) {
      updatePortfolioInCache(updated);
    }
    
    onSuccess?.(updated);
    return updated;
  }, [portfolioId, normalizedSlugForPublish, isPublished, publishMutation, onSuccess, updatePortfolioInCache]);

  return {
    isPublished,
    setIsPublished,
    handlePublish,
    isPublishing: publishMutation.loading,
    updateNormalizedSlug: setNormalizedSlugForPublish,
    hasChanges,
  } as const;
}
