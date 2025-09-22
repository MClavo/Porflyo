import type { PortfolioState } from "./Portfolio.types";
import type { AnyCard } from "./Cards.types";
import type { SectionId } from "./Sections.types";


export const selectSection = (s: PortfolioState, id: SectionId) => s.sections[id];
export const selectCardsInSection = (s: PortfolioState, id: SectionId): AnyCard[] => {
  const sec = s.sections[id];
  if (!sec) return [];
  return sec.cardsOrder.map((cardId) => sec.cardsById[cardId]).filter(Boolean);
};