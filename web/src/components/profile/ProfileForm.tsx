import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PublicUserDto, PartialUserDto } from '../../api/types';
import { patchUser } from '../../api/clients/user.api';
import SocialsSection from './SocialsSection';

interface ProfileFormProps {
  user: PublicUserDto;
  onUserUpdate: (user: PublicUserDto) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ user, onUserUpdate }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    description: user?.description || '',
    socials: user?.socials || {}
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSocialsChange = (socials: Record<string, string>) => {
    setFormData(prev => ({
      ...prev,
      socials
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Only send fields that have changed
      const changes: PartialUserDto = {};

      if (formData.name !== user.name) {
        changes.name = formData.name;
      }

      if (formData.email !== user.email) {
        changes.email = formData.email;
      }

      if (formData.description !== user.description) {
        changes.description = formData.description;
      }

      // Check if socials changed
      const socialsChanged = JSON.stringify(formData.socials) !== JSON.stringify(user.socials);
      if (socialsChanged) {
        changes.socials = formData.socials;
      }

      if (Object.keys(changes).length === 0) {
        setMessage({ type: 'success', text: 'No changes to save' });
        setSaving(false);
        return;
      }

      const updatedUser = await patchUser(changes);
      onUserUpdate(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/home');
      }, 2000);
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error updating profile' 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
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
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-input"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            className="form-input"
            rows={3}
            placeholder="Tell us about yourself..."
          />
        </div>

        <SocialsSection 
          socials={formData.socials}
          onChange={handleSocialsChange}
        />

        <div className="flex gap-4">
          <button
            type="submit"
            className="btn"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="btn-outline btn"
            disabled={saving}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;