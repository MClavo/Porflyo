/**
 * MiniIndicator - Small visual indicators using recharts
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

export interface MiniIndicatorProps {
  value: number; // 0-100 percentage
  color?: string;
  size?: number;
  thickness?: number;
}

export const MiniProgressRing: React.FC<MiniIndicatorProps> = ({
  value,
  color = '#3b82f6',
  size = 32,
  thickness = 4
}) => {
  const normalizedValue = Math.max(0, Math.min(100, value));
  
  const data = [
    { name: 'filled', value: normalizedValue },
    { name: 'empty', value: 100 - normalizedValue }
  ];

  return (
    <div style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={size / 2 - thickness}
            outerRadius={size / 2}
            startAngle={90}
            endAngle={-270}
            dataKey="value"
          >
            <Cell fill={color} />
            <Cell fill="rgba(255, 255, 255, 0.1)" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export interface MiniBarProps {
  value: number; // 0-100 percentage
  color?: string;
  width?: number;
  height?: number;
}

export const MiniProgressBar: React.FC<MiniBarProps> = ({
  value,
  color = '#3b82f6',
  width = 60,
  height = 8
}) => {
  const normalizedValue = Math.max(0, Math.min(100, value));
  
  return (
    <div 
      style={{
        width,
        height,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: height / 2,
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <div
        style={{
          width: `${normalizedValue}%`,
          height: '100%',
          backgroundColor: color,
          borderRadius: height / 2,
          transition: 'width 0.5s ease-in-out'
        }}
      />
    </div>
  );
};

export default { MiniProgressRing, MiniProgressBar };