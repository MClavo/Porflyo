/**
 * ModernPublicToggle - Toggle button for public/private portfolio
 */

import React from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './ModernPublicToggle.css';

export interface ModernPublicToggleProps {
  isPublished: boolean;
  setIsPublished: (published: boolean) => void;
}

export const ModernPublicToggle: React.FC<ModernPublicToggleProps> = ({
  isPublished,
  setIsPublished
}) => {
  return (
    <div className="modern-public-toggle">
      <button
        className={`modern-public-toggle__button ${
          isPublished ? 'modern-public-toggle__button--public' : 'modern-public-toggle__button--private'
        }`}
        onClick={() => setIsPublished(!isPublished)}
        aria-label={isPublished ? 'Make portfolio private' : 'Make portfolio public'}
        title={isPublished ? 'Portfolio is public - Visible to everyone' : 'Portfolio is private - Only visible to you'}
      >
        <div className="modern-public-toggle__icon">
          {isPublished ? <FiEye size={16} /> : <FiEyeOff size={16} />}
        </div>
        
        <span className="modern-public-toggle__status">
          {isPublished ? 'Public' : 'Private'}
        </span>
      </button>
    </div>
  );
};

export default ModernPublicToggle;