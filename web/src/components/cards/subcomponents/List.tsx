import React from "react";
import { z } from "zod";
import type { ListProps } from "./Fields.types";

export function List({
  mode,
  items = [],
  onChange,
  className,
  maxItems = 20,
}: ListProps) {
  const schema = React.useMemo(
    () =>
      z
        .array(z.string().min(1, "Required"))
        .max(maxItems, `Max ${maxItems} items`),
    [maxItems]
  );

  const [local, setLocal] = React.useState<string[]>(items);
  const [error, setError] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if (mode === "edit") setLocal(items);
  }, [items, mode]);

  const validateAndNotify = (arr: string[]) => {
    const r = schema.safeParse(arr);
    setError(r.success ? undefined : r.error.issues[0]?.message);
    onChange?.(arr);
  };

  const update = (i: number, v: string) => {
    const next = [...local];
    next[i] = v;
    setLocal(next);
    validateAndNotify(next);
  };

  const add = () => {
    if (local.length >= maxItems) return;
    const next = [...local, ""];
    setLocal(next);
    validateAndNotify(next);
  };

  const remove = (i: number) => {
    const next = local.filter((_, idx) => idx !== i);
    setLocal(next);
    validateAndNotify(next);
  };

  return (
    <ul className={`list ${className ?? ""}`}>
      {mode === "edit" ? (
        <>
          {local.map((t, i) => (
            <li key={i}>
              <input
                className="list-element"
                value={t}
                placeholder="introduce"
                onChange={(e) => update(i, e.target.value)}
              />
              <button
                type="button"
                className="icon-btn"
                onClick={() => remove(i)}
                aria-label="Remove"
              >
                x
              </button>
            </li>
          ))}
          <li>
            <button className="btn tertiary" type="button" onClick={add}>
              + Add technology
            </button>
          </li>
          {error && <li className="field-error">{error}</li>}
        </>
      ) : (
        items.map((t, i) => <li key={i}>{t}</li>)
      )}
    </ul>
  );
}
