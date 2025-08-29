import CryptoJS from 'crypto-js';

export interface PresignedPutResponse {
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
 * Calculate MD5 hash of a blob in base64 format (as expected by S3)
 */
export const calculateMD5 = async (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer);
        const md5 = CryptoJS.MD5(wordArray);
        // Convert to base64 as expected by S3
        const md5Base64 = CryptoJS.enc.Base64.stringify(md5);
        resolve(md5Base64);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(blob);
  });
};

/**
 * Request a presigned PUT URL from the backend
 */
export const requestPresignedPost = async (
  requests: MediaUploadRequest[]
): Promise<PresignedPutResponse[]> => {
  const response = await fetch('/api/media', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(requests),
  });

  if (!response.ok) {
    throw new Error(`Failed to get presigned URLs: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Upload a file to S3 using presigned PUT
 */
export const uploadToS3 = async (
  presignedPut: PresignedPutResponse,
  file: Blob
): Promise<void> => {
  // For presigned PUT, we need to send the file directly with the signed headers
  const headers: Record<string, string> = {};
  
  // Add the signed headers
  Object.entries(presignedPut.fields).forEach(([key, value]) => {
    headers[key] = value as string;
  });

  const response = await fetch(presignedPut.url, {
    method: 'PUT',
    headers: headers,
    body: file,
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
 * Check if URL is a GitHub avatar URL
 */
export const isGitHubAvatarUrl = (url: string): boolean => {
  return url.includes('avatars.githubusercontent.com');
};

/**
 * Complete workflow to upload a profile picture
 * Now simplified since the backend provides profileImageKey directly
 */
export const uploadProfilePicture = async (
  imageBlob: Blob,
  profileImageKey: string
): Promise<void> => {
  try {
    // For now, let's try without MD5 to see if that's causing the issue
    const uploadRequest: MediaUploadRequest = {
      key: profileImageKey,
      contentType: 'image/webp',
      size: imageBlob.size,
      md5: await calculateMD5(imageBlob), // Calculate MD5 for testing
    };

    // Get presigned URL
  // requestPresignedPost now accepts an array and returns an array.
  const presignedPuts = await requestPresignedPost([uploadRequest]);

  // Use the first presigned response for this single upload
  const presignedPut = presignedPuts[0];

  // Upload to S3
  await uploadToS3(presignedPut, imageBlob);
    
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Delete a profile picture using the profileImageKey
 */
export const deleteProfilePicture = async (profileImageKey: string): Promise<void> => {
  try {
    const response = await fetch(`/api/media/${encodeURIComponent(profileImageKey)}`, {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(`Failed to delete profile picture: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    // Don't throw error for delete operations to avoid blocking the UI
  }
};
