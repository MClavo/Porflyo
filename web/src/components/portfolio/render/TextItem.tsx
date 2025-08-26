import React from 'react';
import type { PortfolioItem } from '../../../types/itemDto';
import styles from './render.module.css';

type Props = {
  id: string;
  item?: PortfolioItem | undefined;
  editable?: boolean;
  onItemUpdate?: (id: string, updated: Partial<PortfolioItem>) => void;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export function TextItem({ id, item, editable = false, onItemUpdate, onStartEdit, onEndEdit, className = '', style }: Props) {
  const text = item && 'text' in item ? item.text : '';

  if (editable) {
    return (
      <input
        className={`${styles.input} ${className}`}
        style={style}
        value={text ?? ''}
        placeholder="Introduce texto..."
        onFocus={() => onStartEdit?.()}
        onBlur={() => onEndEdit?.()}
  onChange={(e) => onItemUpdate?.(id, { type: 'text', text: e.target.value })}
      />
    );
  }

  return (
    <div className={`${styles.text} ${className}`} style={style}>
      {text ?? <span className={styles.placeholder}>Introduce texto...</span>}
    </div>
  );
}

export default TextItem;
