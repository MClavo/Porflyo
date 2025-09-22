import "./template2.css";
import type { ReactNode } from "react";
import type { TemplateLayoutComponentProps } from "../Template.types";

interface Template2LayoutProps extends TemplateLayoutComponentProps {
  sectionsMap?: Record<string, ReactNode>;
}

export default function Template2Layout({ sectionsMap }: Template2LayoutProps) {

  return (
    <div className="template2">
      <div id="job">{sectionsMap?.job ?? null}</div>
      <div id="text">{sectionsMap?.text ?? null}</div>
      <div id="projects">{sectionsMap?.projects ?? null}</div>
    </div>
  );
}