import CryptoJS from 'crypto-js';

export interface PresignedPostResponse {
  url: string;
  fields: Record<string, string>;
}

export interface MediaUploadRequest {
  key: string;
  contentType: string;
  size: number;
  md5: string;
}

/**
 * Calculate MD5 hash of a blob
 */
export const calculateMD5 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        const md5 = CryptoJS.MD5(wordArray).toString();
        resolve(md5);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
};

/**
 * Generate a unique profile picture key using a random UUID
 * This ensures no collisions between users
 */
export const generateProfilePictureKey = (): string => {
  // Generate a UUID-like string
  const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
  
  return `profile-pictures/${uuid}/avatar.webp`;
};

/**
 * Request a presigned POST URL from the backend
 */
export const requestPresignedPost = async (request: MediaUploadRequest): Promise<PresignedPostResponse> => {
  const response = await fetch('/api/media', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to get presigned URL: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Upload a file to S3 using presigned POST
 */
export const uploadToS3 = async (
  presignedPost: PresignedPostResponse,
  file: Blob
): Promise<void> => {
  const formData = new FormData();
  
  // Add all the fields from the presigned post
  Object.entries(presignedPost.fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  
  // Add the file last
  formData.append('file', file);

  const response = await fetch(presignedPost.url, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Failed to upload to S3: ${response.statusText}`);
  }
};

/**
 * Check if user has a custom avatar (not from GitHub)
 */
export const hasCustomAvatar = (user: { avatarUrl: string; providerAvatarUrl: string }): boolean => {
  return user.avatarUrl !== user.providerAvatarUrl;
};

/**
 * Complete workflow to upload a profile picture
 */
export const uploadProfilePicture = async (
  imageBlob: Blob,
  currentUser: { avatarUrl: string; providerAvatarUrl: string }
): Promise<{ avatarUrl: string; isFirstCustomAvatar: boolean }> => {
  try {
    // Calculate MD5 and prepare request
    const md5 = await calculateMD5(imageBlob);
    
    // Check if this is the first time user uploads a custom avatar
    const isFirstCustomAvatar = !hasCustomAvatar(currentUser);
    
    let key: string;
    
    if (isFirstCustomAvatar) {
      // First time: generate a new unique key
      key = generateProfilePictureKey();
    } else {
      // Extract key from current avatar URL if it's already custom
      // The backend will have sent us a complete URL, so we need to extract just the key
      const pathParts = currentUser.avatarUrl.split('/');
      // Expected format: https://bucket.s3.amazonaws.com/profile-pictures/uuid/avatar.webp
      if (pathParts.length >= 5 && pathParts[3] === 'profile-pictures') {
        key = pathParts.slice(3).join('/'); // Get "profile-pictures/uuid/avatar.webp"
      } else {
        // Fallback: generate new key if we can't parse the existing one
        key = generateProfilePictureKey();
      }
    }
    
    const uploadRequest: MediaUploadRequest = {
      key,
      contentType: 'image/webp',
      size: imageBlob.size,
      md5,
    };

    // Get presigned URL
    const presignedPost = await requestPresignedPost(uploadRequest);

    // Upload to S3
    await uploadToS3(presignedPost, imageBlob);

    // The backend will construct the complete URL and send it back
    // For now, we construct it here for consistency
    const bucketName = presignedPost.url.split('.')[0].replace('https://', '');
    const avatarUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
    
    return { avatarUrl, isFirstCustomAvatar };
    
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Delete a profile picture
 */
export const deleteProfilePicture = async (avatarUrl: string): Promise<void> => {
  try {
    // Extract key from avatar URL
    const url = new URL(avatarUrl);
    const pathParts = url.pathname.split('/');
    if (pathParts.length >= 4 && pathParts[1] === 'profile-pictures') {
      const key = pathParts.slice(1).join('/'); // Remove leading slash
      
      const response = await fetch(`/api/media/${encodeURIComponent(key)}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok && response.status !== 404) {
        throw new Error(`Failed to delete profile picture: ${response.statusText}`);
      }
    }
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    // Don't throw error for delete operations to avoid blocking the UI
  }
};
