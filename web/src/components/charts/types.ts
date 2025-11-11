/**
 * Shared types for chart components
 */

// Recharts tooltip types
export interface TooltipPayloadItem {
  value: number;
  name: string;
  color: string;
  payload: Record<string, unknown>;
}

export interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export interface LegendPayloadItem {
  value: string;
  type: string;
  color: string;
  payload: Record<string, unknown>;
}

export interface LegendProps {
  payload?: LegendPayloadItem[];
}