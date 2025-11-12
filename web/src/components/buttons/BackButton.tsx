/**
 * BackButton - Modern back/cancel button component
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeftLong } from 'react-icons/fa6';
import './BackButton.css';

export interface BackButtonProps {
  to?: string;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export const BackButton: React.FC<BackButtonProps> = ({
  to = '/home',
  onClick,
  className = '',
  children = 'Back'
}) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(to);
    }
  };

  return (
    <button
      type="button"
      className={`back-button ${className}`}
      onClick={handleClick}
      aria-label="Go back"
    >
    <FaArrowLeftLong />
      <span className="back-button__text">{children}</span>
    </button>
  );
};

export default BackButton;
