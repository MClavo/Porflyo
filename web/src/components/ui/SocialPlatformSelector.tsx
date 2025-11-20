import React, { useState, useRef, useEffect } from 'react';
import { FiGlobe, FiChevronDown, FiCheck } from 'react-icons/fi';
import { SOCIAL_PLATFORMS, getSocialPlatform } from '../../constants/socialPlatforms';
import { useTheme } from '../../contexts/theme/useTheme';
import './SocialPlatformSelector.css';

interface SocialPlatformSelectorProps {
  selectedPlatform?: string;
  onSelect: (platform: string) => void;
  excludePlatforms?: string[];
  disabled?: boolean;
}

export const SocialPlatformSelector: React.FC<SocialPlatformSelectorProps> = ({
  selectedPlatform,
  onSelect,
  excludePlatforms = [],
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { isDark } = useTheme();

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    platform => !excludePlatforms.includes(platform.id)
  );

  // Get platform data with color adjusted for theme when applicable
  const selectedPlatformData = selectedPlatform
    ? getSocialPlatform(selectedPlatform, isDark) || SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform)
    : undefined;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (platformId: string) => {
    onSelect(platformId);
    setIsOpen(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  if (availablePlatforms.length === 0) {
    return null;
  }

  return (
    <div className="social-platform-selector" ref={dropdownRef}>
      <button
        type="button"
        className={`selector-trigger ${isOpen ? 'open' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={handleToggle}
        disabled={disabled}
      >
        <div className="trigger-content">
          {selectedPlatformData ? (
            <>
              <span 
                className="platform-icon" 
                style={{ color: selectedPlatformData.color }}
              >
                {selectedPlatformData.icon}
              </span>
              <span className="platform-name">{selectedPlatformData.name}</span>
            </>
          ) : (
            <>
              <span className="platform-icon placeholder">
                <FiGlobe size={16} />
              </span>
              <span className="platform-name placeholder">Select Platform</span>
            </>
          )}
        </div>
        <FiChevronDown size={16} className="chevron-icon" />
      </button>

      {isOpen && (
        <div className="selector-dropdown">
          <div className="dropdown-content">
              {availablePlatforms.map((platform, index) => (
              <React.Fragment key={platform.id}>
                <button
                  type="button"
                  className={`platform-option ${selectedPlatform === platform.id ? 'selected' : ''}`}
                  onClick={() => handleSelect(platform.id)}
                >
                  {(() => {
                    const p = getSocialPlatform(platform.id, isDark) || platform;
                    return (
                      <span 
                        className="platform-icon" 
                        style={{ color: p.color }}
                      >
                        {p.icon}
                      </span>
                    );
                  })()}
                  <span className="platform-name">{platform.name}</span>
                  {selectedPlatform === platform.id && (
                    <span className="selected-indicator">
                      <FiCheck size={14} />
                    </span>
                  )}
                </button>
                {index < availablePlatforms.length - 1 && (
                  <div className="platform-separator" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialPlatformSelector;