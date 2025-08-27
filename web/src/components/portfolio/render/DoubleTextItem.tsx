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

export function DoubleTextItem({ id, item, editable = false, onItemUpdate, onStartEdit, onEndEdit, className = '', style }: Props) {
  const title = item && 'text1' in item ? item.text1 : '';
  const subtitle = item && 'text2' in item ? item.text2 : '';

  if (editable) {
    return (
      <div className={`${styles.doubleContainer} ${className}`} style={style}>
        <input
          className={`${styles.input} ${styles.doubleTitle}`}
          value={title ?? ''}
          placeholder="Title"
          maxLength={30}
          onFocus={() => onStartEdit?.()}
          onBlur={() => onEndEdit?.()}
          onChange={(e) => onItemUpdate?.(id, { type: 'doubleText', text1: e.target.value, text2: subtitle ?? '' })}
        />
        <input
          className={`${styles.input} ${styles.doubleSubtitle}`}
          value={subtitle ?? ''}
          placeholder="Description"
          maxLength={200}
          onFocus={() => onStartEdit?.()}
          onBlur={() => onEndEdit?.()}
          onChange={(e) => onItemUpdate?.(id, { type: 'doubleText', text1: title ?? '', text2: e.target.value })}
        />
      </div>
    );
  }

  return (
    <div className={`${styles.doubleContainer} ${className}`} style={style}>
      <div className={styles.doubleTitleView}>{title ?? <span className={styles.placeholder}>Título principal...</span>}</div>
      <div className={styles.doubleSubtitleView}>{subtitle ?? <span className={styles.placeholder}>Subtítulo...</span>}</div>
    </div>
  );
}

export default DoubleTextItem;
