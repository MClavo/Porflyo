import type { PublicSavedSectionDto } from "../api/types";
import type { SavedCard } from "./SavedCards.types";
import type { AnyCard } from "./Cards.types";

/**
 * Convert PublicSavedSectionDto to SavedCard
 * Extracts createdAt from the card content and removes it
 */
export function savedSectionToSavedCard(section: PublicSavedSectionDto): SavedCard | null {
  try {
    // Parse the content which should be a JSON string containing the card with createdAt
    const cardWithTimestamp = JSON.parse(section.section.content) as AnyCard & { createdAt?: number };
    
    // Extract createdAt and remove it from the card
    const { createdAt, ...card } = cardWithTimestamp;
    
    return {
      id: crypto.randomUUID(), // Generate a local ID
      name: section.name,
      card: card as AnyCard,
      originSectionId: "", // Not stored in saved sections
      originSectionType: section.section.sectionType,
      createdAt: createdAt || Date.now(), // Use extracted createdAt or fallback to current time
      apiId: section.id // Store the backend ID
    };
  } catch (error) {
    console.error("Failed to parse saved section:", error);
    return null;
  }
}
