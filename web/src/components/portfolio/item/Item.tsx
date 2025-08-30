import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import type { Transform } from '@dnd-kit/utilities';
import React, { useEffect } from 'react';
import { Handle } from './Handle';
import './Item.css';
import { Remove } from './Remove';

export interface Props {
  dragOverlay?: boolean;
  disabled?: boolean;
  dragging?: boolean;
  handle?: boolean;
  handleProps?: React.HTMLAttributes<HTMLButtonElement> | ((element: HTMLElement | null) => void);
  height?: number;
  index?: number;
  fadeIn?: boolean;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  sorting?: boolean;
  style?: React.CSSProperties;
  transition?: string | null;
  wrapperStyle?: React.CSSProperties;
  value: React.ReactNode;
  readOnly?: boolean;
  onRemove?(): void;
  renderItem?(args: {
    dragOverlay: boolean;
    dragging: boolean;
    sorting: boolean;
    index: number | undefined;
    fadeIn: boolean;
    listeners: DraggableSyntheticListeners;
    ref: React.Ref<HTMLElement>;
    style: React.CSSProperties | undefined;
    transform: Props['transform'];
    transition: Props['transition'];
    value: Props['value'];
  }): React.ReactElement;
}

export const Item = React.memo(
  React.forwardRef<HTMLDivElement, Props>(
    (
      {
        dragOverlay,
        dragging,
        disabled,
        fadeIn,
        handle,
        handleProps,
        
        index,
        listeners,
        onRemove,
        renderItem,
        sorting,
        style,
        transition,
        transform,
        value,
        wrapperStyle,
        readOnly,
        ...props
      },
      ref
    ) => {
      useEffect(() => {
        if (!dragOverlay) {
          return;
        }

        document.body.style.cursor = 'grabbing';

        return () => {
          document.body.style.cursor = '';
        };
      }, [dragOverlay]);

      return renderItem ? (
        renderItem({
          dragOverlay: Boolean(dragOverlay),
          dragging: Boolean(dragging),
          sorting: Boolean(sorting),
          index,
          fadeIn: Boolean(fadeIn),
          listeners,
          ref,
          style,
          transform,
          transition,
          value,
        })
      ) : (
        <div
          className={`
            portfolio-item
            ${dragging ? 'is-dragging' : ''} 
            ${handle ? 'has-handle' : ''} 
            ${dragOverlay ? 'is-overlay' : ''} 
            ${disabled ? 'is-disabled' : ''} 
            ${fadeIn ? 'fade-in' : ''} 
            ${sorting ? 'is-sorting' : ''}
            ${readOnly ? 'is-read-only' : ''}
          `.trim()}
          style={
            {
              ...wrapperStyle,
              ...style,
              transition: [transition, wrapperStyle?.transition]
                .filter(Boolean)
                .join(', '),
              '--translate-x': transform
                ? `${Math.round(transform.x)}px`
                : undefined,
              '--translate-y': transform
                ? `${Math.round(transform.y)}px`
                : undefined,
              '--scale-x': transform?.scaleX
                ? `${transform.scaleX}`
                : undefined,
              '--scale-y': transform?.scaleY
                ? `${transform.scaleY}`
                : undefined,
              '--index': index,
            } as React.CSSProperties
          }
          ref={ref}
          data-cypress="draggable-item"
          {...(!handle ? listeners : undefined)}
          {...props}
          tabIndex={!handle ? 0 : undefined}
        >
          {onRemove && (
            <div className="item-delete" onClick={onRemove}>
              <Remove />
            </div>
          )}
          
          {/* <div className="item-content"> */}
            {value}
          {/* </div> */}
          
          {handle && (
            <div className="item-handle">
              <Handle {...handleProps} {...listeners} />
            </div>
          )}
        </div>
      );
    }
  )
);
