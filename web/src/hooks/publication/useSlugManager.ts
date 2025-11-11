import { useState, useEffect } from 'react';
import { toSlug } from '../../lib/slug/toSlug';
import type { PublicPortfolioDto } from '../../api/types/dto';

interface UseSlugManagerProps {
  isEditing: boolean;
  existingPortfolio?: PublicPortfolioDto | null;
}

export function useSlugManager({ isEditing, existingPortfolio }: UseSlugManagerProps) {
  const [slug, setSlug] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [normalizedSlugForPublish, setNormalizedSlugForPublish] = useState('');

  // Initialize slug when editing existing portfolio
  useEffect(() => {
    if (isEditing && existingPortfolio) {
      console.log('Initializing slug from portfolio:', {
        id: existingPortfolio.id,
        reservedSlug: existingPortfolio.reservedSlug
      });
      setSlug(existingPortfolio.reservedSlug || '');
    } else if (!isEditing) {
      console.log('Resetting slug for new portfolio');
      // Clear slug for new portfolio
      setSlug('');
    }
  }, [isEditing, existingPortfolio]);

  // Auto-generate slug from title for new portfolios
  const updateSlugFromTitle = (title: string) => {
    // Only auto-generate slug if it's completely empty (new portfolio)
    if (!slug) {
      setSlug(toSlug(title)); 
    }
  };

  return {
    slug,
    setSlug,
    isPublished,
    setIsPublished,
    normalizedSlugForPublish,
    setNormalizedSlugForPublish,
    updateSlugFromTitle,
    currentSlug: existingPortfolio?.reservedSlug
  };
}
