// React import not required in modern JSX runtime
import EditorDndProvider from '../dnd/EditorDndProvider';
import type { DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import SavedSidebar from './SavedSidebar';
import LayoutPreview from '../portfolio/LayoutPreview';
import type { PortfolioState } from '../../state/Portfolio.types';

export default function EditorCanvas({
  portfolio,
  sectionsMap,
  allCardsById,
  mode,
  onDragStart,
  onDragEnd,
  onImageUrlsReplaced,
}: {
  portfolio: PortfolioState;
  sectionsMap: Record<string, React.ReactNode>;
  allCardsById: Record<string, unknown>;
  mode: 'view' | 'edit';
  onDragStart: (e: DragStartEvent) => void;
  onDragEnd: (e: DragEndEvent) => void;
  onImageUrlsReplaced: (m: Record<string, string>) => void;
}) {
  return (
    <main className="test-main">
      <EditorDndProvider
        template={portfolio.template}
        mode={mode}
  // @ts-expect-error - runtime shape matches expected AnyCard; narrow types later if needed
  cardsById={allCardsById as unknown as Record<string, unknown>}
        sectionsById={portfolio.sections}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="main-content">
          <SavedSidebar
            mode={mode}
            template={portfolio.template}
            onImageUrlsReplaced={onImageUrlsReplaced}
          />

          <div className="layout-preview">
            <LayoutPreview portfolio={portfolio} sectionsMap={sectionsMap as unknown as Record<string, React.ReactNode>} isEditable={mode === 'edit'} />
          </div>
        </div>
      </EditorDndProvider>
    </main>
  );
}
