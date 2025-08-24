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
  React.forwardRef<HTMLLIElement, Props>(
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
  <li
          className={`
            item-wrapper 
            ${fadeIn ? 'fade-in' : ''} 
            ${sorting ? 'sorting' : ''} 
            ${dragOverlay ? 'drag-overlay' : ''}
          `.trim()}
          style={
            {
              ...wrapperStyle,
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
        >
          <div
            className={`
              item 
              ${dragging ? 'dragging' : ''} 
              ${handle ? 'with-handle' : ''} 
              ${dragOverlay ? 'drag-overlay' : ''} 
              ${disabled ? 'disabled' : ''} 
              
            `.trim()}
            style={style}
            data-cypress="draggable-item"
            {...(!handle ? listeners : undefined)}
            {...props}
            tabIndex={!handle ? 0 : undefined}
          >
            {value}
            <span className="actions">
              {onRemove ? (
                <Remove className="remove" onClick={onRemove} />
              ) : null}
              {handle ? <Handle {...handleProps} {...listeners} /> : null}
            </span>
          </div>
        </li>
      );
    }
  )
);
