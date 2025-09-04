import type { PortfolioSection } from '../types/sectionDto';
import type { PortfolioUserInfo } from '../types/userDto';


export type TemplateLayoutComponentProps = {
  sections: PortfolioSection[];
  itemMap: Record<string, string[]>;
  itemDataMap: Record<string, unknown>;
  themeClass?: string;
  userInfo?: PortfolioUserInfo;
  onSectionTitleUpdate?: (sectionId: string, newTitle: string) => void;
  onUserInfoUpdate?: (userInfo: PortfolioUserInfo) => void;
  renderItems?: (section: PortfolioSection, items: string[], itemsData: Record<string, unknown>) => React.ReactNode;
  isEditable?: boolean; // New flag to distinguish between edit and view modes
};

export type TemplateDefinition = {
  id: string;
  title: string;
  sections: PortfolioSection[];
  ThemeClass?: string;
  Layout: React.FC<TemplateLayoutComponentProps>;
};


