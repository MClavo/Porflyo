/**
 * ModernUrlSection - Modern URL input with status indicators
 */

import React from 'react';
import { FiLink, FiCheck, FiX, FiLoader } from 'react-icons/fi';
import './ModernUrlSection.css';

export interface ModernUrlSectionProps {
  slug: string;
  setSlug: (slug: string) => void;
  currentSlug?: string;
  isSlugAvailable?: boolean;
  isCheckingSlug?: boolean;
  onSlugAvailabilityChange?: (available: boolean) => void;
}

export const ModernUrlSection: React.FC<ModernUrlSectionProps> = ({
  slug,
  setSlug,
  currentSlug,
  isSlugAvailable,
  isCheckingSlug
}) => {
  const getStatusIcon = () => {
    if (isCheckingSlug) {
      return <FiLoader className="modern-url-section__status-icon modern-url-section__status-icon--loading" />;
    }
    
    if (slug && slug !== currentSlug) {
      if (isSlugAvailable) {
        return <FiCheck className="modern-url-section__status-icon modern-url-section__status-icon--success" />;
      } else {
        return <FiX className="modern-url-section__status-icon modern-url-section__status-icon--error" />;
      }
    }
    
    return null;
  };

  /*
  const getStatusText = () => {
    if (isCheckingSlug) {
      return 'Checking availability...';
    }
    
    if (slug && slug !== currentSlug) {
      if (isSlugAvailable) {
        return 'Available';
      } else {
        return 'Already taken';
      }
    }
    
    if (slug === currentSlug) {
      return 'Current URL';
    }
    
    return 'Enter URL';
  };
  */

  const getStatusClass = () => {
    if (isCheckingSlug) return 'modern-url-section--checking';
    if (slug && slug !== currentSlug) {
      return isSlugAvailable ? 'modern-url-section--available' : 'modern-url-section--taken';
    }
    if (slug === currentSlug) return 'modern-url-section--current';
    return '';
  };

  return (
    <div className={`modern-url-section ${getStatusClass()}`}>
      <div className="modern-url-section__container">
        <div className="modern-url-section__prefix">
          <FiLink size={16} />
          <span>porflyo.com/</span>
        </div>
        
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="modern-url-section__input"
          placeholder="your-portfolio"
          spellCheck={false}
        />
        
        <div className="modern-url-section__status">
          {getStatusIcon()}
        </div>
      </div>
      
      {/*
      <div className="modern-url-section__status-text">
        <span className={`modern-url-section__status-label ${getStatusClass()}`}>
          {getStatusText()}
        </span>
      </div>
      */}
    </div>
  );
};

export default ModernUrlSection;