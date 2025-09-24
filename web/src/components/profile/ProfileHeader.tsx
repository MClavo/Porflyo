import React from 'react';
import type { PublicUserDto } from '../../api/types';

interface ProfileHeaderProps {
  user: PublicUserDto;
  imageTimestamp?: number;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, imageTimestamp }) => {
  // Create cache-busted URL if timestamp is provided
  const getImageUrl = () => {
    const baseUrl = user.profileImage || user.providerAvatarUrl || '/default-avatar.png';
    if (imageTimestamp && user.profileImage) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}cb=${imageTimestamp}`;
    }
    return baseUrl;
  };

  return (
    <div className="profile-header">
      <img 
        src={getImageUrl()} 
        alt="Avatar" 
        className="profile-avatar"
        key={imageTimestamp} // Force re-render when timestamp changes
      />
      <h1 className="card-title">Edit Profile</h1>
      <p className="card-description">Update your personal information</p>
    </div>
  );
};

export default ProfileHeader;