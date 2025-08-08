import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { updateUser as updateUserAPI } from '../services/api';
import ProfilePictureUploader from './ProfilePictureUploader';

const ProfilePage: React.FC = () => {
  const { user, updateUser, loading, checkAuthStatus } = useUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    socials: user?.socials || {}
  });
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarUploadMessage, setAvatarUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user) {
    return (
      <div className="main-content">
        <div className="card">
          <p>No authenticated user</p>
        </div>
      </div>
    );
  }

  // Helper function to ensure URL has protocol
  const ensureHttps = (url: string): string => {
    if (!url) return url;
    const trimmedUrl = url.trim();
    if (trimmedUrl.startsWith('http://') || trimmedUrl.startsWith('https://')) {
      return trimmedUrl;
    }
    return `https://${trimmedUrl}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('socials.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socials: {
          ...prev.socials,
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSocialBlur = (platform: string, value: string) => {
    const urlWithProtocol = ensureHttps(value);
    setFormData(prev => ({
      ...prev,
      socials: {
        ...prev.socials,
        [platform]: urlWithProtocol
      }
    }));
  };

  const addSocialNetwork = () => {
    if (newSocialPlatform.trim() && newSocialUrl.trim()) {
      const urlWithProtocol = ensureHttps(newSocialUrl.trim());
      setFormData(prev => ({
        ...prev,
        socials: {
          ...prev.socials,
          [newSocialPlatform.toLowerCase().trim()]: urlWithProtocol
        }
      }));
      setNewSocialPlatform('');
      setNewSocialUrl('');
    }
  };

  const removeSocialNetwork = (platform: string) => {
    setFormData(prev => {
      const newSocials = { ...prev.socials };
      delete newSocials[platform];
      return {
        ...prev,
        socials: newSocials
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Only send fields that have changed
      const changes: Record<string, unknown> = {};
      
      if (formData.name !== user.name) {
        changes.name = formData.name;
      }
      
      if (formData.email !== user.email) {
        changes.email = formData.email;
      }

      // Check for changes in socials
      const socialsChanged = JSON.stringify(formData.socials) !== JSON.stringify(user.socials);
      
      if (socialsChanged) {
        changes.socials = formData.socials;
      }

      if (Object.keys(changes).length === 0) {
        setMessage({ type: 'success', text: 'No changes to save' });
        setSaving(false);
        return;
      }

      const updatedUser = await updateUserAPI(changes);
      updateUser(updatedUser);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
      
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate('/');
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

  const handleAvatarUploadSuccess = async () => {
    try {
      setAvatarUploadMessage(null);
      
      // Refresh user data to get the updated profile image URL
      // The backend automatically generates the full URL from the profileImageKey
      await checkAuthStatus(); // This will fetch fresh user data from the API
      
      setAvatarUploadMessage({ type: 'success', text: 'Profile picture updated successfully' });

      // Clear the message after 3 seconds
      setTimeout(() => {
        setAvatarUploadMessage(null);
      }, 3000);
    } catch (error) {
      setAvatarUploadMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Error updating profile picture' 
      });
    }
  };

  const handleAvatarUploadError = (error: string) => {
    setAvatarUploadMessage({ type: 'error', text: error });
    // Clear the error message after 5 seconds
    setTimeout(() => {
      setAvatarUploadMessage(null);
    }, 5000);
  };

  return (
    <div className="main-content fade-in">
      <div className="profile-header">
        <img 
          src={user.profileImage} 
          alt="Avatar" 
          className="profile-avatar"
        />
        <h1 className="card-title">Edit Profile</h1>
        <p className="card-description">Update your personal information</p>
      </div>

      {/* Profile Picture Upload Section */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Profile Picture</h2>
          <p className="card-description">Change your profile picture. It will be displayed as a circle on your profile.</p>
        </div>

        {avatarUploadMessage && (
          <div className={avatarUploadMessage.type === 'success' ? 'success' : 'error'}>
            {avatarUploadMessage.text}
          </div>
        )}

        <ProfilePictureUploader
          currentUser={{
            profileImage: user.profileImage,
            profileImageKey: user.profileImageKey,
            providerAvatarUrl: user.providerAvatarUrl
          }}
          onUploadSuccess={handleAvatarUploadSuccess}
          onUploadError={handleAvatarUploadError}
        />
      </div>

      {/* Provider Information (read only) */}
      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Provider Information</h2>
          <p className="card-description">This information comes from your GitHub account and cannot be modified here</p>
        </div>
        <div className="profile-provider-info">
          <div className="provider-info-row">
            <span className="provider-info-title">GitHub Name:</span>
            <span>{user.providerUserName}</span>
          </div>
          <div className="provider-info-row">
            <span className="provider-info-title">GitHub Avatar:</span>
            <img 
              src={user.providerAvatarUrl} 
              alt="Provider Avatar" 
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
          </div>
        </div>
      </div>

      {/* Edit Form */}
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

          {/* Dynamic Social Networks */}
          <div className="form-group">
            <label className="form-label">Social Networks</label>
            
            {/* Existing social networks */}
            {Object.entries(formData.socials).map(([platform, url]) => (
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
                  onChange={handleInputChange}
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
                value={newSocialPlatform}
                onChange={(e) => setNewSocialPlatform(e.target.value)}
                className="form-input"
                style={{ width: '120px' }}
                placeholder="Platform"
              />
              <input
                type="url"
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                onBlur={(e) => setNewSocialUrl(ensureHttps(e.target.value))}
                className="form-input"
                placeholder="URL"
              />
              <button
                type="button"
                onClick={addSocialNetwork}
                className="btn btn-secondary btn-sm"
                disabled={!newSocialPlatform.trim() || !newSocialUrl.trim()}
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="btn"
              disabled={saving || loading}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-outline btn"
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
