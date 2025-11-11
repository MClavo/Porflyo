import type { Mode, MonthYearValue } from "./subcomponents/index";
import { BulletText, Date, Text, Title } from "./subcomponents/index";

export type JobCardSaved = {
  title: string;
  company: string;
  location: string;
  description: string;
  dateStart: MonthYearValue;
  dateEnd: MonthYearValue;
};

interface JobCardProps {
  mode?: Mode;
  title: string;
  company: string;
  location?: string;
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
  location = "",
  description,
  dateStart,
  dateEnd,
  onPatch,
  children,
}) => {
  return (
    <div className="job-card" data-mode={mode}>
      {children}
      
      {/* Header: Position title and dates on same line */}
      <div className="job-card-header">
        <Title
          mode={mode}
          value={title}
          className="job-card-title"
          placeholder="Position Title"
          required
          maxLength={60}
          onChange={(v) => onPatch?.({ title: v })}
        />
        
        <div className="job-card-dates">
          <Date
            mode={mode}
            className="job-card-date-start"
            value={dateStart}
            onChange={(v) => onPatch?.({ dateStart: v })}
          />
          <span className="job-card-date-separator">-</span>
          <Date
            mode={mode}
            className="job-card-date-end"
            value={dateEnd}
            onChange={(v) => onPatch?.({ dateEnd: v })}
          />
        </div>
      </div>

      {/* Company and location */}
      <div className="job-card-company-section">
        <Title
          mode={mode}
          value={company}
          className="job-card-company"
          placeholder="Company Name"
          required
          maxLength={60}
          onChange={(v) => onPatch?.({ company: v })}
        />
        
        {(location || mode === "edit") && (
          <>
            <span className="job-card-location-separator">•</span>
            <Text
              mode={mode}
              value={location}
              className="job-card-location"
              placeholder="Location"
              maxLength={50}
              onChange={(v) => onPatch?.({ location: v })}
            />
          </>
        )}
      </div>

      {/* Description as bullet points */}
      {(description.length > 0 || mode === "edit") && (
        <BulletText
          mode={mode}
          className="job-card-description"
          value={description}
          placeholder="Add responsibilities (one per line)..."
          maxLength={500}
          rows={4}
          onChange={(v) => onPatch?.({ description: v })}
        />
      )}
    </div>
  );
};

export default JobCard;
