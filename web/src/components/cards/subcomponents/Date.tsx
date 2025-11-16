import React from "react";
import { z } from "zod";
import type { Mode } from "./Fields.types";
import type { MonthYearValue } from "./Fields.types";
import "../../../styles/cards/subcomopnents/Date.css";

type MonthYearProps = {
  mode: Mode;
  value?: MonthYearValue;
  onChange?: (v: MonthYearValue) => void;
  className?: string;
  monthNames?: string[];
  yearMin?: number;
  yearMax?: number;
  yearPlaceholder?: string;
};

/**
 * Simple Month/Year component for work experience dates.
 * In edit mode: month dropdown + year input
 * In view mode: displays "Month Year"
 */
export function Date({
  mode = "view",
  value = { month: 0, year: 2024 },
  onChange,
  className,
  monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
  yearMin = 1900,
  yearMax = 2100,
  yearPlaceholder = "YYYY",
}: MonthYearProps) {
  
  const yearSchema = React.useMemo(
    () => z.number().int().min(yearMin).max(yearMax),
    [yearMin, yearMax]
  );

  const [localMonth, setLocalMonth] = React.useState<number>(value?.month ?? 0);
  const [localYear, setLocalYear] = React.useState<number>(value?.year ?? 2024);
  const [yearError, setYearError] = React.useState<string>("");

  // Sync with external value changes
  React.useEffect(() => {
    if (value?.month !== undefined) setLocalMonth(value.month);
    if (value?.year !== undefined) setLocalYear(value.year);
  }, [value?.month, value?.year]);

  const handleMonthChange = (month: number) => {
    setLocalMonth(month);
    onChange?.({ month, year: localYear });
  };

  const handleYearChange = (yearStr: string) => {
    // Remove non-numeric characters and limit to 4 digits
    const cleanStr = yearStr.replace(/\D/g, '').slice(0, 4);
    
    if (cleanStr === "") {
      setYearError("");
      setLocalYear(0);
      return;
    }

    const year = parseInt(cleanStr, 10);
    setLocalYear(year);

    if (isNaN(year)) {
      setYearError("Invalid year");
      return;
    }

    const validation = yearSchema.safeParse(year);
    if (!validation.success) {
      setYearError(`Year must be between ${yearMin} and ${yearMax}`);
      return;
    }

    setYearError("");
    onChange?.({ month: localMonth, year });
  };

  if (mode === "view") {
    if (!value || typeof value.month !== "number" || typeof value.year !== "number") {
      return null;
    }
    // Show "Present" if month is -1
    if (value.month === -1) {
      return (
        <span className={`date-view date-present ${className ?? ""}`}>
          Present
        </span>
      );
    }
    return (
      <span className={`date-view ${className ?? ""}`}>
        {monthNames[value.month % 12]} {value.year}
      </span>
    );
  }

  const isPresent = localMonth === -1;

  return (
    <div className={`date-edit ${isPresent ? "date-present" : ""} ${className ?? ""}`}>
      <select
        className="date-month-select"
        value={localMonth}
        onChange={(e) => handleMonthChange(parseInt(e.target.value, 10))}
        aria-label="Month"
      >
        <option value={-1} className="date-present-option">Present</option>
        <option disabled>──────────</option>
        {monthNames.map((name, index) => (
          <option key={index} value={index}>
            {name}
          </option>
        ))}
      </select>

      <div className="date-year-container">
        <input
          type="text"
          inputMode="numeric"
          className={`date-year-input ${yearError ? "error" : ""}`}
          placeholder={yearPlaceholder}
          value={localYear === 0 ? "" : localYear.toString()}
          onChange={(e) => handleYearChange(e.target.value)}
          maxLength={4}
          aria-label="Year"
          aria-invalid={!!yearError}
        />
        {yearError && <div className="date-error">{yearError}</div>}
      </div>
    </div>
  );
}
