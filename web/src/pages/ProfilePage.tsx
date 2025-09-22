import React, { useState } from 'react';
import { useAuthContext } from '../hooks/useAuthContext';
import type { PublicUserDto } from '../api/types';
import {
  ProfileHeader,
  ProfileForm,
  ProfilePictureSection,
  ProviderInfoSection
} from '../components/profile';

import "../styles/components/variables.css";
import "../styles/components/cards.css";
import "../styles/components/forms.css";
import "../styles/components/image-cropper.css";
import "../styles/components/utilities.css";
import "../styles/components/layout.css";
import "../styles/components/buttons.css";



const ProfilePage: React.FC = () => {
  const { user, refetch, setAuthenticatedUser } = useAuthContext();
  const [avatarUploadMessage, setAvatarUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageTimestamp, setImageTimestamp] = useState<number>(Date.now());

  if (!user) {
    return (
      <div className="main-content">
        <div className="card">
          <p>No authenticated user</p>
        </div>
      </div>
    );
  }

  const handleAvatarUploadSuccess = async () => {
    try {
      setAvatarUploadMessage(null);
      
      // Force image reload by updating timestamp
      setImageTimestamp(Date.now());
      
      // Refresh user data to get the updated profile image URL from the server
      await refetch();
      
      // If refetch doesn't immediately update the user state, 
      // we can force update with cache busting
      if (user) {
        const currentUrl = user.profileImage || '';
        const separator = currentUrl.includes('?') ? '&' : '?';
        const bustedUrl = `${currentUrl}${separator}cb=${Date.now()}`;
        
        // Update user data with cache-busted URL
        setAuthenticatedUser({
          ...user,
          profileImage: bustedUrl
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

  const handleUserUpdate = (updatedUser: PublicUserDto) => {
    setAuthenticatedUser(updatedUser);
  };

  return (
    <div className="main-content profile-page fade-in">
      <ProfileHeader user={user} imageTimestamp={imageTimestamp} />
      
      <ProfilePictureSection
        user={user}
        onUploadSuccess={handleAvatarUploadSuccess}
        onUploadError={handleAvatarUploadError}
        uploadMessage={avatarUploadMessage}
        imageTimestamp={imageTimestamp}
      />
      
      <ProviderInfoSection user={user} />
      
      <ProfileForm 
        user={user}
        onUserUpdate={handleUserUpdate}
      />
    </div>
  );
};

export default ProfilePage;
