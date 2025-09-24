import React from "react";
import { z } from "zod";
import type { Mode } from "./Fields.types";
import type { MonthYearValue } from "./Fields.types";
import "../../../styles/cards/subcomopnents/Date.css";

// Module-level z-index counter to ensure the most recently opened popup is on top.
// Starts above the CSS base (100) used in Date.css
let nextOpenZIndex = 1000;

type MonthYearProps = {
  mode: Mode;
  value?: MonthYearValue; // view y valor inicial para edit
  onChange?: (v: MonthYearValue) => void; // patch al padre (opcional)
  className?: string; // clase para el wrapper
  monthNames?: string[]; // por defecto EN, pásalo si quieres ES
  // Year constraints
  yearMin?: number; // p.ej. 0 o 1900
  yearMax?: number; // p.ej. 9999
  yearPlaceholder?: string;
};

/** Componente mes+año (sin días). En edit:
 *  - Mes: wheel vertical con scroll-snap; seleccionado centrado; clic/scroll actualiza.
 *  - Año: <input type="number"> con validación simple.
 * En view: muestra "MonthName YYYY".
 */
export function Date({
  mode = "view",
  value = { month: 0, year: 2025 },
  onChange,
  className,
  monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  yearMin = 1900,
  yearMax = 2100,
  yearPlaceholder = "YYYY",
}: MonthYearProps) {
  // ── schema for the year
  const yearSchema = React.useMemo(
    () =>
      z
        .number()
        .int("Year must be integer")
        .min(yearMin, `Min ${yearMin}`)
        .max(yearMax, `Max ${yearMax}`),
    [yearMin, yearMax]
  );

  // ── local state only in edit
  const [m, setM] = React.useState<number>(value.month ?? 0);
  const [y, setY] = React.useState<number>(value.year ?? 2024);
  const [yearErr, setYearErr] = React.useState<string | undefined>(undefined);
  // Simple always-visible month list — no show/hide state
  const monthListRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [zIndex, setZIndex] = React.useState<number | undefined>(undefined);
  const [listTranslateY, setListTranslateY] = React.useState<number>(0);

  // If value changes from outside, re-sync when in edit
  React.useEffect(() => {
    if (mode === "edit") {
      if (typeof value.month === "number") setM(value.month);
      if (typeof value.year === "number") setY(value.year);
    }
  }, [value.month, value.year, mode]);

  // No click-outside logic needed for always-visible list

  // Notify parent (if desired)
  const emit = React.useCallback(
    (mm: number, yy: number) => {
      onChange?.({ month: mm, year: yy });
    },
    [onChange]
  );

  // selection handled inline in the month list

  // No centering effect — simple static list
  // Center the selected month in the list when m changes
  React.useEffect(() => {
    const list = monthListRef.current;
    if (!list) return;
    const items = Array.from(list.querySelectorAll('.month-item')) as HTMLElement[];
    if (!items || items.length === 0) return;
    const item = items[m];
    if (!item) return;
    const itemHeight = item.offsetHeight;
  // Prefer the parent container (the visible viewport, e.g. .date-input-container)
  // so the selected month aligns with the container from the start.
  const viewport = list.parentElement as HTMLElement | null;
  // When the popup is open the visible area may change; prefer containerRef if available
  const viewportElem = containerRef.current ?? viewport ?? list;
  const viewportHeight = (viewportElem && viewportElem.clientHeight) ? viewportElem.clientHeight : list.clientHeight;
  // Calculate translateY so the whole list moves and the selected item centers inside the viewport
  const targetTranslate = Math.round(viewportHeight / 2 - (item.offsetTop + itemHeight / 2));
    setListTranslateY(targetTranslate);
  }, [m, isOpen]);

  // Close when clicking outside the container
  React.useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (!target) return;
      if (containerRef.current && containerRef.current.contains(target)) return;
      if (monthListRef.current && monthListRef.current.contains(target)) return;
  setIsOpen(false);
  // restore default stacking when closed
  setZIndex(undefined);
    }
    document.addEventListener('pointerdown', onDocClick);
    return () => document.removeEventListener('pointerdown', onDocClick);
  }, []);

  // (open/close controlled inline on the button and focus/blur handlers)

  // ── year change with validation
  const handleYearChange = (nextStr: string) => {
    // Allow empty (does not trigger error until there is a number)
    if (nextStr.trim() === "") {
      setY(NaN);
      setYearErr(undefined);
      onChange?.({ month: m, year: NaN });
      return;
    }
    // filter out non-numeric characters
    const clean = nextStr.replace(/[^\d-]/g, "");
    const parsed = Number(clean);
    setY(parsed);
    const r = yearSchema.safeParse(parsed);
    setYearErr(r.success ? undefined : r.error.issues[0]?.message);
    if (r.success) emit(m, parsed);
  };

  // ── RENDER
  if (mode === "view") {
    // in view, if you don't want to show anything when there is no valid date:
    if (
      value == null ||
      typeof value.month !== "number" ||
      typeof value.year !== "number" ||
      Number.isNaN(value.year)
    ) {
      return null;
    }
    const label = `${monthNames[(value.month ?? 0) % 12]} ${value.year}`;
    return <span className={className ?? "month-year"}>{label}</span>;
  }

  // EDIT
  return (
    <div className={`month-year-edit ${className ?? ""}`}>
        <div
          ref={containerRef}
          className="date-input-container"
          style={{ position: "relative", overflow: isOpen ? 'visible' : 'hidden', zIndex: zIndex ?? undefined }}
          aria-expanded={isOpen}
        >
        {/* Always-visible simple month list */}
        <div
          ref={monthListRef}
          className="month-list"
          role="listbox"
          aria-label="Month list"
          style={{ transform: `translateY(${listTranslateY}px)` }}
        >
          {monthNames.map((label, idx) => (
            <div
              key={label}
              className={`month-item${idx === m ? ' selected' : ''}`}
              data-idx={idx}
              onClick={(e) => {
                // If closed, open on first click to reveal the full list
                if (!isOpen) {
                  e.stopPropagation();
                  // bring this container to front
                  setZIndex(++nextOpenZIndex);
                  setIsOpen(true);
                  return;
                }
                // If already open, this click selects the month and closes
                setM(idx);
                emit(idx, y);
                setIsOpen(false);
                // restore default stacking when closed
                setZIndex(undefined);
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Year */}
      <div className="year-input-container">
        <input
          type="number"
          inputMode="numeric"
          className="year-input"
          placeholder={yearPlaceholder}
          value={Number.isNaN(y) ? "" : String(y)}
          onChange={(e) => handleYearChange(e.target.value)}
          aria-invalid={!!yearErr}
          aria-label="Year"
          min={yearMin}
          max={yearMax}
        />
        {yearErr && <div className="field-error">{yearErr}</div>}
      </div>
    </div>
  );
}
