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
  const [lastVerifiedSlug, setLastVerifiedSlug] = useState('');

  // Only check availability if slug is different from current and has at least 3 characters
  const shouldCheckAvailability = Boolean(slug) && slug.length >= 3 && slug !== currentSlug;

  const { data, isLoading } = useDebouncedSlugAvailability(slug, shouldCheckAvailability, 3000);

  useEffect(() => {
    // Only update checking state if we should be checking
    if (shouldCheckAvailability) {
      setIsCheckingSlug(isLoading);
      if (data?.available !== undefined) {
        setIsSlugAvailable(Boolean(data.available));
        setLastVerifiedSlug(slug);
      }
    } else {
      // Reset states when not checking
      setIsCheckingSlug(false);
      // If slug is same as current, consider it available
      if (slug === currentSlug) {
        setIsSlugAvailable(true);
        setLastVerifiedSlug(slug);
      } else {
        // Slug changed but doesn't meet criteria for checking yet
        setIsSlugAvailable(false);
        setLastVerifiedSlug('');
      }
    }
  }, [data, isLoading, shouldCheckAvailability, slug, currentSlug]);

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
    lastVerifiedSlug,
  } as const;
}
