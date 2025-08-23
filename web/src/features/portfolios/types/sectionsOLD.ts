/**
 * Portfolio section types and schemas
 */

export type SectionKind = 
  | 'ABOUT'
  | 'TEXT' 
  | 'TEXT_WITH_IMAGE_LEFT'
  | 'TEXT_WITH_IMAGE_RIGHT'
  | 'REPO'
  | 'REPO_LIST'
  | 'GALLERY_LARGE'
  | 'GALLERY_SMALL'
  | 'GALLERY_GRID';

/**
 * Base section interface
 */
export interface BaseSection {
  id: string;
  kind: SectionKind;
  position: number;
}

/**
 * About section - fixed at position 0
 */
export interface AboutSection extends BaseSection {
  kind: 'ABOUT';
  avatar?: string;
  name: string;
  socials: Record<string, string>;
  email: string;
  showUserDescription: boolean;
}

/**
 * Text section
 */
export interface TextSection extends BaseSection {
  kind: 'TEXT';
  title: string;
  content: string;
  links?: { text: string; url: string; }[];
}

/**
 * Text with image sections
 */
export interface TextWithImageSection extends BaseSection {
  kind: 'TEXT_WITH_IMAGE_LEFT' | 'TEXT_WITH_IMAGE_RIGHT';
  title: string;
  content: string;
  image: string;
  links?: { text: string; url: string; }[];
}

/**
 * Repository sections
 */
export interface RepoSection extends BaseSection {
  kind: 'REPO';
  repoId: string; // Backend's canonical repo id
}

export interface RepoListSection extends BaseSection {
  kind: 'REPO_LIST';
  repoIds: string[]; // Backend's canonical repo ids
}

/**
 * Gallery sections
 */
export interface GallerySection extends BaseSection {
  kind: 'GALLERY_LARGE' | 'GALLERY_SMALL' | 'GALLERY_GRID';
  images: string[];
}

/**
 * Union type for all sections
 */
export type PortfolioSectionData = 
  | AboutSection
  | TextSection
  | TextWithImageSection
  | RepoSection
  | RepoListSection
  | GallerySection;

/**
 * Section configuration limits
 */
export const SECTION_LIMITS = {
  MAX_SECTIONS: 10, // Including ABOUT
  MAX_TITLE_LENGTH: 50,
  MAX_CONTENT_LENGTH: 1200, // Configurable
  MAX_IMAGES_PER_PORTFOLIO: 10, // Excludes user avatar
  MAX_LINKS_PER_SECTION: 5,
} as const;

/**
 * Section display names
 */
export const SECTION_DISPLAY_NAMES: Record<SectionKind, string> = {
  ABOUT: 'About',
  TEXT: 'Text',
  TEXT_WITH_IMAGE_LEFT: 'Text with Image (Left)',
  TEXT_WITH_IMAGE_RIGHT: 'Text with Image (Right)',
  REPO: 'Repository',
  REPO_LIST: 'Repository List',
  GALLERY_LARGE: 'Gallery (Large)',
  GALLERY_SMALL: 'Gallery (Small)',
  GALLERY_GRID: 'Gallery (Grid)',
};

/**
 * Sections that can contain images (for image limit calculation)
 */
export const IMAGE_CONTAINING_SECTIONS: SectionKind[] = [
  'TEXT_WITH_IMAGE_LEFT',
  'TEXT_WITH_IMAGE_RIGHT',
  'GALLERY_LARGE',
  'GALLERY_SMALL',
  'GALLERY_GRID',
];
