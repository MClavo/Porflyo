import React from 'react';
import type { PortfolioItem as PortfolioItemType } from '../../../types/itemDto';
import TextItem from './TextItem';
import CharacterItem from './CharacterItem';
import DoubleTextItem from './DoubleTextItem';
import { SavedItem } from './SavedItem';

type Props = {
  id: string;
  item?: PortfolioItemType | undefined;
  editable?: boolean;
  onItemUpdate?: (id: string, updated: Partial<PortfolioItemType>) => void;
  onStartEdit?: () => void;
  onEndEdit?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export function ItemRenderer({ id, item, editable = false, onItemUpdate, onStartEdit, onEndEdit, className = '', style }: Props) {
  const type = item?.type ?? 'text';

  switch (type) {
    case 'text':
      return <TextItem id={id} item={item} editable={editable} onItemUpdate={onItemUpdate} onStartEdit={onStartEdit} onEndEdit={onEndEdit} className={className} style={style} />;
    case 'character':
  return <CharacterItem id={id} item={item} editable={editable} onItemUpdate={onItemUpdate} onStartEdit={onStartEdit} onEndEdit={onEndEdit} className={className} style={style} />;
    case 'doubleText':
  return <DoubleTextItem id={id} item={item} editable={editable} onItemUpdate={onItemUpdate} onStartEdit={onStartEdit} onEndEdit={onEndEdit} className={className} style={style} />;
    case 'savedItem':
      return <SavedItem savedName={(item as import('../../../types/itemDto').SavedItem)?.savedName || 'Item guardado'} />;
    default:
      return <TextItem id={id} item={item} editable={editable} onItemUpdate={onItemUpdate} onStartEdit={onStartEdit} onEndEdit={onEndEdit} className={className} style={style} />;;
  }
}

export default ItemRenderer;
