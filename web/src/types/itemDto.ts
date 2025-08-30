// Types for different kinds of items that can be added to portfolio sections

export type ItemType = 'text' | 'character' | 'doubleText' | 'savedItem' | 'textPhoto' | 'userProfile';

export interface BaseItem {
  id: number;
  type: ItemType;
  sectionType: import('./sectionDto').SectionType;
}

export interface TextItem extends BaseItem {
  type: 'text';
  text: string;
}

export interface CharacterItem extends BaseItem {
  type: 'character';
  character: string;
}

export interface DoubleTextItem extends BaseItem {
  type: 'doubleText';
  text1: string;
  text2: string;
}

export interface TextPhotoItem extends BaseItem {
  type: 'textPhoto';
  text1: string;
  text2: string;
  imageUrl: string;
  imageFile?: File; // Temporary storage for compressed file before S3 upload
}

export interface SavedItem extends BaseItem {
  type: 'savedItem';
  savedName: string;
  dbId?: string; // ID from the database - optional for backward compatibility or error cases
  originalItem: TextItem | CharacterItem | DoubleTextItem | TextPhotoItem;
}

export interface UserProfileItem extends BaseItem {
  type: 'userProfile';
  userInfo: import('./userDto').PortfolioUserInfo;
}

export type PortfolioItem = TextItem | CharacterItem | DoubleTextItem | SavedItem | TextPhotoItem | UserProfileItem;

export type EditItemProps = {
  id: string;
  item?: PortfolioItem | undefined;
  editable?: boolean;
  onItemUpdate?: (id: string, updated: Partial<PortfolioItem>) => void;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
  className?: string;
  style?: React.CSSProperties;
  // Context information for styling
  sectionId?: string;
  templateId?: string;
};