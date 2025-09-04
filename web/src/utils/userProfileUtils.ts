import type { PortfolioItem, UserProfileItem } from '../types/itemDto';
import type { PortfolioUserInfo } from '../types/userDto';
import type { PortfolioSection } from '../types/sectionDto';

// Constants for the special userProfile item
export const USER_PROFILE_ITEM_ID = '__user_profile__';
export const USER_PROFILE_ITEM_TYPE = 'userProfile' as const;

/**
 * Creates a userProfile item from user info
 */
export function createUserProfileItem(userInfo: PortfolioUserInfo): UserProfileItem {
  return {
    id: Date.now(), // Will be replaced with proper ID when saved
    type: USER_PROFILE_ITEM_TYPE,
    sectionType: 'user',
    userInfo,
  };
}

/**
 * Extracts user info from portfolio data by looking for userProfile items in JSON content
 */
export function extractUserInfoFromPortfolio(
  sections: PortfolioSection[],
  items: Record<string, string[]>,
  itemsData: Record<string, PortfolioItem>
): PortfolioUserInfo | null {
  // Look for user section
  const userSection = sections.find(s => s.type === 'user');
  if (!userSection) return null;

  // Look for userProfile items in the user section
  const userSectionItems = items[userSection.id] || [];
  
  for (const itemId of userSectionItems) {
    const item = itemsData[itemId];
    if (item?.type === 'userProfile') {
      return (item as UserProfileItem).userInfo;
    }
  }

  return null;
}

/**
 * Extracts user info from backend portfolio sections by parsing JSON content
 */
export function extractUserInfoFromBackendPortfolio(
  backendSections: Array<Record<string, unknown>>
): PortfolioUserInfo | null {
  // Look for user section in backend data
  const userSection = backendSections.find(section => section.sectionType === 'user');
  if (!userSection) return null;

  try {
    const content = userSection.content;
    if (content && typeof content === 'string') {
      const sectionItems = JSON.parse(content);
      if (Array.isArray(sectionItems)) {
        for (const item of sectionItems) {
          if (item && typeof item === 'object' && item.type === 'userProfile' && item.userInfo) {
            return item.userInfo as PortfolioUserInfo;
          }
        }
      }
    }
  } catch (error) {
    console.error('Failed to parse user section content:', error);
  }

  return null;
}

/**
 * Injects or updates userProfile item in the user section
 */
export function injectUserInfoIntoPortfolio(
  sections: PortfolioSection[],
  items: Record<string, string[]>,
  itemsData: Record<string, PortfolioItem>,
  userInfo: PortfolioUserInfo
): {
  sections: PortfolioSection[];
  items: Record<string, string[]>;
  itemsData: Record<string, PortfolioItem>;
} {
  // Find or create user section
  let userSection = sections.find(s => s.type === 'user');
  const updatedSections = [...sections];
  
  if (!userSection) {
    // Create user section if it doesn't exist
    userSection = {
      id: 'user',
      type: 'user',
      title: 'User Profile',
      columns: 1,
      rows: 1,
      allowedItemTypes: ['userProfile'],
      items: [],
    };
    updatedSections.push(userSection);
  }

  const updatedItems = { ...items };
  const updatedItemsData = { ...itemsData };
  
  // Look for existing userProfile item
  const userSectionItems = updatedItems[userSection.id] || [];
  let userProfileItemId = null;
  
  for (const itemId of userSectionItems) {
    const item = updatedItemsData[itemId];
    if (item?.type === 'userProfile') {
      userProfileItemId = itemId;
      break;
    }
  }

  if (userProfileItemId) {
    // Update existing userProfile item
    const existingItem = updatedItemsData[userProfileItemId] as UserProfileItem;
    updatedItemsData[userProfileItemId] = {
      ...existingItem,
      userInfo,
    };
  } else {
    // Create new userProfile item
    const newItemId = USER_PROFILE_ITEM_ID;
    const newItem = createUserProfileItem(userInfo);
    
    updatedItemsData[newItemId] = newItem;
    updatedItems[userSection.id] = [...userSectionItems, newItemId];
  }

  return {
    sections: updatedSections,
    items: updatedItems,
    itemsData: updatedItemsData,
  };
}
