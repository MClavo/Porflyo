import React, { forwardRef } from 'react';
import './Container.css';
import { Handle } from '../item/Handle';
import { Remove } from '../item/Remove';

export interface Props {
  children: React.ReactNode;
  columns?: number;
  label?: string;
  style?: React.CSSProperties;
  horizontal?: boolean;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<HTMLButtonElement>;
  scrollable?: boolean;
  shadow?: boolean;
  placeholder?: boolean;
  unstyled?: boolean;
  onClick?(): void;
  onRemove?(): void;
}

export const Container = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      columns = 1,
      handleProps,
      horizontal,
      hover,
      onClick,
      onRemove,
      label,
      placeholder,
      style,
      scrollable,
      shadow,
      unstyled,
      ...props
    }: Props,
    ref
  ) => {
    const Component = onClick ? 'button' : 'div';

    return (
      <Component
        {...props}
        ref={ref as React.ForwardedRef<HTMLDivElement & HTMLButtonElement>}
        style={
          {
            ...style,
            '--columns': columns,
          } as React.CSSProperties
        }
        className={'container'}
        //onClick={onClick}
        //tabIndex={onClick ? 0 : undefined}
      >
        {placeholder ? children : <ul>{children}</ul>}
      </Component>
    );
  }
);
