import type { Mode, MonthYearValue } from "./subcomponents/index";
import { Date, Text, Title } from "./subcomponents/index";

export type JobCardSaved = {
  title: string;
  company: string;
  description: string;
  dateStart: MonthYearValue;
  dateEnd: MonthYearValue;
};

interface JobCardProps {
  mode?: Mode;
  title: string;
  company: string;
  description: string;
  dateStart: MonthYearValue;
  dateEnd: MonthYearValue;
  onPatch?: (patch: Partial<JobCardSaved>) => void;
  children?: React.ReactNode;
}

const JobCard: React.FC<JobCardProps> = ({
  mode = "view",
  title,
  company,
  description,
  dateStart,
  dateEnd,
  onPatch,
  children,
}) => {
  return (
    <div className="job-card" data-mode={mode}>
      {children}
      <Title
        mode={mode}
        value={title}
        className="job-card-title"
        required
        maxLength={50}
        onChange={(v) => onPatch?.({ title: v })}
      />

      <Title
        mode={mode}
        value={company}
        className="job-card-company"
        required
        maxLength={50}
        onChange={(v) => onPatch?.({ company: v })}
      />
      <div className="dates">
        <div className="date-section">
          <Date
            mode={mode}
            className="job-card-date-start"
            value={dateStart}
            onChange={(v) => onPatch?.({ dateStart: v })}
          />
        </div>

        <div className="date-section">
          <Date
            mode={mode}
            className="job-card-date-end"
            value={dateEnd}
            onChange={(v) => onPatch?.({ dateEnd: v })}
          />
        </div>
      </div>

      {(description.length > 0 || mode === "edit") && (
        <Text
          mode={mode}
          className="text-card-description"
          value={description}
          maxLength={200}
          onChange={(v) => onPatch?.({ description: v })}
        />
      )}
    </div>
  );
};

export default JobCard;
