import { useEffect, useState, useCallback } from 'react';
import { useDebouncedSlugAvailability } from './useSlugAvailability';
import { useSlugManager } from './useSlugManager';
import type { PublicPortfolioDto } from '../../api/types/dto';

interface UseSlugProps {
  isEditing: boolean;
  existingPortfolio?: PublicPortfolioDto | null;
}

export function useSlug({ isEditing, existingPortfolio }: UseSlugProps) {
  const { slug, setSlug, updateSlugFromTitle, normalizedSlugForPublish, setNormalizedSlugForPublish, currentSlug } = useSlugManager({ isEditing, existingPortfolio });

  const [isSlugAvailable, setIsSlugAvailable] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  const { data, isLoading } = useDebouncedSlugAvailability(slug, Boolean(slug), 3000);

  useEffect(() => {
    setIsCheckingSlug(isLoading);
    setIsSlugAvailable(Boolean(data?.available));
  }, [data, isLoading]);

  const handleSlugAvailabilityChange = useCallback((isAvailable: boolean, checking: boolean) => {
    setIsSlugAvailable(isAvailable);
    setIsCheckingSlug(checking);
  }, []);

  return {
    slug,
    setSlug,
    updateSlugFromTitle,
    currentSlug,
    normalizedSlugForPublish,
    setNormalizedSlugForPublish,
    isSlugAvailable,
    isCheckingSlug,
    handleSlugAvailabilityChange,
  } as const;
}
