import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from '../../features/auth/hooks/useAuthUser';
import { useUpdateUser } from '../../features/auth/hooks/useUpdateUser';
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfilePictureCard from '../../components/profile/ProfilePictureCard';
import ProviderInfoCard from '../../components/profile/ProviderInfoCard';
import EditFormCard from '../../components/profile/EditFormCard';
import { normalizeSocials, ensureHttps } from '../../utils/profileUtils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { UserPatchDto } from '../../types/dto';

// Schema for validation - all fields optional
const profileFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  email: z.string().email('Invalid email format').max(100, 'Email must be 100 characters or less'),
  description: z.string().max(1200, 'Bio must be 1200 characters or less'),
});

type ProfileFormData = z.infer<typeof profileFormSchema>;

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuthUser();
  const updateUserMutation = useUpdateUser();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    socials: user?.socials || {},
    description: user?.description || ''
  });
  const [newSocialPlatform, setNewSocialPlatform] = useState('');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [avatarUploadMessage, setAvatarUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageTimestamp, setImageTimestamp] = useState(Date.now());

  // imageTimestamp state is passed to util getImageUrlWithTimestamp when needed

  // Use react-hook-form for validation only
  const {
    formState: { errors },
    trigger,
    setValue,
    clearErrors
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileFormSchema),
    mode: 'onChange'
  });

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        socials: user.socials || {},
        description: user.description || ''
      });
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      setValue('description', user.description || '');
      clearErrors();
    }
  }, [user, setValue, clearErrors]);

  if (isLoading) {
    return (
      <div className="main-content">
        <div className="card">
          <div className="loading">
            <div className="spinner"></div>
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="main-content">
        <div className="card">
          <p>No authenticated user</p>
        </div>
      </div>
    );
  }

  // Using helpers from ../../utils/profileUtils

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement | HTMLTextAreaElement;
    
    if (name.startsWith('socials.')) {
      const socialKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socials: {
          ...normalizeSocials(prev.socials),
          [socialKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
      
      // Trigger validation for basic fields
  if (name === 'name' || name === 'email' || name === 'description') {
        setValue(name as keyof ProfileFormData, value);
        await trigger(name as keyof ProfileFormData);
      }
    }
  };

  const handleSocialBlur = (platform: string, value: string) => {
  const urlWithProtocol = ensureHttps(value);
    setFormData(prev => ({
      ...prev,
      socials: {
        ...normalizeSocials(prev.socials),
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
          ...normalizeSocials(prev.socials),
          [newSocialPlatform.toLowerCase().trim()]: urlWithProtocol
        }
      }));
      setNewSocialPlatform('');
      setNewSocialUrl('');
    }
  };

  const removeSocialNetwork = (platform: string) => {
    setFormData(prev => {
  // Ensure we're working with a normalized object (not an array)
  const newSocials = { ...normalizeSocials(prev.socials) };
      delete newSocials[platform];
      // If there are no keys left, return an empty object to signal "cleared"
      return {
        ...prev,
        socials: Object.keys(newSocials).length ? newSocials : {}
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Validate basic fields first
  setValue('name', formData.name);
  setValue('email', formData.email);
  setValue('description', formData.description as string);
      
      const isValid = await trigger();
      if (!isValid) {
        setSaving(false);
        return;
      }

      // Only send fields that have changed
      const changes: UserPatchDto = {};

      if (formData.name !== user?.name) {
        changes.name = formData.name;
      }

      if (formData.email !== user?.email) {
        changes.email = formData.email;
      }

      if (formData.description !== user?.description) {
        // send description (labelled Bio in UI) even if empty string to clear it on server
        changes.description = formData.description;
      }

  // Normalize socials for reliable comparison and sending
  const normalizedFormSocials = normalizeSocials(formData.socials);
  const normalizedUserSocials = normalizeSocials(user?.socials);
      const socialsChanged = JSON.stringify(normalizedFormSocials) !== JSON.stringify(normalizedUserSocials);

      if (socialsChanged) {
        // If there are no socials left, send an explicit empty object {}
        changes.socials = Object.keys(normalizedFormSocials).length ? normalizedFormSocials : {};
      }

      if (Object.keys(changes).length === 0) {
        setMessage({ type: 'success', text: 'No changes to save' });
        setSaving(false);
        return;
      }

      await updateUserMutation.mutateAsync(changes);
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
      
      // Force image reload by updating timestamp
      setImageTimestamp(Date.now());
      
      // Use updateUserInCache to force refresh the user data
      if (user) {
        updateUserMutation.updateUserInCache({
          profileImage: user.profileImage,
        });
      }

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
    <>
      <ProfileHeader profileImage={user?.profileImage} imageTimestamp={imageTimestamp} />
      <ProfilePictureCard
        profileImage={user?.profileImage}
        profileImageKey={user?.profileImageKey}
        providerAvatarUrl={user?.providerAvatarUrl}
        imageTimestamp={imageTimestamp}
        avatarUploadMessage={avatarUploadMessage}
        onUploadSuccess={handleAvatarUploadSuccess}
        onUploadError={handleAvatarUploadError}
      />
      <ProviderInfoCard providerUserName={user?.providerUserName} providerAvatarUrl={user?.providerAvatarUrl} />
      <EditFormCard
        formData={formData}
        errors={errors}
        newSocialPlatform={newSocialPlatform}
        newSocialUrl={newSocialUrl}
        setNewSocialPlatform={setNewSocialPlatform}
        setNewSocialUrl={setNewSocialUrl}
        handleInputChange={handleInputChange}
        handleSocialBlur={handleSocialBlur}
        addSocialNetwork={addSocialNetwork}
        removeSocialNetwork={removeSocialNetwork}
        handleSubmit={handleSubmit}
        saving={saving}
        updateUserPending={updateUserMutation.isPending}
        message={message}
        navigateToHome={() => navigate('/')}
        normalizeSocials={normalizeSocials}
      />
    </>
  );
};

export default ProfilePage;
