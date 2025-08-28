import type { EditItemProps } from '../../../types/itemDto';

export function DoubleTextItem({ id, item, editable = false, onItemUpdate, onStartEdit, onEndEdit, className = '', style }: EditItemProps) {
  const title = item && 'text1' in item ? item.text1 : '';
  const subtitle = item && 'text2' in item ? item.text2 : '';

  if (editable) {
    return (
      <div className={className} style={style}>
        <input
          className="item-title"
          value={title ?? ''}
          placeholder="Title"
          maxLength={30}
          onFocus={() => onStartEdit?.()}
          onBlur={() => onEndEdit?.()}
          onChange={(e) => onItemUpdate?.(id, { type: 'doubleText', text1: e.target.value, text2: subtitle ?? '' })}
        />
        <input
          className="item-description"
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
    <div className={className} style={style}>
      <div className="item-title">{title ?? <span className="placeholder">Título principal...</span>}</div>
      <div className="item-description">{subtitle ?? <span className="placeholder">Subtítulo...</span>}</div>
    </div>
  );
}

export default DoubleTextItem;
