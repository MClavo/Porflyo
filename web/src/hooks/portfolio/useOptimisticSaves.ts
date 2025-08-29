import { useCallback, useState } from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { PortfolioItem, SavedItem, TextPhotoItem } from '../../types/itemDto';
import { mapPortfolioItemToCreateDto } from '../../mappers/savedSections.mapper';
import { requestPresignedPost, uploadToS3, calculateMD5 } from '../../services/mediaService';
import type { ItemsRef, PendingDelete, PendingSave } from './types';
import type { SavedSectionCreateDto, PublicSavedSectionDto } from '../../types/savedSections.types';

/**
 * Remove the imageFile property from a TextPhotoItem
 */
function removeImageFile(item: TextPhotoItem): Omit<TextPhotoItem, 'imageFile'> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(item)) {
    if (key !== 'imageFile') {
      result[key] = value;
    }
  }
  return result as Omit<TextPhotoItem, 'imageFile'>;
}

/**
 * Generate a random key for image uploads
 */
function generateImageKey(prefix: string = 'portfolio'): string {
  const uuid = crypto.randomUUID();
  const timestamp = Date.now();
  return `${prefix}/${timestamp}-${uuid}.webp`;
}

/**
 * Upload an image file and return the public URL
 * TODO: The backend should provide the public URL in the response
 */
async function uploadImageFile(file: File): Promise<string> {
  try {
    const key = generateImageKey();
    const md5 = await calculateMD5(file);
    
    // Request presigned URL from backend
    const presignedResponses = await requestPresignedPost([{
      key,
      contentType: file.type,
      size: file.size,
      md5,
    }]);
    
    // Upload to S3
    await uploadToS3(presignedResponses[0], file);
    
    // TODO: The backend should return the public URL after successful upload
    // For now, we construct it from the S3 URL structure
    // In production, there should be a separate endpoint to get the public URL
    // or the presigned response should include the public URL
    const presignedUrl = presignedResponses[0].url;
    const publicUrl = presignedUrl.split('?')[0]; // Remove query parameters
    
    console.log(`📁 Image uploaded successfully: ${publicUrl}`);
    return publicUrl;
  } catch (error) {
    console.error('Failed to upload image:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Process a portfolio item with images and upload them
 */
async function processItemImages(item: PortfolioItem): Promise<PortfolioItem> {
  if (item.type !== 'textPhoto') {
    return item;
  }
  
  const textPhotoItem = item as TextPhotoItem;
  
  // If there's an imageFile, upload it
  if (textPhotoItem.imageFile) {
    try {
      // Upload the compressed image
      const publicUrl = await uploadImageFile(textPhotoItem.imageFile);
      
      // Return the item with the public URL and remove the temporary file
      const itemWithoutFile = removeImageFile(textPhotoItem);
      return {
        ...itemWithoutFile,
        imageUrl: publicUrl,
      };
    } catch (error) {
      console.error('Failed to upload image for item:', error);
      // Return the item without the image if upload fails
      const itemWithoutFile = removeImageFile(textPhotoItem);
      return itemWithoutFile;
    }
  }
  
  return item;
}

/**
 * Check if an item has local images that need to be uploaded
 */
function hasLocalImages(item: PortfolioItem): boolean {
  if (item.type === 'textPhoto') {
    const textPhotoItem = item as TextPhotoItem;
    return !!textPhotoItem.imageFile;
  }
  return false;
}

export function useOptimisticSaves(
  itemsRef: ItemsRef,
  createSavedSectionMutation: { mutateAsync: (dto: SavedSectionCreateDto) => Promise<PublicSavedSectionDto> },
  deleteSavedSectionMutation: { mutateAsync: (id: string) => Promise<void> },
) {
  const { items, setItems, setItemsData } = itemsRef;

  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingSaveItem, setPendingSaveItem] = useState<PendingSave | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [pendingDeleteItem, setPendingDeleteItem] = useState<PendingDelete | null>(null);

  const promptSave = useCallback((payload: PendingSave) => {
    setPendingSaveItem(payload);
    setShowSaveDialog(true);
  }, []);

  const handleSaveItem = useCallback(async (name: string) => {
    if (!pendingSaveItem) return;
    const { item, targetZone, targetId, originalItemId } = pendingSaveItem;

    // Check if the item has local images that need to be uploaded
    const needsImageUpload = hasLocalImages(item);
    
    if (needsImageUpload) {
      setIsUploading(true);
      setUploadProgress('Compressing and uploading images...');
    }

    // Create optimistic saved item
    const newId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}` as UniqueIdentifier;
    let processedItem = item.type === 'savedItem' ? (item as SavedItem).originalItem : (item as PortfolioItem);
    let originalImageUrl: string | undefined;
    
    // If the item has local images, show uploading state
    if (needsImageUpload) {
      console.log('📤 Uploading images to S3...');
      try {
        setUploadProgress('Uploading to S3...');
        processedItem = await processItemImages(processedItem);
        
        // Extract the new image URL for syncing with original item
        if (processedItem.type === 'textPhoto') {
          originalImageUrl = (processedItem as TextPhotoItem).imageUrl;
        }
        
        console.log('✅ Images uploaded successfully');
        setUploadProgress('Images uploaded successfully!');
      } catch (error) {
        console.error('❌ Failed to upload images:', error);
        alert('Failed to upload images. The item will be saved without the images.');
        setUploadProgress('Upload failed, saving without images...');
      } finally {
        setIsUploading(false);
        setUploadProgress('');
      }
    }

    const savedItem: SavedItem = {
      id: Date.now(),
      type: 'savedItem',
      sectionType: 'savedItems',
      savedName: name,
      originalItem: processedItem as SavedItem['originalItem'],
    };

    setItemsData((d) => ({ ...d, [newId]: savedItem }));

    // Update the original item with the new image URL if available and we have the originalItemId
    if (originalImageUrl && originalItemId && item.type === 'textPhoto') {
      console.log('🔄 Syncing image URL to original item:', { originalItemId, originalImageUrl });
      
      setItemsData((prevData) => {
        const updatedData = { ...prevData };
        
        // Update the specific original item using its unique ID
        if (updatedData[originalItemId] && updatedData[originalItemId].type === 'textPhoto') {
          console.log(`📝 Updating original item ${originalItemId} with new image URL`);
          updatedData[originalItemId] = {
            ...updatedData[originalItemId],
            imageUrl: originalImageUrl
          } as TextPhotoItem;
        }
        
        return updatedData;
      });
    }

    const insertIndex = (items[targetZone] ?? []).indexOf(targetId);
    setItems((prev) => {
      const dest = prev[targetZone] ?? [];
      const idx = insertIndex >= 0 ? insertIndex : dest.length;
      return { ...prev, [targetZone]: [...dest.slice(0, idx), newId, ...dest.slice(idx)] };
    });

    setPendingSaveItem(null);
    setShowSaveDialog(false);

    try {
      const dto = mapPortfolioItemToCreateDto(processedItem, name);
      const savedInDb = await createSavedSectionMutation.mutateAsync(dto);
      setItemsData((d) => ({ ...d, [newId]: { ...d[newId], dbId: savedInDb.id } }));
    } catch (error) {
      console.error('Failed to save item to database:', error);
      // Optionally show a toast notification
    }
  }, [pendingSaveItem, items, setItems, setItemsData, createSavedSectionMutation]);

  const handleCancelSave = useCallback(() => {
    setPendingSaveItem(null);
    setShowSaveDialog(false);
  }, []);

  const askDelete = useCallback((payload: PendingDelete) => {
    setPendingDeleteItem(payload);
    setShowDeleteDialog(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDeleteItem) return;
    const { id, item } = pendingDeleteItem;

    setShowDeleteDialog(false);
    setPendingDeleteItem(null);

    setItems((prev) =>
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: prev[key].filter((x) => x !== id) }), {} as typeof items),
    );
    setItemsData((prev) => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });

    if (item.type === 'savedItem' && (item as SavedItem).dbId) {
      try {
  await deleteSavedSectionMutation.mutateAsync((item as SavedItem).dbId as string);
      } catch {
        /* opcional: toast */
      }
    }
  }, [pendingDeleteItem, setItems, setItemsData, deleteSavedSectionMutation]);

  const handleCancelDelete = useCallback(() => {
    setPendingDeleteItem(null);
    setShowDeleteDialog(false);
  }, []);

  return {
    // save
    showSaveDialog, pendingSaveItem, promptSave, handleSaveItem, handleCancelSave,
    isUploading, uploadProgress,
    // delete
    showDeleteDialog, pendingDeleteItem, askDelete, handleConfirmDelete, handleCancelDelete,
  };
}
