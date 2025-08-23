import { useState, useEffect, useMemo } from 'react';
import { useController, type Control } from 'react-hook-form';
import { toSlug } from '../../../lib/slug/toSlug';
import { isSlugAvailable } from '../api/public.api';
import type { PortfolioFormData } from '../schemas/sections.schema';

// Debounce utility
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface SlugFieldProps {
  control: Control<PortfolioFormData>;
  isEdit?: boolean;
  currentSlug?: string;
  onValidityChange?: (isValid: boolean, isAvailable: boolean) => void;
}

type AvailabilityState = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export function SlugField({ control, isEdit = false, currentSlug, onValidityChange }: SlugFieldProps) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error }
  } = useController({
    name: 'slug',
    control,
    rules: {
      required: false, // Allow empty for drafts
      validate: (value: string) => {
        if (!value || value.trim() === '') {
          return true; // Empty is valid (draft mode)
        }
        
        const trimmed = value.trim();
        const slugPattern = /^[a-z0-9-]+$/;
        
        if (trimmed.length < 3) {
          return 'Slug must be at least 3 characters long';
        }
        if (trimmed.length > 50) {
          return 'Slug must be 50 characters or less';
        }
        if (!slugPattern.test(trimmed)) {
          return 'Slug can only contain lowercase letters, numbers, and hyphens';
        }
        if (trimmed.startsWith('-') || trimmed.endsWith('-')) {
          return 'Slug cannot start or end with a hyphen';
        }
        if (trimmed.includes('--')) {
          return 'Slug cannot contain consecutive hyphens';
        }
        
        return true;
      }
    }
  });

  const [availabilityState, setAvailabilityState] = useState<AvailabilityState>('idle');
  const [rawInput, setRawInput] = useState(value || '');
  
  // Debounce the slug value for availability checking
  const debouncedSlug = useDebounce(value, 500);

  // Generate slug preview from raw input
  const slugPreview = useMemo(() => {
    if (!rawInput.trim()) return '';
    return toSlug(rawInput);
  }, [rawInput]);

  // Check if the current value is valid
  const isValidSlug = useMemo(() => {
    if (!value || value.trim() === '') return true; // Empty is valid
    return !error;
  }, [value, error]);

  // Check availability when debounced slug changes
  useEffect(() => {
    const checkAvailability = async () => {
      if (!debouncedSlug || debouncedSlug.trim() === '') {
        setAvailabilityState('idle');
        return;
      }

      const trimmedSlug = debouncedSlug.trim();
      
      // Don't check availability if it's invalid
      if (!isValidSlug) {
        setAvailabilityState('idle');
        return;
      }

      // Don't check if it's the current slug (for edits)
      if (isEdit && trimmedSlug === currentSlug) {
        setAvailabilityState('available');
        return;
      }

      setAvailabilityState('checking');
      
      try {
        const available = await isSlugAvailable(trimmedSlug);
        setAvailabilityState(available ? 'available' : 'taken');
      } catch (error) {
        console.error('Error checking slug availability:', error);
        setAvailabilityState('error');
      }
    };

    checkAvailability();
  }, [debouncedSlug, isValidSlug, isEdit, currentSlug]);

  // Notify parent about validity changes
  useEffect(() => {
    const isEmpty = !value || value.trim() === '';
    const isAvailable = availabilityState === 'available' || (isEmpty && availabilityState === 'idle');
    const isValid = isValidSlug && (isEmpty || isAvailable);
    
    onValidityChange?.(isValid, isAvailable);
  }, [value, isValidSlug, availabilityState, onValidityChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setRawInput(input);
    
    // Generate slug and update form
    const generatedSlug = toSlug(input);
    onChange(generatedSlug);
  };

  const handleInputBlur = () => {
    onBlur();
    // Sync raw input with final slug value
    setRawInput(value || '');
  };

  const getAvailabilityIcon = () => {
    switch (availabilityState) {
      case 'checking':
        return <span className="slug-status slug-status-checking">⟳</span>;
      case 'available':
        return <span className="slug-status slug-status-available">✓</span>;
      case 'taken':
        return <span className="slug-status slug-status-taken">✕</span>;
      case 'error':
        return <span className="slug-status slug-status-error">!</span>;
      default:
        return null;
    }
  };

  const getAvailabilityMessage = () => {
    if (!value || value.trim() === '') {
      return <p className="slug-hint">Leave empty to save as draft</p>;
    }

    switch (availabilityState) {
      case 'checking':
        return <p className="slug-message slug-checking">Checking availability...</p>;
      case 'available':
        return <p className="slug-message slug-available">Available</p>;
      case 'taken':
        return <p className="slug-message slug-taken">This slug is already taken</p>;
      case 'error':
        return <p className="slug-message slug-error">Couldn't verify availability</p>;
      default:
        return null;
    }
  };

  return (
    <div className="form-group">
      <label htmlFor="portfolio-slug" className="form-label">
        URL Slug
      </label>
      <div className="slug-input-container">
        <input
          type="text"
          id="portfolio-slug"
          value={rawInput}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          className={`form-input ${error ? 'error' : ''} ${
            availabilityState === 'taken' ? 'error' : ''
          }`}
          placeholder="my-portfolio"
          maxLength={50}
        />
        {getAvailabilityIcon()}
      </div>
      
      {/* Slug preview */}
      {rawInput && slugPreview && rawInput !== slugPreview && (
        <p className="slug-preview">Preview: {slugPreview}</p>
      )}
      
      {/* Error message */}
      {error && (
        <p className="error-message">{error.message}</p>
      )}
      
      {/* Availability message */}
      {!error && getAvailabilityMessage()}
    </div>
  );
}
