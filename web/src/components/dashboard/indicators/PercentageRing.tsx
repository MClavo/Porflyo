/**
 * PercentageRing - Anillo de progreso con porcentaje centrado
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import './PercentageRing.css';

export interface PercentageRingProps {
  value: number; // 0-100 percentage
  size?: number;
  thickness?: number;
  showPercentage?: boolean;
  animated?: boolean;
}

export const PercentageRing: React.FC<PercentageRingProps> = ({
  value,
  size = 48,
  thickness = 6,
  showPercentage = true,
  animated = true
}) => {
  const normalizedValue = Math.max(0, Math.min(100, value));
  
  // Colores dinámicos basados en el porcentaje
  const getColor = (val: number) => {
    if (val >= 70) return '#22c55e'; // verde
    if (val >= 40) return '#f59e0b'; // naranja
    return '#ef4444'; // rojo
  };
  
  const color = getColor(normalizedValue);
  const backgroundRingColor = 'rgba(255, 255, 255, 0.15)';
  
  const data = [
    { name: 'filled', value: normalizedValue },
    { name: 'empty', value: 100 - normalizedValue }
  ];

  return (
    <div className={`percentage-ring ${animated ? 'percentage-ring--animated' : ''}`} style={{ width: size, height: size }}>
      <div className="percentage-ring__chart">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size / 2 - thickness}
              outerRadius={size / 2 - 2}
              startAngle={270}
              endAngle={-90}
              dataKey="value"
              stroke="none"
              cornerRadius={thickness / 2}
            >
              <Cell fill={color} />
              <Cell fill={backgroundRingColor} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      {showPercentage && (
        <div className="percentage-ring__label" style={{ 
          fontSize: size * 0.25,
          color: color 
        }}>
          {normalizedValue.toFixed(0)}%
        </div>
      )}
    </div>
  );
};

export default PercentageRing;