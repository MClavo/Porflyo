import React, { useState, useRef, useEffect } from 'react';
import { 
  FiLinkedin, 
  FiGithub, 
  FiInstagram, 
  FiFacebook, 
  FiYoutube, 
  FiTwitch,
  FiGlobe,
  FiEdit,
  FiChevronDown,
  FiCheck
} from 'react-icons/fi';
import { 
  SiX, 
  SiLeetcode, 
  SiKaggle, 
  SiTiktok, 
  SiDiscord, 
  SiMedium 
} from 'react-icons/si';
import './SocialPlatformSelector.css';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

interface SocialPlatformSelectorProps {
  selectedPlatform?: string;
  onSelect: (platform: string) => void;
  excludePlatforms?: string[];
  disabled?: boolean;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  { id: 'blog', name: 'Blog', icon: <FiEdit size={16} />, color: '#6366f1' },
  { id: 'discord', name: 'Discord', icon: <SiDiscord size={16} />, color: '#5865f2' },
  { id: 'facebook', name: 'Facebook', icon: <FiFacebook size={16} />, color: '#1877f2' },
  { id: 'github', name: 'GitHub', icon: <FiGithub size={16} />, color: 'var(--text-primary)' },
  { id: 'instagram', name: 'Instagram', icon: <FiInstagram size={16} />, color: '#e4405f' },
  { id: 'kaggle', name: 'Kaggle', icon: <SiKaggle size={16} />, color: '#20beff' },
  { id: 'leetcode', name: 'LeetCode', icon: <SiLeetcode size={16} />, color: '#ffa116' },
  { id: 'linkedin', name: 'LinkedIn', icon: <FiLinkedin size={16} />, color: '#0077b5' },
  { id: 'medium', name: 'Medium', icon: <SiMedium size={16} />, color: '#00ab6c' },
  { id: 'tiktok', name: 'TikTok', icon: <SiTiktok size={16} />, color: 'var(--text-primary)' },
  { id: 'twitch', name: 'Twitch', icon: <FiTwitch size={16} />, color: '#9146ff' },
  { id: 'twitter', name: 'X (Twitter)', icon: <SiX size={16} />, color: '#1da1f2' },
  { id: 'website', name: 'Website', icon: <FiGlobe size={16} />, color: '#10b981' },
  { id: 'youtube', name: 'YouTube', icon: <FiYoutube size={16} />, color: '#ff0000' },
].sort((a, b) => a.name.localeCompare(b.name));

export const SocialPlatformSelector: React.FC<SocialPlatformSelectorProps> = ({
  selectedPlatform,
  onSelect,
  excludePlatforms = [],
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    platform => !excludePlatforms.includes(platform.id)
  );

  const selectedPlatformData = SOCIAL_PLATFORMS.find(p => p.id === selectedPlatform);

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
                  <span 
                    className="platform-icon" 
                    style={{ color: platform.color }}
                  >
                    {platform.icon}
                  </span>
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