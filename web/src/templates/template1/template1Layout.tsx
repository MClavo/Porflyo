import "./template1.css";
import type { ReactNode } from "react";
import type { TemplateLayoutComponentProps } from "../Template.types";

interface Template1LayoutProps extends TemplateLayoutComponentProps {
  sectionsMap?: Record<string, ReactNode>;
}

export default function Template1Layout({ sectionsMap, isEditable }: Template1LayoutProps) {

  return (
    <div className="template1" data-mode={isEditable ? "edit" : "view"}>
      <div id="about">{sectionsMap?.about ?? null}</div>
      <div id="projects">{sectionsMap?.projects ?? null}</div>
      <div id="text">{sectionsMap?.text ?? null}</div>
      <div id="experiences">{sectionsMap?.experiences ?? null}</div>
    </div>
  );
}