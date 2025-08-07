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
 * Check if user has a custom profile image (not from GitHub)
 */
export const hasCustomProfileImage = (user: { profileImage: string; providerAvatarUrl: string }): boolean => {
  return user.profileImage !== user.providerAvatarUrl;
};

/**
 * Extract key from S3 URL
 */
export const extractKeyFromS3Url = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    
    // Handle different S3 URL formats
    // Format 1: https://bucket.s3.amazonaws.com/key
    // Format 2: https://bucket.s3.region.amazonaws.com/key
    // Format 3: https://s3.amazonaws.com/bucket/key
    
    if (urlObj.hostname.includes('.s3.') || urlObj.hostname.includes('s3.amazonaws.com')) {
      const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
      
      if (urlObj.hostname.startsWith('s3.')) {
        // Format 3: s3.amazonaws.com/bucket/key - skip bucket name
        return pathParts.length > 1 ? pathParts.slice(1).join('/') : null;
      } else {
        // Format 1 & 2: bucket.s3.*.amazonaws.com/key - use full path
        return pathParts.join('/');
      }
    }
    
    return null;
  } catch (error) {
    console.warn('Failed to parse S3 URL:', url, error);
    return null;
  }
};

/**
 * Check if URL is a GitHub avatar URL
 */
export const isGitHubAvatarUrl = (url: string): boolean => {
  return url.includes('avatars.githubusercontent.com');
};

/**
 * Complete workflow to upload a profile picture
 */
export const uploadProfilePicture = async (
  imageBlob: Blob,
  currentUser: { profileImage: string; providerAvatarUrl: string }
): Promise<{ profileImageUrl: string; isFirstCustomProfileImage: boolean }> => {
  try {
    // Calculate MD5 and prepare request
    const md5 = await calculateMD5(imageBlob);
    
    // Check if this is the first time user uploads a custom profile image
    const isFirstCustomProfileImage = !hasCustomProfileImage(currentUser);
    
    let key: string;
    
    if (isFirstCustomProfileImage) {
      // First time: generate a new unique key
      key = generateProfilePictureKey();
    } else {
      // User already has a custom profile image, extract key from current URL
      if (isGitHubAvatarUrl(currentUser.profileImage)) {
        // Somehow the profileImage is still GitHub URL, generate new key
        key = generateProfilePictureKey();
      } else {
        // Extract key from current S3 URL
        const extractedKey = extractKeyFromS3Url(currentUser.profileImage);
        if (extractedKey) {
          key = extractedKey;
        } else {
          // Fallback: generate new key if we can't parse the existing one
          key = generateProfilePictureKey();
        }
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

    // Construct the complete URL from the presigned post response
    // The presigned post URL contains the bucket info
    const bucketUrl = presignedPost.url;
    const profileImageUrl = `${bucketUrl}/${key}`;
    
    return { profileImageUrl, isFirstCustomProfileImage };
    
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Delete a profile picture
 */
export const deleteProfilePicture = async (profileImageUrl: string): Promise<void> => {
  try {
    // Extract key from profile image URL
    const key = extractKeyFromS3Url(profileImageUrl);
    
    if (key) {
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
