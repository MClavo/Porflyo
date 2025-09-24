import React from "react";
import { z } from "zod";
import type { BaseFieldProps } from "./Fields.types";
import TextareaAutosize from "react-textarea-autosize";

export function Text({
  mode = "view",
  value = "",
  onChange,
  className,
  placeholder = "Write something…",
  maxLength = 300,
  required,
  rows = 3,
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

  if (mode === "edit") {
    return (
      <TextareaAutosize
        className={className ?? "text"}
        placeholder={placeholder}
        value={local}
        maxLength={maxLength}
        minRows={rows}
        required={required}
        aria-label="Text"
        aria-error={!!error}
        onChange={(e) => handleChange(e.target.value)}
      />
    );
  }
  return <p className={className ?? "text"}>{value}</p>;
}
