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
  profileImage: string | null; // URI in Java becomes string in TS
  profileImageKey: string;
  providerUserName: string;
  providerAvatarUrl: string | null; // URI in Java becomes string in TS
  socials: Record<string, string>;
}

/**
 * Mirrors ProviderRepo.java
 */
export interface ProviderRepo {
  name: string;
  description: string;
  html_url: string;
}

/**
 * Mirrors PortfolioSection from backend
 * This is referenced in multiple DTOs
 */
export interface PortfolioSection {
  [key: string]: unknown; // Flexible structure as defined in backend
}

/**
 * Mirrors PortfolioCreateDto.java
 */
export interface PortfolioCreateDto {
  template: string; // @NotBlank
  title: string;
  description: string;
  sections: PortfolioSection[]; // @NotNull @Valid
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
  template?: string; // Optional<String> in Java
  title?: string;
  description?: string;
  sections?: PortfolioSection[];
  modelVersion?: number;
}

/**
 * Mirrors PortfolioPublishDto.java
 */
export interface PortfolioPublishDto {
  url: string; // @NotBlank
  published: boolean; // @NotNull
}

/**
 * Mirrors SavedSectionCreateDto.java
 */
export interface SavedSectionCreateDto {
  name: string; // @NotBlank
  section: PortfolioSection; // @NotNull @Valid
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
  size: number; // long in Java becomes number in TS
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
 * Mirrors PublicPortfolioView.java
 */
export interface PublicPortfolioView {
  portfolioId: string; // Used for Metrics
  template: string;
  title: string;
  description: string;
  sections: PortfolioSection[];
}
