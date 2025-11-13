import type { Mode, MonthYearValue } from "./subcomponents/index";
import { Date, Text, Title } from "./subcomponents/index";
import "../../styles/cards/AwardCard.css";

export type AwardCardSaved = {
  event: string;
  category: string;
  date: MonthYearValue;
  description: string;
};

interface AwardCardProps {
  mode?: Mode;
  event: string;
  category: string;
  date: MonthYearValue;
  description: string;
  onPatch?: (patch: Partial<AwardCardSaved>) => void;
  children?: React.ReactNode;
}

const AwardCard: React.FC<AwardCardProps> = ({
  mode = "view",
  event,
  category,
  date,
  description,
  onPatch,
  children,
}) => {
  return (
    <div className="award-card" data-mode={mode}>
      {children}
      
      {/* Event title */}
      <div className="award-card__event-section">
        <Title
          mode={mode}
          value={event}
          className="award-card__event"
          placeholder="Event Name"
          required
          maxLength={80}
          onChange={(v) => onPatch?.({ event: v })}
        />
      </div>

      {/* Category */}
      <div className="award-card__category-section">
        <Title
          mode={mode}
          value={category}
          className="award-card__category"
          placeholder="Award Category"
          required
          maxLength={60}
          onChange={(v) => onPatch?.({ category: v })}
        />
      </div>

      {/* Date */}
      <div className="award-card__date">
        <Date
          mode={mode}
          value={date}
          onChange={(v) => onPatch?.({ date: v })}
        />
      </div>

      {/* Description */}
      {(description || mode === "edit") && (
        <Text
          mode={mode}
          value={description}
          className="award-card__description"
          placeholder="Add a description of the award..."
          maxLength={300}
          onChange={(v) => onPatch?.({ description: v })}
        />
      )}
    </div>
  );
};

export default AwardCard;
