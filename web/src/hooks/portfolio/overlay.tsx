import React from 'react';
import type { UniqueIdentifier } from '@dnd-kit/core';
import type { EditorPortfolioItemsData } from '../../components/portfolio/dnd/EditorTypes';
// item types are available via runtime 'type' discriminant; explicit imports not required here

export type ItemCompProps = {
  value: React.ReactNode;
  handle?: boolean;
  style?: React.CSSProperties;
  color?: string;
  wrapperStyle?: React.CSSProperties;
  dragOverlay?: boolean;
};

export function renderSortableItemDragOverlay(
  id: UniqueIdentifier,
  itemsData: EditorPortfolioItemsData,
  ItemComponent: React.ComponentType<ItemCompProps>,
) {
  const item = itemsData[id];
  const itemToRender = item?.type === 'savedItem' ? item.originalItem : item;

  if (!itemToRender) {
    return (
      <ItemComponent value={String(id)} handle={false} wrapperStyle={{ width: '100%', height: '100%' }} dragOverlay />
    );
  }

  if (itemToRender.type === 'text') {
    return (
      <ItemComponent
        value={itemToRender.text || ''}
        handle={false}
        wrapperStyle={{ width: '100%', height: '100%' }}
        dragOverlay
      />
    );
  }

  if (itemToRender.type === 'character') {
    return (
      <ItemComponent
        value={itemToRender.character || ''}
        handle={false}
        wrapperStyle={{ width: '100%', height: '100%' }}
        dragOverlay
      />
    );
  }

  if (itemToRender.type === 'doubleText') {
    return (
      <ItemComponent
        value={(
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>{itemToRender.text1 || ''}</div>
            <div style={{ fontSize: '0.8em', color: '#666' }}>{itemToRender.text2 || ''}</div>
          </div>
        )}
        handle={false}
        wrapperStyle={{ width: '100%', height: '100%' }}
        dragOverlay
      />
    );
  }

  return (
    <ItemComponent value={String(id)} handle={false} wrapperStyle={{ width: '100%', height: '100%' }} dragOverlay />
  );
}
