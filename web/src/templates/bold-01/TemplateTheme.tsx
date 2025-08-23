import React from "react";
import "./template.css";

interface BoldThemeProps {
  children: React.ReactNode;
}

export const BoldTheme: React.FC<BoldThemeProps> = ({ children }) => {
  return (
    <div
      className="text-slate-900 font-semibold"
      style={{
        "--pf-radius": "12px",
        "--pf-primary": "#dc2626",
        "--pf-text": "#111827",
        "--pf-muted": "#4b5563"
      } as React.CSSProperties}
    >
      {children}
    </div>
  );
};
