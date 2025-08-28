import type { EditItemProps } from '../../../types/itemDto';

export function TextItem({ id, item, editable = false, onItemUpdate, onStartEdit, onEndEdit, className = '', style }: EditItemProps) {
  const text = item && 'text' in item ? item.text : '';

  if (editable) {
    return (
      <input
        className={className}
        style={style}
        value={text ?? ''}
        placeholder="Description"
        maxLength={400}
        onFocus={() => onStartEdit?.()}
        onBlur={() => onEndEdit?.()}
        onChange={(e) => onItemUpdate?.(id, { type: 'text', text: e.target.value })}
      />
    );
  }

  return (
    <div className={className} style={style}>
      {text ?? <span className="placeholder">Introduce texto...</span>}
    </div>
  );
}

export default TextItem;
