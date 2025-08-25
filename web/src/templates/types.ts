import type { LayoutType, PortfolioSection } from '../types/sectionDto';
import type { ItemType } from '../types/itemDto';

export type TemplateSectionDefinition = {
  id: string;
  title: string;
  layoutType?: LayoutType;
  maxItems?: number;
  allowedItemTypes?: ItemType[];
};

export type TemplateLayoutComponentProps = {
  sections: PortfolioSection[];
  itemMap: Record<string, string[]>;
  itemDataMap: Record<string, unknown>;
  themeClass?: string;
};

export type TemplateDefinition = {
  id: string;
  title: string;
  defaultSections: TemplateSectionDefinition[];
  ThemeClass?: string;
  Layout: React.FC<TemplateLayoutComponentProps>;
};


