/**
 * Re-export all API hooks for easier imports
 */

// User hooks
export * from '../features/user/hooks/useUser';

// Repos hooks
export * from '../features/repos/hooks/useRepos';

// Saved Sections API
export type { 
  PortfolioSection, 
  SavedSectionCreateDto, 
  PublicSavedSectionDto 
} from '../types/savedSections.types';

export { 
  createSavedSection, 
  getSavedSections, 
  deleteSavedSection 
} from './clients/savedSections.api';

export { 
  useSavedSections, 
  useCreateSavedSection, 
  useDeleteSavedSection 
} from '../hooks/portfolio/useSavedSections';

// Portfolio hooks
export * from '../hooks/usePortfolios';
export * from '../features/portfolios/hooks/useSavedSections';
export * from '../hooks/usePublicPortfolio';
export * from '../features/portfolios/hooks/useMedia';

// API clients (for direct use if needed)
export * from '../features/user/api/user.api';
export * from '../features/repos/api/repos.api';
export * from './clients/portfolios.api';
export * from '../features/portfolios/api/savedSections.api';
export * from './clients/public.api';
export * from '../features/portfolios/api/media.api';

// Types
export * from '../types/dto';
