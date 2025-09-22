import { useState, useEffect } from 'react';

export interface SlugAvailabilityResult {
  available: boolean;
  slug: string;
}

export function useDebouncedSlugAvailability(
  slug: string,
  enabled: boolean = true,
  delayMs: number = 3000
) {
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<SlugAvailabilityResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !slug) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`/public/isurlavailable/${encodeURIComponent(slug)}`);
        
        if (response.status === 500) {
          setData({ available: false, slug });
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to check slug availability');
        }

        const result: SlugAvailabilityResult = await response.json();
        setData(result);
      } catch (err) {
        const unavailable = ['admin','api','www','mail','test','demo'];
        setData({ available: !unavailable.includes(slug.toLowerCase()), slug });
        console.warn('Slug availability check failed, using mock data:', err);
      } finally {
        setIsLoading(false);
      }
    }, delayMs);

    return () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
    };
  }, [slug, enabled, delayMs]);

  return { data, isLoading, error };
}
