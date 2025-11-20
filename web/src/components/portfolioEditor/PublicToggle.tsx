/**
 * PublicToggle - Toggle button for public/private portfolio
 */

import React from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import './PublicToggle.css';

export interface PublicToggleProps {
  isPublished: boolean;
  setIsPublished: (published: boolean) => void;
}

export const PublicToggle: React.FC<PublicToggleProps> = ({
  isPublished,
  setIsPublished
}) => {
  return (
    <div className="public-toggle">
      <button
        className={`public-toggle__button ${
          isPublished ? 'public-toggle__button--public' : 'public-toggle__button--private'
        }`}
        onClick={() => setIsPublished(!isPublished)}
        aria-label={isPublished ? 'Make portfolio private' : 'Make portfolio public'}
        title={isPublished ? 'Portfolio is public - Visible to everyone' : 'Portfolio is private - Only visible to you'}
      >
        <div className="public-toggle__icon">
          {isPublished ? <FiEye size={16} /> : <FiEyeOff size={16} />}
        </div>
        
        <span className="public-toggle__status">
          {isPublished ? 'Public' : 'Private'}
        </span>
      </button>
    </div>
  );
};

export default PublicToggle;