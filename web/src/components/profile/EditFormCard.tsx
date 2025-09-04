import React from 'react';
import SocialsInput from './SocialsInput';
import type { SocialsLike } from '../../utils/profileUtils';
import type { FieldErrors } from 'react-hook-form';

type Props = {
  formData: { name: string; email: string; socials: SocialsLike; description: string };
  errors: FieldErrors;
  newSocialPlatform: string;
  newSocialUrl: string;
  setNewSocialPlatform: (v: string) => void;
  setNewSocialUrl: (v: string) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => Promise<void> | void;
  handleSocialBlur: (platform: string, value: string) => void;
  addSocialNetwork: () => void;
  removeSocialNetwork: (platform: string) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void> | void;
  saving: boolean;
  updateUserPending: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  navigateToHome: () => void;
  normalizeSocials: (s: SocialsLike) => Record<string, string>;
};

const EditFormCard: React.FC<Props> = ({ formData, errors, newSocialPlatform, newSocialUrl, setNewSocialPlatform, setNewSocialUrl, handleInputChange, handleSocialBlur, addSocialNetwork, removeSocialNetwork, handleSubmit, saving, updateUserPending, message, navigateToHome, normalizeSocials }) => (
  <div className="card">
    <div className="card-header">
      <h2 className="card-title">Personal Information</h2>
      <p className="card-description">Modify your personal information visible on your profile</p>
    </div>

    {message && (
      <div className={message.type === 'success' ? 'success' : 'error'}>
        {message.text}
      </div>
    )}

    <form onSubmit={handleSubmit} className="profile-form">
      <div className="form-group">
        <label htmlFor="name" className="form-label">Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className={`form-input ${errors.name ? 'error' : ''}`}
          required
        />
        {typeof errors.name?.message === 'string' && (
          <p className="error-message">{errors.name!.message}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          className={`form-input ${errors.email ? 'error' : ''}`}
          required
        />
        {typeof errors.email?.message === 'string' && (
          <p className="error-message">{errors.email!.message}</p>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="description" className="form-label">Bio</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          className={`form-input ${errors.description ? 'error' : ''}`}
          maxLength={1200}
          style={{ resize: 'none', minHeight: '150px' }}
        />
        {typeof errors.description?.message === 'string' && (
          <p className="error-message">{errors.description!.message}</p>
        )}
      </div>

      <SocialsInput
        socials={formData.socials}
        onChange={handleInputChange}
        onBlur={handleSocialBlur}
        onRemove={removeSocialNetwork}
        newPlatform={newSocialPlatform}
        newUrl={newSocialUrl}
        setNewPlatform={setNewSocialPlatform}
        setNewUrl={setNewSocialUrl}
        onAdd={addSocialNetwork}
        normalizeSocials={normalizeSocials}
      />

      <div className="flex gap-4">
        <button
          type="submit"
          className="btn"
          disabled={saving || updateUserPending}
        >
          {saving || updateUserPending ? 'Saving...' : 'Save Changes'}
        </button>

        <button
          type="button"
          onClick={navigateToHome}
          className="btn-outline btn"
          disabled={saving || updateUserPending}
        >
          Cancel
        </button>
      </div>
    </form>
  </div>
);

export default EditFormCard;
