/**
 * Metrics-related types (moved from ../types.ts)
 * Do NOT change these definitions — they mirror backend payloads.
 */

export interface DeviceMix {
  desktopPct: number | null;
  mobileTabletPct: number | null;
}

export interface DailyRaw {
  views: number;
  emailCopies: number;
  desktopViews: number;
  mobileTabletViews: number;
  sumScrollScore: number;
  sumScrollTime: number; // in timeBase units (ds)
  qualityVisits: number;
  projectViewTimeTotal: number; // in timeBase units (ds)
  projectExposuresTotal: number;
  tffiSumMs: number;
  tffiCount: number;
  socialClicksTotal?: number; // optional
}

export interface DailyDerived {
  deviceMix: DeviceMix;
  engagementAvg: number | null;
  avgScrollTimeMs: number | null; // converted to ms
  avgCardViewTimeMs: number | null; // converted to ms
  tffiMeanMs: number | null; // converted to ms
  emailConversion: number | null; // fraction 0..1
  qualityVisitRate?: number | null; // optional, fraction 0..1
  socialCtr?: number | null; // optional, fraction 0..1
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD format
  raw: DailyRaw;
  derived?: DailyDerived; // present if backend computes it
  zScores?: { [metricName: string]: number }; // optional z-scores per metric
}

export interface WindowAggregation {
  windowDays: number;
  views: number;
  engagementAvg: number | null;
  avgScrollTimeMs: number | null;
  avgCardViewTimeMs: number | null;
  tffiMeanMs: number | null;
  emailConversion: number | null;
  qualityVisitRate?: number | null;
  deltaPct?: number | null; // optional delta vs previous period
}

export interface ProjectWindowAggregation {
  projectId: number;
  windowDays: number;
  avgViewTimeMs: number | null;
  codeCtr: number | null;
  liveCtr: number | null;
  deltaPct?: number | null; // optional delta vs previous period
}
