
import { cardFactoriesFromDto, createCard } from "./Cards.registry";
import type { CardDto } from "./Cards.types";
import type { PortfolioDto, PortfolioState } from './Portfolio.types';
import type { CardId, SectionDto } from "./Sections.types";
import type { SectionState } from './Sections.types';

export function hydratatePortfolio(dto: PortfolioDto): PortfolioState {
 
  // map sections array to object with ids as keys
  const sections = Object.fromEntries(
    dto.sections.map<readonly [SectionDto["id"], PortfolioState["sections"][string]]>((sec) => {
      const cardsById: Record<string, ReturnType<typeof cardFactoriesFromDto["fromDto"]>> = {};
      const cardsOrder: string[] = [];
      
      for (const item of sec.items) {
        const { id, card } = createCard(cardFactoriesFromDto.fromDto(item).type);
        // Keep card data from DTO, but card object shape comes from factory
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cardsById[id] = { ...card, data: (item.data as any) };
        cardsOrder.push(id);
      }

      return [
        sec.id,
        {
          id: sec.id,
          type: 'text', // TODO: Set the correct SectionType here, e.g., from a mapping or default
          title: sec.title,
          allowedTypes: [], // TODO: Set allowedTypes appropriately
          maxCards: undefined, // TODO: Set maxCards if needed
          cardsById,
          cardsOrder
        }
      ];
    })
  );

  return {
    template: dto.template, 
    title: dto.title, 
    sections: sections as Record<string, SectionState>
  };
}


export function dehydratatePortfolio(state: PortfolioState): PortfolioDto {
  const sections = Object.values(state.sections).map((sec) => {
    const items = sec.cardsOrder.map((cardId: CardId) => {
      const card = sec.cardsById[cardId];
      // Ensure the returned object matches CardDto type
      return { type: card.type, data: card.data } as CardDto;
    });
    return { id: sec.id, title: sec.title, items };
  });

  return {template: state.template, title: state.title, sections: sections};
}