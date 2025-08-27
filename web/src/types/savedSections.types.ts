// Types for the saved sections API

export interface PortfolioSection {
  sectionType: string;
  title: string;
  content: string;
  media: string[];
}

export interface SavedSectionCreateDto {
  name: string;
  section: PortfolioSection;
}

export interface PublicSavedSectionDto {
  id: string;
  name: string;
  section: PortfolioSection;
  version: number;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
}
