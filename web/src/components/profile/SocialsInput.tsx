import React from 'react';
import type { SocialsLike } from '../../utils/profileUtils';

type Props = {
  socials: SocialsLike;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (platform: string, value: string) => void;
  onRemove: (platform: string) => void;
  newPlatform: string;
  newUrl: string;
  setNewPlatform: (v: string) => void;
  setNewUrl: (v: string) => void;
  onAdd: () => void;
  normalizeSocials: (s: SocialsLike) => Record<string, string>;
};

const SocialsInput: React.FC<Props> = ({ socials, onChange, onBlur, onRemove, newPlatform, newUrl, setNewPlatform, setNewUrl, onAdd, normalizeSocials }) => (
  <div className="form-group">
    <label className="form-label">Social Networks</label>

    {Object.entries(normalizeSocials(socials)).map(([platform, url]) => (
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
          name={`socials.${platform}`}
          value={url}
          onChange={onChange}
          onBlur={(e) => onBlur(platform, e.target.value)}
          className="form-input"
          placeholder={`${platform.charAt(0).toUpperCase() + platform.slice(1)} URL`}
        />
        <button
          type="button"
          onClick={() => onRemove(platform)}
          className="btn btn-secondary btn-sm"
          style={{ minWidth: 'auto', padding: '0.5rem' }}
        >
          ✕
        </button>
      </div>
    ))}

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
        className="form-input"
        placeholder="URL"
      />
      <button
        type="button"
        onClick={onAdd}
        className="btn btn-secondary btn-sm"
        disabled={!newPlatform.trim() || !newUrl.trim()}
      >
        Add
      </button>
    </div>
  </div>
);

export default SocialsInput;
