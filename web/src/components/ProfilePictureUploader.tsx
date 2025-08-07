import React, { useState, useRef } from 'react';
import ImageCropper from './ImageCropper';
import { uploadProfilePicture } from '../services/mediaService';

interface ProfilePictureUploaderProps {
  currentUser: {
    profileImage: string;
    providerAvatarUrl: string;
  };
  onUploadSuccess: (newProfileImageUrl: string, isFirstCustomProfileImage: boolean) => void;
  onUploadError: (error: string) => void;
}

const ProfilePictureUploader: React.FC<ProfilePictureUploaderProps> = ({
  currentUser,
  onUploadSuccess,
  onUploadError,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      onUploadError('Please select a valid image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      onUploadError('The image cannot be larger than 10MB');
      return;
    }

    setSelectedFile(file);
    setShowCropper(true);
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    setShowCropper(false);
    setIsUploading(true);

    try {
      // Create preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(croppedImageBlob);
      setPreviewUrl(previewUrl);

      // Upload to S3
      const { profileImageUrl, isFirstCustomProfileImage } = await uploadProfilePicture(
        croppedImageBlob, 
        currentUser
      );
      
      // Clean up preview URL
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      
      onUploadSuccess(profileImageUrl, isFirstCustomProfileImage);
    } catch (error) {
      // Clean up preview URL on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      onUploadError(
        error instanceof Error
          ? error.message
          : 'Error uploading image. Please try again.'
      );
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedFile(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleChoosePhoto = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="profile-picture-uploader">
      <div className="avatar-container">
        <img
          src={previewUrl || currentUser.profileImage || '/default-avatar.png'}
          alt="Profile picture"
          className="profile-avatar-large"
        />
        
        {isUploading && (
          <div className="avatar-loading-overlay">
            <div className="spinner"></div>
            <span>Uploading...</span>
          </div>
        )}
      </div>

      <div className="avatar-actions">
        <button
          type="button"
          onClick={handleChoosePhoto}
          className="btn btn-secondary"
          disabled={isUploading}
        >
          {currentUser.profileImage ? 'Change photo' : 'Upload photo'}
        </button>
        
        <p className="avatar-help-text">
          Supported formats: JPG, PNG, GIF. Maximum 10MB.
        </p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Image cropper modal */}
      {showCropper && selectedFile && (
        <ImageCropper
          imageFile={selectedFile}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default ProfilePictureUploader;
