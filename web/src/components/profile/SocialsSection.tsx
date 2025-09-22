import React, { useState } from 'react';

interface SocialsSectionProps {
  socials: Record<string, string>;
  onChange: (socials: Record<string, string>) => void;
}

export const SocialsSection: React.FC<SocialsSectionProps> = ({ socials, onChange }) => {
  const [newPlatform, setNewPlatform] = useState('');
  const [newUrl, setNewUrl] = useState('');

  // Helper function to ensure URL has protocol
  const ensureHttps = (url: string): string => {
    if (!url) return url;
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  const handleSocialChange = (platform: string, value: string) => {
    onChange({
      ...socials,
      [platform]: value
    });
  };

  const handleSocialBlur = (platform: string, value: string) => {
    const urlWithProtocol = ensureHttps(value);
    onChange({
      ...socials,
      [platform]: urlWithProtocol
    });
  };

  const addSocialNetwork = () => {
    if (newPlatform.trim() && newUrl.trim()) {
      const urlWithProtocol = ensureHttps(newUrl.trim());
      onChange({
        ...socials,
        [newPlatform.toLowerCase().trim()]: urlWithProtocol
      });
      setNewPlatform('');
      setNewUrl('');
    }
  };

  const removeSocialNetwork = (platform: string) => {
    const newSocials = { ...socials };
    delete newSocials[platform];
    onChange(newSocials);
  };

  return (
    <div className="form-group">
      <label className="form-label">Social Networks</label>
      
      {/* Existing social networks */}
      {Object.entries(socials).map(([platform, url]) => (
        <div key={platform} className="flex gap-2 mb-2">
          <input
            type="text"
            value={platform}
            className="form-input"
            style={{ width: '120px' }}
            disabled
          />
          <input
            type="url"
            value={url}
            onChange={(e) => handleSocialChange(platform, e.target.value)}
            onBlur={(e) => handleSocialBlur(platform, e.target.value)}
            className="form-input"
            placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
          />
          <button
            type="button"
            onClick={() => removeSocialNetwork(platform)}
            className="btn btn-secondary btn-sm"
            style={{ minWidth: 'auto', padding: '0.5rem' }}
          >
            ✕
          </button>
        </div>
      ))}
      
      {/* Add new social network */}
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          value={newPlatform}
          onChange={(e) => setNewPlatform(e.target.value)}
          className="form-input"
          style={{ width: '120px' }}
          placeholder="Platform"
        />
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          onBlur={(e) => setNewUrl(ensureHttps(e.target.value))}
          className="form-input"
          placeholder="URL"
        />
        <button
          type="button"
          onClick={addSocialNetwork}
          className="btn btn-secondary btn-sm"
          disabled={!newPlatform.trim() || !newUrl.trim()}
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default SocialsSection;