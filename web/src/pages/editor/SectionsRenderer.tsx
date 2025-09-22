import SectionCard from "../../components/sections/SectionCard";
import type { PortfolioState } from "../../state/Portfolio.types";
import type { SectionState } from "../../state/Sections.types";
import type { Mode } from "../../components/cards/subcomponents/Fields.types";
import type { CardPatchByType } from "../../state/Cards.types";

export default function SectionsRenderer(props: {
  portfolio: PortfolioState;
  mode: Mode;
  onPatch: (sectionId: string, patch: Partial<SectionState>) => void;
  
  onCardPatch: (
    sectionId: string,
    cardId: string,
    patch: Partial<CardPatchByType[keyof CardPatchByType]>
  ) => void;

  onAddCard: (sectionId: string) => void;
  onRemoveCard: (sectionId: string, cardId: string) => void;
}) {

  const { portfolio, mode, onPatch, onCardPatch, onAddCard, onRemoveCard } = props;

  if (!portfolio?.sections) return null;

  return (
    <>
      {Object.entries(portfolio.sections).map(([sid, section]) => {
        const s = section as SectionState;
        return (
          <SectionCard
            key={sid}
            mode={mode}
            id={sid}
            type={s.type}
            title={s.title}
            maxCards={s.maxCards}
            allowedTypes={s.allowedTypes}
            cardsById={s.cardsById}
            cardsOrder={s.cardsOrder}
            onPatch={(patch) => onPatch(sid, patch)}
            onCardPatch={(cardId, patch) => onCardPatch(sid, cardId, patch)}
            onAddCard={() => onAddCard(sid)}
            onRemoveCard={(cardId) => onRemoveCard(sid, cardId)}
          />
        );
      })}
    </>
  );
}
