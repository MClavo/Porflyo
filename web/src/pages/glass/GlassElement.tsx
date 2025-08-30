import type { CSSProperties } from "react";
import { forwardRef, type ElementType, type HTMLAttributes, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { DisplacementOptions } from "./getDisplacementFilter";
import { getDisplacementFilter } from "./getDisplacementFilter";
import { getDisplacementMap } from "./getDisplacementMap";
import styles from "./GlassElement.module.css";

type BaseProps = DisplacementOptions & {
  children?: ReactNode;
  blur?: number;
  debug?: boolean;
  /** Extra className to merge with .box */
  className?: string;
  /** Render element (div, button, etc.) */
  as?: ElementType;
} & HTMLAttributes<HTMLElement>;

export const GlassElement = forwardRef<HTMLElement, BaseProps>(
  (
    {
      height,
      width,
      depth: baseDepth,
      radius,
      children,
      strength,
      chromaticAberration,
      blur = 2,
      debug = false,
      className,
      as: As = "div",
      onMouseDown,
      onMouseUp,
      onPointerDown,
      onPointerUp,
      ...rest
    },
    ref
  ) => {
    const [pressed, setPressed] = useState(false);

    // Reducimos la "profundidad" cuando se pulsa
    const depth = useMemo(() => (pressed ? baseDepth * 0.65 : baseDepth), [pressed, baseDepth]);

    const style: CSSProperties = useMemo(() => {
      const s: CSSProperties = {
        height: `${height}px`,
        width: `${width}px`,
        borderRadius: `${radius}px`,
        backdropFilter: `blur(${blur / 2}px) url('${getDisplacementFilter({
          height,
          width,
          radius,
          depth,
          strength,
          chromaticAberration,
        })}') blur(${blur}px) brightness(1.08) saturate(1.35)`,
        WebkitBackdropFilter: `blur(${blur / 2}px) url('${getDisplacementFilter({
          height,
          width,
          radius,
          depth,
          strength,
          chromaticAberration,
        })}') blur(${blur}px) brightness(1.08) saturate(1.35)`,
      };

      if (debug) {
        s.background = `url("${getDisplacementMap({ height, width, radius, depth })}")`;
        s.boxShadow = "none";
      }
      return s;
    }, [height, width, radius, depth, strength, chromaticAberration, blur, debug]);

    return (
      <As
        ref={ref}
        className={[styles.box, className].filter(Boolean).join(" ")}
        style={style}
        onMouseDown={(e: React.MouseEvent<HTMLElement>) => {
          setPressed(true);
          onMouseDown?.(e);
        }}
        onMouseUp={(e: React.MouseEvent<HTMLElement>) => {
          setPressed(false);
          onMouseUp?.(e);
        }}
        onPointerDown={(e: React.PointerEvent<HTMLElement>) => {
          setPressed(true);
          onPointerDown?.(e);
        }}
        onPointerUp={(e: React.PointerEvent<HTMLElement>) => {
          setPressed(false);
          onPointerUp?.(e);
        }}
        {...rest}
      >
        {children}
      </As>
    );
  }
);

GlassElement.displayName = "GlassElement";
