/**
 * TypeScript types mirroring backend DTOs exactly
 * Do not modify these types without updating the corresponding backend DTOs
 */

/**
 * Mirrors AvailabilityResponseDto.java
 */
export interface AvailabilityResponseDto {
  available: boolean;
  slug: string;
}

/**
 * Mirrors PublicUserDto.java
 */
export interface PublicUserDto {
  name: string;
  email: string;
  description: string;
  profileImage: string | null;
  profileImageKey: string;
  providerUserName: string;
  providerAvatarUrl: string | null;
  socials: Record<string, string>;
}

/**
 * Mirrors ProviderRepo.java
 */
export interface ProviderRepo {
  // Unique id provided by the provider/backend (e.g. GitHub repo id)
  id?: number;
  name: string;
  description: string;
  html_url: string;
}

/**
 * Mirrors PortfolioSection from backend
 * This is referenced in multiple DTOs
 */
export interface PortfolioSection {
  sectionType: string;
  title: string;
  content: string;
  media: string[];
}

/**
 * Mirrors PortfolioCreateDto.java
 */
export interface PortfolioCreateDto {
  template: string;
  title: string;
  description: string;
  sections: PortfolioSection[];
}

/**
 * Mirrors PublicPortfolioDto.java
 */
export interface PublicPortfolioDto {
  id: string;
  template: string;
  title: string;
  description: string;
  sections: PortfolioSection[];
  media: string[];
  modelVersion: number;
  reservedSlug: string;
  isPublished: boolean;
}

/**
 * Mirrors PortfolioPatchDto.java
 */
export interface PortfolioPatchDto {
  template?: string;
  title?: string;
  description?: string;
  sections?: PortfolioSection[];
  modelVersion?: number;
}

/**
 * Mirrors PortfolioPublishDto.java
 */
export interface PortfolioPublishDto {
  url: string;
  published: boolean;
}

/**
 * Mirrors SavedSectionCreateDto.java
 */
export interface SavedSectionCreateDto {
  name: string;
  section: PortfolioSection;
}

/**
 * Mirrors PublicSavedSectionDto.java
 */
export interface PublicSavedSectionDto {
  id: string;
  name: string;
  section: PortfolioSection;
  version: number;
}

/**
 * Mirrors PresignRequestDto.java
 */
export interface PresignRequestDto {
  key: string;
  contentType: string;
  size: number;
  md5: string;
}

/**
 * Mirrors UserPatchDto.java
 */
export interface UserPatchDto {
  name?: string;
  email?: string;
  description?: string;
  avatarUrl?: string;
  socials?: Record<string, string>;
}

/**
 * For partial user updates - more flexible than UserPatchDto
 */
export type PartialUserDto = Partial<PublicUserDto>;

/**
 * Mirrors PublicPortfolioView.java
 */
export interface PublicPortfolioView {
  portfolioId: string;
  template: string;
  title: string;
  description: string;
  sections: PortfolioSection[];
}