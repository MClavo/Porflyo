import React, { useState, useEffect } from 'react';
import { FiLink, FiPlus, FiTrash2, FiCheck, FiX } from 'react-icons/fi';
import type { PublicUserDto } from '../../api/types';
import { SocialPlatformSelector } from '../ui/SocialPlatformSelector';

interface ModernSocialLinksProps {
  user: PublicUserDto;
  onSocialsUpdate: (updatedSocials: Record<string, string>) => void;
  isLoading?: boolean;
}

export const ModernSocialLinks: React.FC<ModernSocialLinksProps> = ({
  user,
  onSocialsUpdate,
  isLoading = false
}) => {
  const [socials, setSocials] = useState<Record<string, string>>(user.socials || {});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);

  useEffect(() => {
    const currentSocials = user.socials || {};
    const hasChanges = JSON.stringify(socials) !== JSON.stringify(currentSocials);
    setHasChanges(hasChanges);
  }, [socials, user.socials]);

  const handleSocialChange = (platform: string, url: string) => {
    setSocials(prev => {
      const updated = { ...prev };
      if (url.trim()) {
        updated[platform] = url.trim();
      } else {
        delete updated[platform];
      }
      return updated;
    });
    
    // Clear any existing messages
    if (saveMessage) {
      setSaveMessage(null);
    }
  };

  const handleAddSocial = () => {
    setIsAddingNew(true);
  };

  const handleSelectPlatform = (platform: string) => {
    setSocials(prev => ({ ...prev, [platform]: '' }));
    setIsAddingNew(false);
  };

  const handleCancelAdd = () => {
    setIsAddingNew(false);
  };

  const handlePlatformChange = (oldPlatform: string, newPlatform: string) => {
    if (oldPlatform === newPlatform) return;
    
    setSocials(prev => {
      const updated = { ...prev };
      const url = updated[oldPlatform] || '';
      delete updated[oldPlatform];
      updated[newPlatform] = url;
      return updated;
    });
  };

  const handleRemoveSocial = (platform: string) => {
    setSocials(prev => {
      const updated = { ...prev };
      delete updated[platform];
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      setSaveMessage({ type: 'error', text: 'No changes to save' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ socials }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update social links');
      }

      await response.json();
      onSocialsUpdate(socials);
      setSaveMessage({ type: 'success', text: 'Social links updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      setSaveMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update social links' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSocials(user.socials || {});
    setSaveMessage(null);
  };

  const getPlaceholder = (platform: string) => {
    switch (platform) {
      case 'linkedin': return 'https://linkedin.com/in/username';
      case 'twitter': return 'https://twitter.com/username';
      case 'github': return 'https://github.com/username';
      case 'instagram': return 'https://instagram.com/username';
      case 'facebook': return 'https://facebook.com/username';
      case 'youtube': return 'https://youtube.com/c/username';
      case 'website': return 'https://yourwebsite.com';
      case 'blog': return 'https://yourblog.com';
      case 'discord': return 'https://discord.com/users/userid';
      default: return 'https://...';
    }
  };

  // List of all available platforms (should match SocialPlatformSelector)
  const ALL_PLATFORMS = [
    'blog', 'discord', 'facebook', 'github', 'instagram', 'kaggle', 
    'leetcode', 'linkedin', 'medium', 'tiktok', 'twitch', 'twitter', 
    'website', 'youtube'
  ];

  const canAddMore = Object.keys(socials).length < ALL_PLATFORMS.length;

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <FiLink className="profile-section-icon" />
        <div>
          <h3 className="profile-section-title">Social Links</h3>
          <p className="profile-section-description">
            Add your social media profiles and website links
          </p>
        </div>
      </div>

      {saveMessage && (
        <div className={`status-message status-${saveMessage.type}`}>
          {saveMessage.type === 'success' ? <FiCheck size={16} /> : <FiX size={16} />}
          {saveMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="social-fields">
        {Object.entries(socials).map(([platform, url]) => (
          <div key={platform} className="social-field">
            <div className="social-platform-wrapper">
              <SocialPlatformSelector
                selectedPlatform={platform}
                onSelect={(newPlatform) => handlePlatformChange(platform, newPlatform)}
                excludePlatforms={Object.keys(socials).filter(p => p !== platform)}
                disabled={isLoading || isSaving}
              />
            </div>
            <input
              type="url"
              value={url}
              onChange={(e) => handleSocialChange(platform, e.target.value)}
              className="social-input"
              placeholder={getPlaceholder(platform)}
              disabled={isLoading || isSaving}
            />
            <button
              type="button"
              onClick={() => handleRemoveSocial(platform)}
              className="social-remove"
              disabled={isLoading || isSaving}
              title="Remove social link"
            >
              <FiTrash2 size={14} />
            </button>
          </div>
        ))}

        {isAddingNew && (
          <div className="social-field adding-new">
            <div className="social-platform-wrapper">
              <SocialPlatformSelector
                onSelect={handleSelectPlatform}
                excludePlatforms={Object.keys(socials)}
                disabled={isLoading || isSaving}
              />
            </div>
            <input
              type="url"
              value=""
              className="social-input"
              placeholder="Enter URL..."
              disabled
            />
            <button
              type="button"
              onClick={handleCancelAdd}
              className="social-cancel"
              disabled={isLoading || isSaving}
              title="Cancel adding"
            >
              <FiX size={14} />
            </button>
          </div>
        )}

        {canAddMore && !isAddingNew && (
          <button
            type="button"
            onClick={handleAddSocial}
            className="add-social-button"
            disabled={isLoading || isSaving}
          >
            <FiPlus size={16} />
            Add Social Link
          </button>
        )}

        {hasChanges && (
          <div className="profile-actions">
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSaving || isLoading}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default ModernSocialLinks;