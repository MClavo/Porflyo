import React from 'react';
import type { PublicUserDto } from '../../api/types';
import ProfilePictureUploader from '../media/ProfilePictureUploader';

interface ProfilePictureSectionProps {
  user: PublicUserDto;
  onUploadSuccess: () => void;
  onUploadError: (error: string) => void;
  uploadMessage?: { type: 'success' | 'error'; text: string } | null;
  imageTimestamp?: number;
}

export const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({
  user,
  onUploadSuccess,
  onUploadError,
  uploadMessage,
  imageTimestamp
}) => {
  // Create cache-busted URL for current user image
  const getCurrentImageUrl = () => {
    const baseUrl = user.profileImage || '';
    if (imageTimestamp && baseUrl) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}cb=${imageTimestamp}`;
    }
    return baseUrl;
  };
  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Profile Picture</h2>
        <p className="card-description">
          Change your profile picture. It will be displayed as a circle on your profile.
        </p>
      </div>

      {uploadMessage && (
        <div className={uploadMessage.type === 'success' ? 'success' : 'error'}>
          {uploadMessage.text}
        </div>
      )}

      <ProfilePictureUploader
        currentUser={{
          profileImage: getCurrentImageUrl(),
          profileImageKey: user.profileImageKey,
          providerAvatarUrl: user.providerAvatarUrl || ''
        }}
        onUploadSuccess={onUploadSuccess}
        onUploadError={onUploadError}
      />
    </div>
  );
};

export default ProfilePictureSection;