import React from 'react';
import './KpiGrid.css';

export interface KpiGridProps {
  children: React.ReactNode;
  columns?: {
    base?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const KpiGrid: React.FC<KpiGridProps> = ({
  children,
  columns = { base: 1, sm: 2, md: 3, lg: 4, xl: 6 },
  gap = 6,
  className = ''
}) => {
  const getGridClass = () => {
    const classes = ['kpi-grid'];
    
    if (columns.base) classes.push(`kpi-grid--cols-base-${columns.base}`);
    if (columns.sm) classes.push(`kpi-grid--cols-sm-${columns.sm}`);
    if (columns.md) classes.push(`kpi-grid--cols-md-${columns.md}`);
    if (columns.lg) classes.push(`kpi-grid--cols-lg-${columns.lg}`);
    if (columns.xl) classes.push(`kpi-grid--cols-xl-${columns.xl}`);
    
    classes.push(`kpi-grid--gap-${gap}`);
    
    if (className) classes.push(className);
    
    return classes.join(' ');
  };

  return (
    <div className={getGridClass()}>
      {children}
    </div>
  );
};

export default KpiGrid;