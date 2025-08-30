import { type ButtonHTMLAttributes, forwardRef } from "react";
import { GlassElement } from "../glass/GlassElement";
import type { DisplacementOptions } from "../glass/getDisplacementFilter";
import styles from "./GlassKeycapButton.module.css";

type Props = ButtonHTMLAttributes<HTMLButtonElement> &
  Partial<Pick<DisplacementOptions, "height" | "width" | "radius" | "depth" | "strength" | "chromaticAberration">> & {
    /** Size convenience: sets width & height keeping square aspect */
    size?: number; // e.g. 120
    /** Big glyph/letter shown inside the keycap */
    glyph?: string;
  };

export const GlassKeycapButton = forwardRef<HTMLButtonElement, Props>(
  (
    {
      size = 120,
      height,
      width,
      radius = 15,
      depth = 8,
      strength = 90,
      chromaticAberration = 6,
      glyph,
      className,
      children,
      ...btnProps
    },
    ref
  ) => {
    const h = height ?? size;
    const w = width ?? size;

    return (
      <GlassElement
        as="button"
        height={h}
        width={w}
        radius={radius}
        depth={depth}
        strength={strength}
        chromaticAberration={chromaticAberration}
        className={[styles.keycap, className].filter(Boolean).join(" ")}
        ref={ref as React.Ref<HTMLButtonElement>} // Corrected type for ref
        {...btnProps}
      >
        {/* Placa interna superior */}
        <span className={styles.inner} />
        {/* Brillos/filos */}
        <span className={styles.edgeTop} />
        <span className={styles.edgeBottom} />
        {/* Contenido (letra/símbolo) */}
        <span className={styles.glyph}>
          {glyph ? <i aria-hidden>{glyph}</i> : children}
        </span>
      </GlassElement>
    );
  }
);

GlassKeycapButton.displayName = "GlassKeycapButton";
