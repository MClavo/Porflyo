import type { CardType, CardPatchByType } from "./Cards.types";
import type { SectionId } from "./Sections.types";
import type { PortfolioState } from "./Portfolio.types";
import type { TemplateKey } from "../templates/Template.types";
// TODO: Define TemplateKey type from available templates


export type Action =
| { type: "LOAD_PORTFOLIO"; payload: PortfolioState }
| { type: "SWITCH_TEMPLATE"; payload: { template: TemplateKey } }
| { type: "UPDATE_TITLE"; payload: { title: string } }
| { type: "RENAME_SECTION"; payload: { sectionId: SectionId; title: string } }
| { type: "CONFIGURE_SECTION"; payload: { sectionId: SectionId; allowedTypes: CardType[]; maxCards?: number } }
| { type: "ADD_CARD"; payload: { sectionId: SectionId; cardType: CardType; initialData?: CardPatchByType[CardType] } }
| { type: "REMOVE_CARD"; payload: { sectionId: SectionId; cardId: string } }
| { type: "MOVE_CARD"; payload: { sectionId: SectionId; from: number; to: number } }
| { type: "PATCH_CARD"; payload: { sectionId: SectionId; cardId: string; cardType: CardType; patch: CardPatchByType[CardType] } }
| { type: "REPLACE_IMAGE_URLS"; payload: { urlMapping: Record<string, string> } };