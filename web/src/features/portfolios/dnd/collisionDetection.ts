import { useCallback, useRef } from 'react';
import type { 
  CollisionDetection, 
  UniqueIdentifier
} from '@dnd-kit/core';
import {
  pointerWithin,
  rectIntersection,
  closestCenter,
  getFirstCollision
} from '@dnd-kit/core';
import type { SectionsMap } from './types';

// Constants
export const TRASH_ID = 'void';

/**
 * Custom collision detection strategy optimized for multiple containers
 * Based on the MultipleContainers example from dnd-kit
 * 
 * Strategy:
 * 1. If dragging a container, use closestCenter with only containers as targets
 * 2. Find any droppable containers intersecting with the pointer
 * 3. If none, find intersecting containers with the active draggable  
 * 4. If none, return the last matched intersection to prevent null during layout shifts
 */
export function useCollisionDetection(
  activeId: UniqueIdentifier | null,
  sectionsMap: SectionsMap
): CollisionDetection {
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const recentlyMovedToNewContainer = useRef(false);

  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      // If we're dragging a container (section), use closestCenter with only containers
      if (activeId && activeId in sectionsMap) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in sectionsMap
          ),
        });
      }

      // Start by finding any intersecting droppable with the pointer
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? pointerIntersections // If there are droppables intersecting with pointer, use those
          : rectIntersection(args); // Otherwise, use rect intersection

      let overId = getFirstCollision(intersections, 'id');

      if (overId != null) {
        // If intersecting with trash, return early
        if (overId === TRASH_ID) {
          return intersections;
        }

        // If intersecting with a container that has items
        if (overId in sectionsMap) {
          const containerItems = sectionsMap[overId];

          // If container has items, find the closest item within it
          if (containerItems.length > 0) {
            // Find the closest item in this container
            const closestItemInContainer = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) => 
                  container.id !== overId && 
                  containerItems.includes(container.id)
              ),
            });

            const closestItem = getFirstCollision(closestItemInContainer, 'id');

            if (closestItem) {
              overId = closestItem;
            }
          }
        }

        lastOverId.current = overId;
        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match to prevent null during transitions
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, sectionsMap]
  );

  // Expose method to mark recent container move for collision detection
  const markRecentMove = useCallback(() => {
    recentlyMovedToNewContainer.current = true;
    // Reset the flag after a frame to prevent it from staying true
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, []);

  return collisionDetectionStrategy;
}

/**
 * Hook that provides collision detection and related utilities
 */
export function useCollisionDetectionWithUtils(
  activeId: UniqueIdentifier | null,
  sectionsMap: SectionsMap
) {
  const collisionDetection = useCollisionDetection(activeId, sectionsMap);
  const recentlyMovedToNewContainer = useRef(false);

  const markRecentMove = useCallback(() => {
    recentlyMovedToNewContainer.current = true;
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, []);

  return {
    collisionDetection,
    markRecentMove,
    recentlyMovedToNewContainer
  };
}
