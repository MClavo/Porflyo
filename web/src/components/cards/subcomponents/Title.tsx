import React from "react";
import { z } from "zod";
import type { BaseFieldProps} from "./Fields.types";

export function Title({
  mode = "view",
  value = "",
  onChange,
  className,
  placeholder = "Title",
  maxLength = 30,
  required
}: BaseFieldProps) {

  const schema = React.useMemo(
    () => z.string().min(required ? 1 : 0, "Required").max(maxLength, `Max ${maxLength} chars`),
    [required, maxLength]
  );

  const [local, setLocal] = React.useState(value);
  const [error, setError] = React.useState<string | undefined>(undefined);


  // Keep local state in sync if parent updates value prop
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
    // Calculate size based on content length (min 1, add buffer for comfort)
    const inputSize = Math.max(placeholder.length, local.length || 1);
    
    return (
      <div className={`${className ?? "title"}-wrapper`}>
        <input
          type="text"
          className={className ?? "title"}
          placeholder={placeholder}
          value={local}
          size={inputSize}
          maxLength={maxLength}
          aria-invalid={!!error}
          aria-label="Title"
          required={required}
          onChange={(e) => handleChange(e.target.value)}
        />
      </div>
    );
  }

  return <h1 className={className ?? "title"}>{value}</h1>;
}
