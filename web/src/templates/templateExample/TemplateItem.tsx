import React from 'react';
import type { PortfolioItem } from '../../types/itemDto';
import type { PortfolioSection } from '../../types/sectionDto';

type Props = {
  id: string;
  item: PortfolioItem;
  section: PortfolioSection;
};

const TemplateItem: React.FC<Props> = ({ id, item, section }) => {
  const base = `tpl-item section-${section.id} item-${item?.type ?? 'unknown'}`;

  if (!item) {
    return <div className={`${base} tpl-item--empty`} data-item-id={id} />;
  }

  switch (item.type) {
    case 'text':
      return (
        <article className={`${base} tpl-item--text`} data-item-id={id}>
          <p className="tpl-item__text">{item.text}</p>
        </article>
      );
    case 'character':
      return (
        <article className={`${base} tpl-item--character`} data-item-id={id}>
          <div className="tpl-item__char">{item.character}</div>
        </article>
      );
    case 'doubleText':
      return (
        <article className={`${base} tpl-item--double`} data-item-id={id}>
          <div className="tpl-item__double-title">{item.text1}</div>
          <div className="tpl-item__double-sub">{item.text2}</div>
        </article>
      );
    default:
      return (
        <article className={base} data-item-id={id}>
          {String(id)}
        </article>
      );
  }
};

export default TemplateItem;
