/**
 * UrlSection - Modern URL input with status indicators
 */

import React from 'react';
import { FiLink, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import { sanitizeSlugInput } from '../../lib/slug/toSlug';
import './UrlSection.css';

export interface UrlSectionProps {
  slug: string;
  setSlug: (slug: string) => void;
  currentSlug?: string;
  isSlugAvailable?: boolean;
  isCheckingSlug?: boolean;
  onSlugAvailabilityChange?: (available: boolean) => void;
}

export const UrlSection: React.FC<UrlSectionProps> = ({
  slug,
  setSlug,
  currentSlug,
  isSlugAvailable,
  isCheckingSlug
}) => {
  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitized = sanitizeSlugInput(rawValue);
    setSlug(sanitized);
  };

  const getStatusIcon = () => {
    if (isCheckingSlug) {
      return <FiLoader className="url-section__status-icon url-section__status-icon--loading" />;
    }
    
    if (slug && slug !== currentSlug) {
      if (isSlugAvailable) {
        return <FiCheck className="url-section__status-icon url-section__status-icon--success" />;
      } else {
        return <FiX className="url-section__status-icon url-section__status-icon--error" />;
      }
    }
    
    return null;
  };

  const getStatusClass = () => {
    if (isCheckingSlug) return 'url-section--checking';
    if (slug && slug !== currentSlug) {
      return isSlugAvailable ? 'url-section--available' : 'url-section--taken';
    }
    if (slug === currentSlug) return 'url-section--current';
    return '';
  };

  return (
    <div className={`url-section ${getStatusClass()}`}>
      <div className="url-section__container">
        <div className="url-section__prefix">
          <FiLink size={16} />
          <span>porflyo.com/p/</span>
        </div>
        
        <input
          type="text"
          value={slug}
          onChange={handleSlugChange}
          className="url-section__input"
          placeholder="your-portfolio"
          spellCheck={false}
        />
        
        <div className="url-section__status">
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
};

export default UrlSection;