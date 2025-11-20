import MD5 from 'crypto-js/md5';
import Base64 from 'crypto-js/enc-base64';
import WordArray from 'crypto-js/lib-typedarrays';
import type { PresignRequestDto } from '../types/dto';

export interface PresignedPutResponse {
  url: string;
  fields: Record<string, string>;
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
        const wordArray = WordArray.create(arrayBuffer);
        const md5 = MD5(wordArray);
        // Convert to base64 as expected by S3
        const md5Base64 = Base64.stringify(md5);
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
  requests: PresignRequestDto[]
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
 * Check if URL is a blob URL (created by URL.createObjectURL)
 */
export const isBlobUrl = (url: string): boolean => {
  return url.startsWith('blob:');
};

/**
 * Generate a unique key for an image upload
 * @param context - 'saved-card' for saved cards (svd/ prefix) or 'portfolio' for portfolio images (ptf/ prefix)
 */
export const generateImageKey = (context: 'saved-card' | 'portfolio' = 'portfolio'): string => {
  const prefix = context === 'saved-card' ? 'svd' : 'ptf';
  return `${prefix}/${crypto.randomUUID()}.webp`;
};

/**
 * Get the appropriate image URL based on environment
 * Cleans presigned URLs by removing query parameters
 */
export const getImageUrl = (key: string, presignedUrl?: string): string => {
  if (import.meta.env.PROD) {
    return `https://media.porflyo.com/${key}`;
  } else {
    // In development, use the presigned URL but remove query parameters
    if (presignedUrl) {
      // Remove everything from the first "?" onwards
      return presignedUrl.split('?')[0];
    }
    throw new Error('presignedUrl is required in development');
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

/**
 * Upload a profile picture
 */
export const uploadProfilePicture = async (
  imageBlob: Blob,
  profileImageKey: string
): Promise<void> => {
  try {
    const uploadRequest: PresignRequestDto = {
      key: profileImageKey,
      contentType: 'image/webp',
      size: imageBlob.size,
      md5: await calculateMD5(imageBlob),
    };

    // Get presigned URL
    const presignedPuts = await requestPresignedPost([uploadRequest]);
    const presignedPut = presignedPuts[0];

    // Upload to S3
    await uploadToS3(presignedPut, imageBlob);
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    throw error;
  }
};

/**
 * Retrieve blob from blob URL
 * This is a global registry managed by the browser
 */
const getBlobFromBlobUrl = async (blobUrl: string): Promise<Blob> => {
  const response = await fetch(blobUrl);
  return response.blob();
};

/**
 * Upload multiple blob images and return URL mapping
 * @param blobsWithUrls - Array of {blobUrl, blob} pairs. If blob is provided, it will be used directly.
 * @param context - 'saved-card' for saved cards (svd/ prefix) or 'portfolio' for portfolio images (ptf/ prefix)
 */
export const uploadBlobImages = async (
  blobsWithUrls: Array<{ blobUrl: string; blob?: Blob }>,
  context: 'saved-card' | 'portfolio' = 'portfolio'
): Promise<Record<string, string>> => {
  if (blobsWithUrls.length === 0) {
    return {};
  }

  const urlMapping: Record<string, string> = {};
  const uploadRequests: PresignRequestDto[] = [];
  const blobsWithKeys: Array<{ blob: Blob; key: string; originalUrl: string }> = [];

  // Prepare upload requests for each blob
  for (const { blobUrl, blob } of blobsWithUrls) {
    try {
      // Use provided blob or fetch from blob URL
      const blobToUpload = blob || await getBlobFromBlobUrl(blobUrl);
      
      const key = generateImageKey(context);
      const md5 = await calculateMD5(blobToUpload);
      
      uploadRequests.push({
        key,
        contentType: 'image/webp',
        size: blobToUpload.size,
        md5,
      });
      
      blobsWithKeys.push({
        blob: blobToUpload,
        key,
        originalUrl: blobUrl,
      });
    } catch (error) {
      console.error(`Failed to prepare upload for ${blobUrl}:`, error);
      throw error;
    }
  }

  try {
    // Get presigned URLs for all images
    const presignedPuts = await requestPresignedPost(uploadRequests);

    // Upload all images
    await Promise.all(
      blobsWithKeys.map(async ({ blob, key, originalUrl }, index) => {
        try {
          await uploadToS3(presignedPuts[index], blob);
          // Use presigned URL but remove query parameters (everything after "?")
          const newUrl = getImageUrl(key, presignedPuts[index].url);
          urlMapping[originalUrl] = newUrl;
        } catch (error) {
          console.error(`Failed to upload image ${originalUrl}:`, error);
          throw error;
        }
      })
    );

    return urlMapping;
  } catch (error) {
    console.error('Failed to upload blob images:', error);
    throw error;
  }
};
