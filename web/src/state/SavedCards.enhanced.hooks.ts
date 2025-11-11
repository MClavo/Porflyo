import { useCallback, useState } from 'react';
import { useSavedCards } from './SavedCards.hooks';
import { useSavedSectionsContext } from '../hooks/ui/useSavedSectionsContext';
import { createSavedSection, deleteSavedSection } from '../api/clients/savedSections.api';
import { uploadCardImages, isBlobUrl } from '../components/media/mediaService';
import type { AnyCard } from './Cards.types';
import type { SavedCard } from './SavedCards.types';
import type { SavedSectionCreateDto, PortfolioSection, PublicSavedSectionDto } from '../api/types';

/**
 * Enhanced hooks that integrate SavedCards state with API calls
 * Handles both local state and backend persistence
 */
export function useSavedCardsWithApi() {
  const { state, dispatch } = useSavedCards();
  const { sections, addSection, removeSection } = useSavedSectionsContext();
  const [hasLoadedFromApi, setHasLoadedFromApi] = useState(false);

  /**
   * Save a card both locally and to the backend
   */
  const saveCard = useCallback(async (
    card: AnyCard,
    originSectionId: string,
    originSectionType: string,
    name: string
  ): Promise<{ savedSection: PublicSavedSectionDto | undefined; updatedCard: AnyCard }> => {
    try {
      // Extract blob URLs from the card
      const blobUrls = extractBlobUrlsFromCard(card);
      
      // Upload images if there are any blob URLs
      let cardWithUploadedImages = card;
      if (blobUrls.length > 0) {
        const urlMapping = await uploadCardImages(blobUrls);
        cardWithUploadedImages = replaceCardImageUrls(card, urlMapping);
      }

      // Create the PortfolioSection object for the API
      const portfolioSection: PortfolioSection = {
        sectionType: originSectionType,
        title: cardWithUploadedImages.type,
        content: JSON.stringify(cardWithUploadedImages.data),
        media: extractMediaFromCard(cardWithUploadedImages)
      };

      const createDto: SavedSectionCreateDto = {
        name: name.trim() || `${cardWithUploadedImages.type} - ${new Date().toLocaleString()}`,
        section: portfolioSection
      };

      // Save to backend first
      const response = await createSavedSection(createDto);

      // If successful, save to local state with the uploaded images
      dispatch({
        type: 'SAVE_CARD',
        payload: { 
          card: cardWithUploadedImages, 
          originSectionId, 
          originSectionType, 
          name: createDto.name,
          apiId: response.data?.id
        }
      });

      // Add to global saved sections context
      if (response.data) {
        addSection(response.data);
      }

      return {
        savedSection: response.data,
        updatedCard: cardWithUploadedImages
      };
    } catch (error) {
      console.error('Failed to save card:', error);
      throw error;
    }
  }, [dispatch, addSection]);

  /**
   * Remove a saved card both locally and from the backend
   */
  const removeSavedCard = useCallback(async (savedCardId: string, apiId?: string) => {
    try {
      // If we have an API ID, delete from backend first
      if (apiId) {
        await deleteSavedSection(apiId);
        // Remove from global saved sections context
        removeSection(apiId);
      }

      // Remove from local state
      dispatch({
        type: 'REMOVE_SAVED_CARD',
        payload: { savedCardId }
      });
    } catch (error) {
      console.error('Failed to remove saved card:', error);
      throw error;
    }
  }, [dispatch, removeSection]);

  /**
   * Load saved cards from the global context (from API) into local state
   * Only loads once to avoid unnecessary re-processing
   */
  const loadSavedCardsFromApi = useCallback(() => {
    if (hasLoadedFromApi) return; // Don't load if already loaded
    
    const savedCardsFromApi: Record<string, SavedCard> = {};
    
    sections.forEach(section => {
      try {
        // Parse the card data from the API
        const cardData = JSON.parse(section.section.content);
        
        // Create a card object from the API data
        const card: AnyCard = {
          type: section.section.title as AnyCard['type'],
          data: cardData
        };
        
        // Create a saved card entry
        const savedCardId = crypto.randomUUID();
        savedCardsFromApi[savedCardId] = {
          id: savedCardId,
          name: section.name,
          card,
          originSectionId: 'unknown', // We don't have this info from API
          originSectionType: section.section.sectionType,
          createdAt: Date.now(), // We don't have creation time from API
          apiId: section.id
        };
      } catch (error) {
        console.error('Failed to parse saved section:', section, error);
      }
    });
    
    // Load into local state
    dispatch({
      type: 'LOAD_SAVED_CARDS',
      payload: { savedCards: savedCardsFromApi }
    });
    
    setHasLoadedFromApi(true);
  }, [hasLoadedFromApi, sections, dispatch]);

  return {
    savedCards: state.savedCards,
    saveCard,
    removeSavedCard,
    loadSavedCardsFromApi,
    dispatch // For other operations that don't need API calls
  };
}

/**
 * Extract media URLs/keys from a card's data
 * This function should be adapted based on how media is stored in different card types
 */
function extractMediaFromCard(card: AnyCard): string[] {
  const media: string[] = [];
  
  // Check common media fields in card data
  if (card.data) {
    const data = card.data as Record<string, unknown>;
    
    // Common image fields
    if (data.image && typeof data.image === 'string') {
      media.push(data.image);
    }
    if (data.imageUrl && typeof data.imageUrl === 'string') {
      media.push(data.imageUrl);
    }
    if (data.imageKey && typeof data.imageKey === 'string') {
      media.push(data.imageKey);
    }
    if (data.url && typeof data.url === 'string') {
      media.push(data.url);
    }
    
    // Handle arrays of media
    if (Array.isArray(data.images)) {
      media.push(...data.images.filter((img: unknown) => typeof img === 'string'));
    }
    if (Array.isArray(data.media)) {
      media.push(...data.media.filter((item: unknown) => typeof item === 'string'));
    }
    
    // Handle nested objects (recursively check one level deep)
    Object.values(data).forEach(value => {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const nestedData = value as Record<string, unknown>;
        if (nestedData.image && typeof nestedData.image === 'string') {
          media.push(nestedData.image);
        }
        if (nestedData.imageUrl && typeof nestedData.imageUrl === 'string') {
          media.push(nestedData.imageUrl);
        }
        if (nestedData.imageKey && typeof nestedData.imageKey === 'string') {
          media.push(nestedData.imageKey);
        }
        if (nestedData.url && typeof nestedData.url === 'string') {
          media.push(nestedData.url);
        }
      }
    });
  }
  
  return [...new Set(media)]; // Remove duplicates
}

/**
 * Extract blob URLs from a card's data
 */
function extractBlobUrlsFromCard(card: AnyCard): string[] {
  const allUrls = extractMediaFromCard(card);
  return allUrls.filter(url => isBlobUrl(url));
}

/**
 * Replace blob URLs in a card with S3 URLs
 */
function replaceCardImageUrls(card: AnyCard, urlMapping: Record<string, string>): AnyCard {
  if (Object.keys(urlMapping).length === 0) {
    return card;
  }

  // Deep clone the card to avoid mutation
  const newCard = JSON.parse(JSON.stringify(card)) as AnyCard;
  
  // Replace URLs in the card data
  replaceUrlsInObject(newCard.data as Record<string, unknown>, urlMapping);
  
  return newCard;
}

/**
 * Recursively replace URLs in an object
 */
function replaceUrlsInObject(obj: Record<string, unknown>, urlMapping: Record<string, string>): void {
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    
    if (typeof value === 'string' && urlMapping[value]) {
      obj[key] = urlMapping[value];
    } else if (Array.isArray(value)) {
      obj[key] = value.map(item => 
        typeof item === 'string' && urlMapping[item] ? urlMapping[item] : item
      );
    } else if (value && typeof value === 'object') {
      replaceUrlsInObject(value as Record<string, unknown>, urlMapping);
    }
  });
}
