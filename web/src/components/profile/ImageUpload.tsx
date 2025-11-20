import React from 'react';
import { FiImage, FiCheck, FiX } from 'react-icons/fi';
import type { PublicUserDto } from '../../api/types';
import ProfilePictureUploader from '../media/ProfilePictureUploader';

interface ImageUploadProps {
  user: PublicUserDto;
  onUploadSuccess: () => void;
  onUploadError: (error: string) => void;
  uploadMessage?: { type: 'success' | 'error'; text: string } | null;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  user,
  onUploadSuccess,
  onUploadError,
  uploadMessage
}) => {
  return (
    <div className="profile-section">
      <div className="profile-section-header">
        <FiImage className="profile-section-icon" />
        <div>
          <h3 className="profile-section-title">Profile Picture</h3>
          <p className="profile-section-description">
            Upload a custom profile picture with cropping options
          </p>
        </div>
      </div>

      {uploadMessage && (
        <div className={`status-message status-${uploadMessage.type}`}>
          {uploadMessage.type === 'success' ? <FiCheck size={16} /> : <FiX size={16} />}
          {uploadMessage.text}
        </div>
      )}

      <div className="image-upload-section">
        <ProfilePictureUploader
          currentUser={{
            profileImage: user.profileImage || '',
            profileImageKey: user.profileImageKey,
            providerAvatarUrl: user.providerAvatarUrl || ''
          }}
          onUploadSuccess={onUploadSuccess}
          onUploadError={onUploadError}
        />
      </div>
    </div>
  );
};

export default ImageUpload;