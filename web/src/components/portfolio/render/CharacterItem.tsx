import type { EditItemProps } from '../../../types/itemDto';

export function CharacterItem({ id, item, editable = false, onItemUpdate, onStartEdit, onEndEdit, className = '', style }: EditItemProps) {
  const char = (item && 'character' in item ? item.character : '') ?? '';

    if (editable) {
    return (
      <input
        className={className}
        style={style}
        value={char}
        placeholder=""
        maxLength={10}
        onFocus={() => onStartEdit?.()}
        onBlur={() => onEndEdit?.()}
        onChange={(e) => onItemUpdate?.(id, { type: 'character', character: e.target.value })}
      />
    );
  }

  return (
    <div className={className} style={style}>
      {char || <span className="placeholder">?</span>}
    </div>
  );
}

export default CharacterItem;
