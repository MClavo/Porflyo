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

export function CharacterItem({ id, item, editable = false, onItemUpdate, onStartEdit, onEndEdit, className = '', style }: Props) {
  const char = (item && 'character' in item ? item.character : '') ?? '';

    if (editable) {
    return (
      <input
        className={`${styles.input} ${styles.character} ${className}`}
        style={style}
        value={char}
        placeholder="🎯"
        maxLength={10}
          onFocus={() => onStartEdit?.()}
          onBlur={() => onEndEdit?.()}
          onChange={(e) => onItemUpdate?.(id, { type: 'character', character: e.target.value })}
      />
    );
  }

  return (
    <div className={`${styles.characterView} ${className}`} style={style}>
      {char || <span className={styles.placeholder}>?</span>}
    </div>
  );
}

export default CharacterItem;
