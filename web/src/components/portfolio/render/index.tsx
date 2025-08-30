import type { EditItemProps } from "../../../types/itemDto";
import CharacterItem from "./CharacterItem";
import DoubleTextItem from "./DoubleTextItem";
import { SavedItem } from "./SavedItem";
import TextItem from "./TextItem";
import { TextPhotoItem } from "./TextPhotoItem";
import './base.css';

export function ItemRenderer({
  id,
  item,
  editable = false,
  onItemUpdate,
  onStartEdit,
  onEndEdit,
  className = "",
  style,
  sectionId,
  templateId,
}: EditItemProps) {
  const type = item?.type ?? "text";

  // Generate simple, clear CSS classes
  const templateClass = templateId ? `tpl-${templateId}` : '';
  const sectionClass = sectionId ? `section-${sectionId}` : '';
  const itemTypeClass = `item-${type}`;
  
  // Combine classes: base + template + section + itemType + existing className
  const combinedClassName = [
    'item-content', // Base class for all items
    templateClass,
    sectionClass,
    itemTypeClass,
    className,
  ].filter(Boolean).join(' ');

  const commonProps = {
    id,
    item,
    editable,
    onItemUpdate,
    onStartEdit,
    onEndEdit,
    className: combinedClassName,
    style,
    sectionId,
    templateId,
  };

  switch (type) {
    case "text":
      return <TextItem {...commonProps} />;
    case "character":
      return <CharacterItem {...commonProps} />;
    case "doubleText":
      return <DoubleTextItem {...commonProps} />;
    case "textPhoto":
      return <TextPhotoItem {...commonProps} />;
    case "userProfile":
      // UserProfile items are special - they shouldn't be rendered as regular items
      // They're used internally to store user info but not displayed directly
      return null;
    case "savedItem":
      return (
        <SavedItem
          savedName={
            (item as import("../../../types/itemDto").SavedItem)?.savedName ||
            "Saved Element"
          }
        />
      );
    default:
      return <TextItem {...commonProps} />;
  }
}

export default ItemRenderer;
