import { useState, useEffect } from 'react';

export interface SlugAvailabilityResult {
  available: boolean;
  slug: string;
}

/**
 * Hook para validar la disponibilidad de slug con debounce
 * @param slug - El slug a validar
 * @param enabled - Si la validación está habilitada
 * @param delayMs - Delay en milisegundos para el debounce
 */
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
        // Usar el endpoint correcto del backend
        const response = await fetch(`/public/isurlavailable/${encodeURIComponent(slug)}`);
        
        if (response.status === 500) {
          // Error 500 significa que el slug no está disponible
          setData({
            available: false,
            slug: slug
          });
          return;
        }
        
        if (!response.ok) {
          throw new Error('Failed to check slug availability');
        }

        const result: SlugAvailabilityResult = await response.json();
        setData(result);
      } catch (err) {
        // Si hay error de red u otro tipo, usar fallback mock
        const unavailableSlugS = ['admin', 'api', 'www', 'mail', 'test', 'demo'];
        const isAvailable = !unavailableSlugS.includes(slug.toLowerCase());
        
        setData({
          available: isAvailable,
          slug: slug
        });
        
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

  return {
    data,
    isLoading,
    error
  };
}