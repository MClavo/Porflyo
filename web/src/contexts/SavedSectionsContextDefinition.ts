import { createContext } from 'react';
import type { PublicSavedSectionDto } from '../api/types';

export interface SavedSectionsContextType {
  sections: PublicSavedSectionDto[];
  isLoading: boolean;
  isLoaded: boolean;
  error: string | null;
  addSection: (section: PublicSavedSectionDto) => void;
  removeSection: (id: string) => void;
  loadSections: () => Promise<void>;
}

export const SavedSectionsContext = createContext<SavedSectionsContextType | undefined>(undefined);