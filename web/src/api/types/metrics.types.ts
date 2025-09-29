/**
 * Metrics-related types (moved from ../types.ts)
 * Do NOT change these definitions — they mirror backend payloads.
 */

export interface DeviceMix {
  desktopPct: number | null;
  mobileTabletPct: number | null;
}

export interface Zscore {
  visits: number | null;    // -1 to +1
  engagement: number | null; // -1 to +1
  ttfi: number | null;      // -1 to +1
}

export interface DailyRaw {
  views: number;
  activeTime: number; // in timeBase units (ds)
  emailCopies: number;
  desktopViews: number;
  mobileTabletViews: number;
  sumScrollScore: number;
  sumScrollTime: number; // in timeBase units (ds)
  qualityVisits: number;
  projectViewTimeTotal: number; // in timeBase units (ds)
  projectExposuresTotal: number;
  projectCodeViewsTotal: number;
  projectLiveViewsTotal: number;
  tffiSumMs: number;
  tffiCount: number;
  socialClicksTotal?: number; // optional
}

export interface DailyDerived {
  avgViewTime: number | null; // ds
  deviceMix: DeviceMix;
  engagementAvg: number | null;
  avgScrollTimeMs: number | null; // converted to ms
  avgSessionTime: number | null; // ds
  avgCardViewTimeMs: number | null; // converted to ms
  tffiMeanMs: number | null; // converted to ms
  emailConversion: number | null; // fraction 0..1
  qualityVisitRate?: number | null; // optional fraction 0..1
}

export interface DailyEntry {
  date: string; // YYYY-MM-DD format
  raw: DailyRaw;
  derived: DailyDerived; 
  zScores: Zscore; 
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
