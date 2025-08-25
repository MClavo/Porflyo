import React from 'react';
import type { TemplateLayoutComponentProps } from '../types';
import type { PortfolioItem } from '../../types/itemDto';
import './twoColumnDark.css';

const TwoColumnDarkLayout: React.FC<TemplateLayoutComponentProps> = ({ sections, itemMap, itemDataMap }) => {
  // Expect first two sections to be the left and right top columns; third is bottom full-width
  const left = sections[0];
  const right = sections[1];
  const bottom = sections[2];

  return (
    <div className="tpl-two-column-dark">
      <div className="two-top">
        <div className="col tpl-section" data-section-id={left?.id}>
          <div className="section-title">{left?.title}</div>
          {(itemMap[left?.id || ''] || []).map(id => {
            const d = (itemDataMap[id] || {}) as PortfolioItem;
            const preview = getPreview(d);
            return <div key={id} className="tpl-item">{preview}</div>;
          })}
        </div>
        <div className="col tpl-section" data-section-id={right?.id}>
          <div className="section-title">{right?.title}</div>
          {(itemMap[right?.id || ''] || []).map(id => {
            const d = (itemDataMap[id] || {}) as PortfolioItem;
            const preview = getPreview(d);
            return <div key={id} className="tpl-item">{preview}</div>;
          })}
        </div>
      </div>

      <div className="bottom tpl-section" data-section-id={bottom?.id}>
        <div className="section-title">{bottom?.title}</div>
        {(itemMap[bottom?.id || ''] || []).map(id => {
          const d = (itemDataMap[id] || {}) as PortfolioItem;
          const preview = getPreview(d);
          return <div key={id} className="tpl-item">{preview}</div>;
        })}
      </div>
    </div>
  );
};

function getPreview(item?: PortfolioItem) {
  if (!item) return 'Item';
  const u = item as unknown;
  if (typeof u === 'object' && u !== null) {
    const o = u as Record<string, unknown>;
    if (typeof o.title === 'string') return o.title;
    if (typeof o.text === 'string') return o.text;
    if (typeof o.value === 'string') return o.value;
    try {
      return String(o.title ?? o.text ?? o.value ?? JSON.stringify(o));
    } catch {
      return 'Item';
    }
  }
  return String(u);
}

export default TwoColumnDarkLayout;
