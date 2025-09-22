import { useEffect, useRef } from "react";
import { SavedCards } from "../../components/savedcards";
import { useSavedCardsWithApi } from "../../state/SavedCards.enhanced.hooks";
import { useSavedSectionsContext } from "../../hooks/useSavedSectionsContext";
import { isBlobUrl } from "../../components/media/mediaService";
import type { TemplateKey } from "../../templates/Template.types";
import type { Mode } from "../../components/cards/subcomponents/Fields.types";
import type { AnyCard } from "../../state/Cards.types";

/**
 * Extract URL mapping by comparing original card with updated card
 */
function extractUrlMappingFromCards(originalCard: AnyCard, updatedCard: AnyCard): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  // Simple approach: find all URLs in both cards and match blob URLs with their replacements
  const originalUrls = extractAllUrlsFromCard(originalCard);
  const updatedUrls = extractAllUrlsFromCard(updatedCard);
  
  // For each blob URL in original, find its replacement in updated
  originalUrls.forEach((originalUrl, index) => {
    if (isBlobUrl(originalUrl) && updatedUrls[index] && !isBlobUrl(updatedUrls[index])) {
      mapping[originalUrl] = updatedUrls[index];
    }
  });
  
  return mapping;
}

/**
 * Extract all URLs from a card's data
 */
function extractAllUrlsFromCard(card: AnyCard): string[] {
  const urls: string[] = [];
  
  if (card.data) {
    const data = card.data as Record<string, unknown>;
    extractUrlsFromObject(data, urls);
  }
  
  return urls;
}

/**
 * Recursively extract URLs from an object
 */
function extractUrlsFromObject(obj: Record<string, unknown>, urls: string[]): void {
  Object.values(obj).forEach(value => {
    if (typeof value === 'string' && (value.startsWith('http') || value.startsWith('blob:'))) {
      urls.push(value);
    } else if (Array.isArray(value)) {
      value.forEach(item => {
        if (typeof item === 'string' && (item.startsWith('http') || item.startsWith('blob:'))) {
          urls.push(item);
        }
      });
    } else if (value && typeof value === 'object') {
      extractUrlsFromObject(value as Record<string, unknown>, urls);
    }
  });
}

export default function SavedSidebar(props: {
  mode: Mode;
  template: TemplateKey;
  onImageUrlsReplaced?: (urlMapping: Record<string, string>) => void;
}) {
  const { mode, template, onImageUrlsReplaced } = props;
  
  // Use enhanced hooks that handle API calls
  const { savedCards, saveCard, removeSavedCard, loadSavedCardsFromApi } = useSavedCardsWithApi();
  const { isLoaded: savedSectionsLoaded } = useSavedSectionsContext();
  
  // Use ref to track if we've already tried to load
  const hasTriedToLoadRef = useRef(false);

  // Load saved cards from API when saved sections are loaded
  useEffect(() => {
    if (savedSectionsLoaded && !hasTriedToLoadRef.current) {
      hasTriedToLoadRef.current = true;
      loadSavedCardsFromApi();
    }
  }, [savedSectionsLoaded, loadSavedCardsFromApi]);

  // Handle saving a card (with API call)
  const handleSave = async (card: AnyCard, originSectionId: string, originSectionType: string, name: string) => {
    try {
      const { savedSection, updatedCard } = await saveCard(card, originSectionId, originSectionType, name);
      
      // If images were uploaded and URLs were replaced, notify the parent to update the portfolio
      if (onImageUrlsReplaced) {
        // Extract blob URLs from original card and compare with updated card to get the mapping
        const urlMapping = extractUrlMappingFromCards(card, updatedCard);
        if (Object.keys(urlMapping).length > 0) {
          onImageUrlsReplaced(urlMapping);
        }
      }
      
      console.log('Card saved successfully:', savedSection?.id);
    } catch (error) {
      console.error('Failed to save card:', error);
      // Could show a notification here
    }
  };

  // Handle removing a card (with API call)
  const handleRemove = async (savedCardId: string) => {
    try {
      // Find the saved card to get its API ID
      const savedCard = savedCards[savedCardId];
      await removeSavedCard(savedCardId, savedCard?.apiId);
    } catch (error) {
      console.error('Failed to remove card:', error);
      // Could show a notification here
    }
  };

  return (
    <div className="saved-cards-sidebar">
      <SavedCards
        savedCards={savedCards}
        mode={mode}
        template={template}
        onSave={handleSave}
        onRename={() => {
          // Renamed functionality removed as requested
        }}
        onRemove={handleRemove}
        onUse={() => {
          // handled by dnd 
        }}
      />
    </div>
  );
}
