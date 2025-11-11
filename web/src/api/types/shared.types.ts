/**
 * Shared small types used across metrics/slots/response types
 */

export interface Units {
  timeBase: 'ds' | 'ms';
  displayTime: 'ms';
}

export interface Baseline {
  windowDays: number;
}

export interface Meta {
  calcVersion: string;
  generatedAt: string;
  timezone: string;
  units: Units;
  baseline?: Baseline;
}

export type TimeUnit = 'ds' | 'ms';

export interface ZScoreConfig {
  metric: string;
  higherIsBetter: boolean;
  useLogTransform?: boolean;
  clampRange?: [-3, 3];
}
