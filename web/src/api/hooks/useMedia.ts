import { useCallback } from 'react';
import { uploadBlobImages, isBlobUrl } from '../clients/media.api';
import type { AnyCard } from '../../state/Cards.types';

/**
 * Hook for managing media uploads for cards
 */
export const useMedia = () => {
  /**
   * Process a card and upload any blob images, returning:
   * - The card with updated S3 URLs
   * - A mapping of blob URLs to S3 URLs
   */
  const processCardImages = useCallback(async <T extends AnyCard>(
    card: T
  ): Promise<{ card: T; urlMapping: Record<string, string> }> => {
    const blobUrls: string[] = [];

    // Extract blob URLs from card data
    const extractImages = (data: Record<string, unknown>) => {
      // Check for images array (ProjectCard)
      if (data.images && Array.isArray(data.images)) {
        data.images.forEach((url: string) => {
          if (isBlobUrl(url)) {
            blobUrls.push(url);
          }
        });
      }

      // Check for single image field (CertificateCard)
      if (data.image && typeof data.image === 'string' && isBlobUrl(data.image)) {
        blobUrls.push(data.image);
      }

      // Check for profileImage (AboutCard)
      if (data.profileImage && typeof data.profileImage === 'string' && isBlobUrl(data.profileImage)) {
        blobUrls.push(data.profileImage);
      }
    };

    extractImages(card.data);

    // If no blob URLs found, return the card as-is
    if (blobUrls.length === 0) {
      return { card, urlMapping: {} };
    }

    // Upload all blob images and get the URL mapping
    const urlMapping = await uploadBlobImages(
      blobUrls.map(blobUrl => ({ blobUrl }))
    );

    // Create a deep copy of the card to avoid mutating the original
    const updatedCard = JSON.parse(JSON.stringify(card)) as T;

    // Replace blob URLs with S3 URLs
    const replaceUrls = (data: Record<string, unknown>) => {
      if (data.images && Array.isArray(data.images)) {
        data.images = data.images.map((url: string) => urlMapping[url] || url);
      }

      if (data.image && typeof data.image === 'string') {
        data.image = urlMapping[data.image] || data.image;
      }

      if (data.profileImage && typeof data.profileImage === 'string') {
        data.profileImage = urlMapping[data.profileImage] || data.profileImage;
      }
    };

    replaceUrls(updatedCard.data);

    return { card: updatedCard, urlMapping };
  }, []);

  return {
    processCardImages,
  };
};
