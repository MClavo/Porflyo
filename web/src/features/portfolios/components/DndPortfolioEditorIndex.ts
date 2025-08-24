// DnD Portfolio Editor exports
export { DndPortfolioEditor } from './DndPortfolioEditor';

// DnD Components
export { SortableSection, SectionDragOverlay } from '../dnd/SortableSection';
export { SortableItem, ItemDragOverlay } from '../dnd/SortableItem';
export type { SortableItemRenderProps } from '../dnd/SortableItem';

// DnD Hooks
export { usePortfolioDndState } from '../dnd/hooks';
export { usePortfolioDndCallbacks } from '../dnd/callbacks';
export type { PortfolioDndStateHook } from '../dnd/hooks';
export type { PortfolioDndCallbacks } from '../dnd/callbacks';

// DnD Types
export type { 
  DragData,
  DndSectionConfig,
  ItemsMap,
  SectionsMap,
  PortfolioDndState,
  DragStartEvent,
  CollisionStrategy
} from '../dnd/types';

// DnD State Helpers
export { DndStateHelpers } from '../dnd/stateHelpers';

// DnD Utilities
export { isSectionId, isItemId, getIdAsString, isValidId } from '../dnd/utils';
export { useCollisionDetection, useCollisionDetectionWithUtils, TRASH_ID } from '../dnd/collisionDetection';

// Styles
import '../styles/dndEditor.css';
