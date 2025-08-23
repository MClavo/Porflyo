import React from "react";
import { CleanTheme } from "./clean-01/TemplateTheme";
import { BoldTheme } from "./bold-01/TemplateTheme";

interface TemplateThemeProviderProps {
  templateId: string;
  children: React.ReactNode;
}

export const TemplateThemeProvider: React.FC<TemplateThemeProviderProps> = ({ 
  templateId, 
  children 
}) => {
  switch (templateId) {
    case "clean-01":
      return <CleanTheme>{children}</CleanTheme>;
    case "bold-01":
      return <BoldTheme>{children}</BoldTheme>;
    default:
      // Fallback to CleanTheme for unknown template IDs
      return <CleanTheme>{children}</CleanTheme>;
  }
};
