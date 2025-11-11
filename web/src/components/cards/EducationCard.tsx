import type { Mode, MonthYearValue } from "./subcomponents/index";
import { Date, Text, Title } from "./subcomponents/index";
import "../../styles/cards/EducationCard.css";

export type EducationCardSaved = {
  title: string;
  institution: string;
  location: string;
  dateStart: MonthYearValue;
  dateEnd: MonthYearValue;
};

interface EducationCardProps {
  mode?: Mode;
  title: string;
  institution: string;
  location?: string;
  dateStart: MonthYearValue;
  dateEnd: MonthYearValue;
  onPatch?: (patch: Partial<EducationCardSaved>) => void;
  children?: React.ReactNode;
}

const EducationCard: React.FC<EducationCardProps> = ({
  mode = "view",
  title,
  institution,
  location = "",
  dateStart,
  dateEnd,
  onPatch,
  children,
}) => {
  return (
    <div className="education-card" data-mode={mode}>
      {children}
      
      {/* Header: Position title and dates on same line */}
      <div className="education-card-header">
        <Title
          mode={mode}
          value={title}
          className="education-card-title"
          placeholder="Position Title"
          required
          maxLength={60}
          onChange={(v) => onPatch?.({ title: v })}
        />
        
        <div className="education-card-dates">
          <Date
            mode={mode}
            className="education-card-date-start"
            value={dateStart}
            onChange={(v) => onPatch?.({ dateStart: v })}
          />
          <span className="education-card-date-separator">-</span>
          <Date
            mode={mode}
            className="education-card-date-end"
            value={dateEnd}
            onChange={(v) => onPatch?.({ dateEnd: v })}
          />
        </div>
      </div>

      {/* Company and location */}
      <div className="education-card-institution-section">
        <Title
          mode={mode}
          value={institution}
          className="education-card-institution"
          placeholder="Company Name"
          required
          maxLength={60}
          onChange={(v) => onPatch?.({ institution: v })}
        />
        
        {(location || mode === "edit") && (
          <>
            <span className="education-card-location-separator">•</span>
            <Text
              mode={mode}
              value={location}
              className="education-card-location"
              placeholder="Location"
              maxLength={50}
              onChange={(v) => onPatch?.({ location: v })}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default EducationCard;
