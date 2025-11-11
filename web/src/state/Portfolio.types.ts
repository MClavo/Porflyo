import type { TemplateKey } from "../templates/Template.types";
import type { SectionId, SectionState, SectionDto } from "./Sections.types";

// TODO: PortfolioDto may not be needed

export type PortfolioState = {
  template: TemplateKey;
  title: string;
  sections: Record<SectionId, SectionState>;
 /*  sectionsOrder: SectionId[];  */
};

export type PortfolioDto = {
  template: TemplateKey;        // persisted 
  title: string;
  sections: SectionDto[];   // persisted
}