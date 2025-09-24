import { createContext } from 'react';
import type { PublicSavedSectionDto } from '../api/types';

export interface SavedSectionsContextType {
  sections: PublicSavedSectionDto[];
  isLoading: boolean;
  error: string | null;
  addSection: (section: PublicSavedSectionDto) => void;
  removeSection: (id: string) => void;
}

export const SavedSectionsContext = createContext<SavedSectionsContextType | undefined>(undefined);