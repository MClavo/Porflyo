import type {
  DroppableContainer,
  KeyboardCoordinateGetter,
} from '@dnd-kit/core';

const directions: string[] = [
  'DOWN',
  'RIGHT',
  'UP',
  'LEFT',
];

const horizontal: string[] = [
  'LEFT',
  'RIGHT',
];

export const coordinateGetter: KeyboardCoordinateGetter = (
  event,
  {context: {active, droppableRects, droppableContainers, collisionRect}}
) => {
  if (directions.includes(event.code)) {
    if (!active || !collisionRect) {
      return;
    }

    event.preventDefault();

    const filteredContainers: DroppableContainer[] = [];

    droppableContainers.getEnabled().forEach((entry) => {
      if (!entry || entry?.disabled) {
        return;
      }

      const rect = droppableRects.get(entry.id);

      if (!rect) {
        return;
      }

      const data = entry.data.current;

      if (data) {
        const {type, children} = data;

        if (type === 'container' && children?.length > 0) {
          if (active.data.current?.type !== 'container') {
            return;
          }
        }
      }

      switch (event.code) {
        case 'DOWN':
          if (horizontal.includes(event.code)) {
            return;
          }
          if (rect.top < collisionRect.top) {
            return;
          }
          break;
        case 'UP':
          if (horizontal.includes(event.code)) {
            return;
          }
          if (rect.top > collisionRect.top) {
            return;
          }
          break;
        case 'LEFT':
          if (rect.left >= collisionRect.left) {
            return;
          }
          break;
        case 'RIGHT':
          if (rect.left <= collisionRect.left) {
            return;
          }
          break;
      }

      filteredContainers.push(entry);
    });

    const collisions = filteredContainers
      .sort((a, b) => {
        const aRect = droppableRects.get(a.id);
        const bRect = droppableRects.get(b.id);

        if (!aRect || !bRect) {
          return 0;
        }

        const distanceA = distanceBetween(
          {
            x: collisionRect.left,
            y: collisionRect.top,
          },
          {
            x: aRect.left,
            y: aRect.top,
          }
        );
        const distanceB = distanceBetween(
          {
            x: collisionRect.left,
            y: collisionRect.top,
          },
          {
            x: bRect.left,
            y: bRect.top,
          }
        );

        return distanceA - distanceB;
      })
      .filter((container) => {
        const rect = droppableRects.get(container.id);

        return rect;
      });

    const closestId = collisions[0]?.id;

    if (closestId != null) {
      const newRect = droppableRects.get(closestId);
      const newNode = droppableContainers.get(closestId);
      const newData = newNode?.data.current;

      if (newRect && newNode) {
        if (newData?.type === 'container') {
          return {
            x: newRect.left + (newRect.width - collisionRect.width) / 2,
            y: newRect.top + (newRect.height - collisionRect.height) / 2,
          };
        }

        return {
          x: newRect.left,
          y: newRect.top,
        };
      }
    }
  }

  return undefined;
};

function distanceBetween(p1: {x: number; y: number}, p2: {x: number; y: number}) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
