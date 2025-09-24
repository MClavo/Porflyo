import { useMemo } from 'react';
import type { Dispatch } from 'react';
import { createDragHandlers } from '../../components/editor/dragHandlers';
import type { PortfolioState } from '../../state/Portfolio.types';
import type { SavedCardsState } from '../../state/SavedCards.types';

export function useEditorDrag({ portfolio, dispatch, savedCardsState }: { portfolio: PortfolioState; dispatch: Dispatch<unknown>; savedCardsState: SavedCardsState }) {
  const handlers = useMemo(() => createDragHandlers({ portfolio, dispatch, savedCardsState }), [portfolio, dispatch, savedCardsState]);
  return handlers;
}
