import React, { useState } from 'react';
import { useAuthContext } from '../hooks/ui/useAuthContext';
import type { PublicUserDto } from '../api/types';
import {
  ModernProfileHeader,
  ModernImageUpload,
  ModernProfileForm,
  ModernSocialLinks,
  ModernProviderInfo
} from '../components/profile';

import '../styles/pages/ProfilePage.css';
import '../styles/components/buttons.css';

const ProfilePage: React.FC = () => {
  const { user, refetch, setAuthenticatedUser, isLoading: userLoading } = useAuthContext();
  const [avatarUploadMessage, setAvatarUploadMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!user && !userLoading) {
    return (
      <div className="profile-page">
        <div className="profile-content">
          <div className="profile-section">
            <p>No authenticated user found. Please log in to access your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleAvatarUploadSuccess = async () => {
    try {
      setAvatarUploadMessage(null);
      
      // Refresh user data to get the updated profile image URL from the server
      await refetch();
      
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

  const handleSocialsUpdate = (updatedSocials: Record<string, string>) => {
    if (user) {
      setAuthenticatedUser({
        ...user,
        socials: updatedSocials
      });
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-content">
        <ModernProfileHeader user={user} isLoading={userLoading} />
        
        {user && (
          <>
            <ModernImageUpload
              user={user}
              onUploadSuccess={handleAvatarUploadSuccess}
              onUploadError={handleAvatarUploadError}
              uploadMessage={avatarUploadMessage}
            />
            
            <ModernProfileForm 
              user={user}
              onUserUpdate={handleUserUpdate}
              isLoading={userLoading}
            />

            <ModernSocialLinks
              user={user}
              onSocialsUpdate={handleSocialsUpdate}
              isLoading={userLoading}
            />
            
            <ModernProviderInfo user={user} isLoading={userLoading} />
          </>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
