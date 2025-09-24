
export type TemplateKey = "template1" | "template2"; 

export const templateList = ["template1", "template2"];


import type { PortfolioState } from "../state/Portfolio.types";
import type { SectionState } from "../state/Sections.types";


export type TemplateLayoutComponentProps = {
  sections: SectionState[];
  itemMap: Record<string, string[]>;
  itemDataMap: Record<string, unknown>;
  themeClass?: string;
  /* userInfo?: PortfolioUserInfo; */
  /* onSectionTitleUpdate?: (sectionId: string, newTitle: string) => void; */
  /*  onUserInfoUpdate?: (userInfo: PortfolioUserInfo) => void; */
  /* renderItems?: (section: SectionState, items: string[], itemsData: Record<string, unknown>) => React.ReactNode; */
  isEditable?: boolean; // New flag to distinguish between edit and view modes
};

export function buildTemplateProps(portfolio: PortfolioState) {
  const sections: SectionState[] = Object.values(portfolio.sections);
  const itemMap: Record<string, string[]> = {};
  const itemDataMap: Record<string, unknown> = {};

  for (const s of sections) {
    itemMap[s.id] = s.cardsOrder ?? [];
    for (const id of s.cardsOrder ?? []) {
      const card = s.cardsById?.[id];
      if (card) itemDataMap[id] = card.data;
    }
  }

  return { sections, itemMap, itemDataMap };
}

export type TemplateDefinition = {
  id: string;
  title: string;
  sections: SectionState[];
  ThemeClass?: string;
  Layout: React.FC<TemplateLayoutComponentProps>;
};

