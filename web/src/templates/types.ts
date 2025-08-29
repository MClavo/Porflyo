import type { PortfolioSection } from '../types/sectionDto';


export type TemplateLayoutComponentProps = {
  sections: PortfolioSection[];
  itemMap: Record<string, string[]>;
  itemDataMap: Record<string, unknown>;
  themeClass?: string;
  onSectionTitleUpdate?: (sectionId: string, newTitle: string) => void;
  renderItems?: (section: PortfolioSection, items: string[], itemsData: Record<string, unknown>) => React.ReactNode;
};

export type TemplateDefinition = {
  id: string;
  title: string;
  sections: PortfolioSection[];
  ThemeClass?: string;
  Layout: React.FC<TemplateLayoutComponentProps>;
};


