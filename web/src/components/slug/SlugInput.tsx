import { useEffect } from 'react';
import { useDebouncedSlugAvailability } from '../../hooks/publication/useSlugAvailability';
import { sanitizeSlugInput } from '../../lib/slug/toSlug';
import './SlugInput.css';

interface SlugInputProps {
  value: string;
  onChange: (value: string) => void;
  currentSlug?: string; // The current slug for this portfolio (if editing)
  placeholder?: string;
  disabled?: boolean;
  onAvailabilityChange?: (isAvailable: boolean, isChecking: boolean) => void; // Callback for availability status
}

export function SlugInput({ 
  value, 
  onChange, 
  currentSlug, 
  placeholder = "my-portfolio-url",
  disabled = false,
  onAvailabilityChange
}: SlugInputProps) {
  // Slug availability (debounced with 3 second delay)
  const slugQuery = useDebouncedSlugAvailability(value, true, 3000);
  const isCheckingSlug = slugQuery.isLoading;
  const availabilityData = slugQuery.data;

  // Handler for slug changes with sanitization
  const handleSlugChange = (newSlug: string) => {
    // Limit to 50 characters and sanitize in real-time
    const limitedSlug = newSlug.slice(0, 50);
    const sanitizedSlug = sanitizeSlugInput(limitedSlug);
    onChange(sanitizedSlug);
  };

  // Helper functions for slug status
  const getSlugStatus = () => {
    if (!value) return null;
    if (isCheckingSlug) return 'Checking...';
    if (value === currentSlug) return 'Current URL';
    
    // Only show availability status if we have data for the current slug
    if (availabilityData && availabilityData.slug === value) {
      if (availabilityData.available === true) return 'Available';
      if (availabilityData.available === false) return 'Not available';
    }
    
    return null;
  };

  const slugStatus = getSlugStatus();

  // Notify parent component about availability changes
  useEffect(() => {
    if (onAvailabilityChange) {
      const isAvailable = value === currentSlug || 
        (availabilityData && availabilityData.slug === value && availabilityData.available === true);
      onAvailabilityChange(Boolean(isAvailable), Boolean(isCheckingSlug));
    }
  }, [value, currentSlug, availabilityData, isCheckingSlug, onAvailabilityChange]);

  return (
    <div className="slug-input-container">
      <label htmlFor="portfolio-slug" className="slug-label">
        Portfolio URL:
      </label>
      <div className="url-input-wrapper">
        <span className="url-prefix">portfolio.com/p/</span>
        <input
          id="portfolio-slug"
          type="text"
          value={value}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`slug-input ${slugStatus === 'Not available' ? 'error' : ''}`}
        />
      </div>
      {slugStatus && (
        <div className={`slug-status ${
          slugStatus === 'Available' ? 'available' : 
          slugStatus === 'Not available' ? 'unavailable' : 
          'checking'
        }`}>
          {slugStatus}
        </div>
      )}
    </div>
  );
}