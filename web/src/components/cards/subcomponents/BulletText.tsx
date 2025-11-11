import React from "react";
import { z } from "zod";
import type { BaseFieldProps } from "./Fields.types";
import TextareaAutosize from "react-textarea-autosize";

/**
 * BulletText component - converts line breaks into bullet points automatically
 * In edit mode: shows textarea where each line becomes a bullet
 * In view mode: renders as <ul> with <li> for each non-empty line
 */
export function BulletText({
  mode = "view",
  value = "",
  onChange,
  className,
  placeholder = "Add responsibilities (one per line)...",
  maxLength = 500,
  required,
  rows = 4,
}: BaseFieldProps) {
  const schema = React.useMemo(
    () =>
      z.string().min(required ? 1 : 0, "Required").max(maxLength, `Max ${maxLength} chars`),
    [required, maxLength]
  );

  const [local, setLocal] = React.useState(value);
  const [error, setError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (mode === "edit") setLocal(value);
  }, [value, mode]);

  const handleChange = (next: string) => {
    setLocal(next);
    const result = schema.safeParse(next);
    setError(result.success ? undefined : result.error.issues[0]?.message);

    onChange?.(next);
  };

  // Convert text to bullet points - split by line breaks and filter empty lines
  const bullets = React.useMemo(() => {
    return value
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }, [value]);

  if (mode === "edit") {
    return (
      <div className={`${className ?? "bullet-text"}-wrapper`} style={{ position: 'relative' }}>
        <TextareaAutosize
          className={className ?? "bullet-text"}
          placeholder={placeholder}
          value={local}
          maxLength={maxLength}
          minRows={rows}
          required={required}
          aria-label="Bullet Text"
          aria-error={!!error}
          onChange={(e) => handleChange(e.target.value)}
          style={{
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit',
          }}
        />
        {local && bullets.length > 0 && (
          <div style={{
            fontSize: '11px',
            color: '#999',
            marginTop: '4px',
            fontStyle: 'italic'
          }}>
            {bullets.length} bullet point{bullets.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>
    );
  }

  // View mode - render as bullet list
  if (bullets.length === 0) return null;

  return (
    <ul className={className ?? "bullet-text"}>
      {bullets.map((bullet, index) => (
        <li key={index}>{bullet}</li>
      ))}
    </ul>
  );
}
