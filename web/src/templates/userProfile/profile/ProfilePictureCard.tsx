import React from 'react';
import ProfilePictureUploader from '../../components/ProfilePictureUploader';
import { getImageUrlWithTimestamp } from '../../utils/profileUtils';

type Props = {
  profileImage?: string | null;
  profileImageKey?: string;
  providerAvatarUrl?: string | null;
  imageTimestamp: number;
  avatarUploadMessage: { type: 'success' | 'error'; text: string } | null;
  onUploadSuccess: () => Promise<void> | void;
  onUploadError: (err: string) => void;
};

const ProfilePictureCard: React.FC<Props> = ({ profileImage, profileImageKey, providerAvatarUrl, imageTimestamp, avatarUploadMessage, onUploadSuccess, onUploadError }) => (
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
        profileImage: getImageUrlWithTimestamp(profileImage, imageTimestamp),
        profileImageKey: profileImageKey || '',
        providerAvatarUrl: providerAvatarUrl || ''
      }}
      onUploadSuccess={onUploadSuccess}
      onUploadError={onUploadError}
    />
  </div>
);

export default ProfilePictureCard;
