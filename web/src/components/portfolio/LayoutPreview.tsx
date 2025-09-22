import React from "react";
import { getLayout } from "../../templates";
import { buildTemplateProps } from "../../templates/Template.types";
import type { TemplateLayoutComponentProps } from "../../templates/Template.types";
import type { PortfolioState } from "../../state/Portfolio.types";

export default function LayoutPreview(props: {
  portfolio: PortfolioState;
  sectionsMap: Record<string, React.ReactNode>;
  isEditable: boolean;
}) {

  const { portfolio, sectionsMap, isEditable } = props;
  const Layout = getLayout(portfolio.template) as React.FC<
    TemplateLayoutComponentProps & {
      sectionsMap?: Record<string, React.ReactNode>;
      isEditable?: boolean;
    }
  >;

  const propsForLayout = buildTemplateProps(portfolio);
  
  return (
    <Layout
      {...propsForLayout}
      sectionsMap={sectionsMap}
      isEditable={isEditable}
    />
  );
}
