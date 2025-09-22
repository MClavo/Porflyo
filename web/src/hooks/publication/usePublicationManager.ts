import { useState, useEffect, useCallback } from 'react';
import { usePublishPortfolio } from '../../api/hooks/usePortfolios';
import type { PublicPortfolioDto, PortfolioPublishDto } from '../../api/types/dto';

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

  useEffect(() => {
    if (existingPortfolio) {
      setIsPublished(existingPortfolio.isPublished || false);
      setNormalizedSlugForPublish(existingPortfolio.reservedSlug || '');
    } else {
      setIsPublished(false);
      setNormalizedSlugForPublish('');
    }
  }, [existingPortfolio]);

  const handlePublish = useCallback(async (slug: string) => {
    if (!portfolioId) throw new Error('No portfolio id');

    const publishDto: PortfolioPublishDto = {
      url: normalizedSlugForPublish || slug,
      published: isPublished,
    };

    const updated = await publishMutation.mutate({ id: portfolioId, body: publishDto });
    // update local state from API result
    setIsPublished(updated.isPublished || false);
    setNormalizedSlugForPublish(updated.reservedSlug || '');
    onSuccess?.(updated);
    return updated;
  }, [portfolioId, normalizedSlugForPublish, isPublished, publishMutation, onSuccess]);

  return {
    isPublished,
    setIsPublished,
    handlePublish,
    isPublishing: publishMutation.loading,
    updateNormalizedSlug: setNormalizedSlugForPublish,
  } as const;
}
