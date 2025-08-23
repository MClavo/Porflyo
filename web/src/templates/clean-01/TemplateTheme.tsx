import React from "react";
import "./template.css";

interface CleanThemeProps {
  children: React.ReactNode;
}

export const CleanTheme: React.FC<CleanThemeProps> = ({ children }) => {
  return (
    <div className="tpl-clean">
      {children}
    </div>
  );
};
