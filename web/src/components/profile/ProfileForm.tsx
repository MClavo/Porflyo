import React, { useState, useEffect } from 'react';
import { FiUser, FiMail, FiFileText, FiCheck, FiX } from 'react-icons/fi';
import type { PublicUserDto } from '../../api/types';

interface ProfileFormProps {
  user: PublicUserDto;
  onUserUpdate: (updatedUser: PublicUserDto) => void;
  isLoading?: boolean;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  user,
  onUserUpdate,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    description: user.description
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const hasChanges = 
      formData.name !== user.name ||
      formData.email !== user.email ||
      formData.description !== user.description;
    setHasChanges(hasChanges);
  }, [formData, user]);

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear any existing messages when user starts typing
    if (saveMessage) {
      setSaveMessage(null);
    }
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
        body: JSON.stringify(formData),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      onUserUpdate(updatedUser);
      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } catch (error) {
      setSaveMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: user.name,
      email: user.email,
      description: user.description
    });
    setSaveMessage(null);
  };

  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <FiUser className="profile-section-icon" />
        <div>
          <h3 className="profile-section-title">Personal Information</h3>
          <p className="profile-section-description">
            Update your personal details and preferences
          </p>
        </div>
      </div>

      {saveMessage && (
        <div className={`status-message status-${saveMessage.type}`}>
          {saveMessage.type === 'success' ? <FiCheck size={16} /> : <FiX size={16} />}
          {saveMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="profile-form-grid">
        <div className="profile-form-row">
          <div className="profile-field">
            <label className="profile-field-label">
              <FiUser size={14} />
              Full Name
              <span className="profile-field-required">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="profile-field-input"
              placeholder="Enter your full name"
              required
              disabled={isLoading || isSaving}
            />
          </div>

          <div className="profile-field">
            <label className="profile-field-label">
              <FiMail size={14} />
              Email Address
              <span className="profile-field-required">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="profile-field-input"
              placeholder="Enter your email address"
              required
              disabled={isLoading || isSaving}
            />
          </div>
        </div>

        <div className="profile-field">
          <label className="profile-field-label">
            <FiFileText size={14} />
            Bio / Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="profile-field-input profile-field-textarea"
            placeholder="Tell us about yourself..."
            rows={4}
            disabled={isLoading || isSaving}
          />
        </div>

        <div className="profile-actions">
          {hasChanges && (
            <button
              type="button"
              onClick={handleReset}
              className="btn btn-outline"
              disabled={isSaving}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={!hasChanges || isSaving || isLoading}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;