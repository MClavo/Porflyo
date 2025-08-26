import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { useEffect, useRef, useMemo } from 'react';
import { Container } from '../section/Container';
import type { PublicSavedSectionDto } from '../../../types/dto';
import { useListSavedSections } from '../../../features/portfolios/hooks/useSavedSections';
import { PortfolioItem } from '../item/PortfolioItem';

export function SavedItemsSideBar() {
  //const savedSectionsQuery = useListSavedSections();
  //const savedSections = useMemo<PublicSavedSectionDto[]>(() => savedSectionsQuery.data || [], [savedSectionsQuery.data]);


  return (
    <div className="saved-sections-card" id="saved-items">
      <h2 className="card-title">Saved</h2>
    </div>
  );
}

export default SavedItemsSideBar;
