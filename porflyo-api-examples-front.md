# Porflyo — API Examples for Frontend (Routes + Sample JSON)

This document shows **the routes your frontend will call** and **exact sample JSON payloads** it will receive.
It matches the data model we agreed on: the backend returns **all slots** (with decoded heatmaps) and **N months** of daily metrics; the frontend keeps them in state and only **refreshes “today”** when needed.

> All responses should include shared metadata for versioning and units.

---

## Common Metadata (present in all responses)

```json
{
  "meta": {
    "calcVersion": "2025.09.26-r1",
    "generatedAt": "2025-09-26T13:15:00Z",
    "timezone": "Europe/Madrid",
    "units": { "timeBase": "ds", "displayTime": "ms" },
    "baseline": { "windowDays": 28 }
  }
}
```

- `timeBase` = storage unit for times (e.g., `ds` = deciseconds).  
- `displayTime` = recommended output unit (e.g., `ms`).  
- `baseline.windowDays` is used if the backend also returns `zScores` per day.

---

## 1) Bootstrap (load everything once)

**Route**

```
GET /metrics/bootstrap?portfolioId=<id>&months=<N>
```

- Returns **N months** of `dailyAgg` and **all available slots** (typically up to 10, rotating).
- Heatmaps are **decoded** (no blobs) and included as `cells`.

**Sample Response (excerpt)**

```json
{
  "meta": {
    "calcVersion": "2025.09.26-r1",
    "generatedAt": "2025-09-26T13:15:00Z",
    "timezone": "Europe/Madrid",
    "units": { "timeBase": "ds", "displayTime": "ms" },
    "baseline": { "windowDays": 28 }
  },

  "dailyAgg": [
    {
      "date": "2025-09-24",
      "raw": {
        "views": 110,
        "emailCopies": 3,
        "desktopViews": 72,
        "mobileTabletViews": 38,
        "sumScrollScore": 4800,
        "sumScrollTime": 16500,
        "qualityVisits": 60,
        "projectViewTimeTotal": 86000,
        "projectExposuresTotal": 295,
        "tffiSumMs": 82000,
        "tffiCount": 98,
        "socialClicksTotal": 7
      },
      "derived": {
        "deviceMix": { "desktopPct": 0.655, "mobileTabletPct": 0.345 },
        "engagementAvg": 43.636,
        "avgScrollTimeMs": 1500,
        "avgCardViewTimeMs": 2915,
        "tffiMeanMs": 837,
        "emailConversion": 0.0273
      },
      "zScores": { "visits": 0.40, "engagement": 0.10, "tffi": -0.20 }
    },
    {
      "date": "2025-09-25",
      "raw": {
        "views": 134,
        "emailCopies": 5,
        "desktopViews": 90,
        "mobileTabletViews": 44,
        "sumScrollScore": 5200,
        "sumScrollTime": 17900,
        "qualityVisits": 74,
        "projectViewTimeTotal": 90500,
        "projectExposuresTotal": 312,
        "tffiSumMs": 84500,
        "tffiCount": 104,
        "socialClicksTotal": 6
      },
      "derived": {
        "deviceMix": { "desktopPct": 0.672, "mobileTabletPct": 0.328 },
        "engagementAvg": 38.806,
        "avgScrollTimeMs": 1336,
        "avgCardViewTimeMs": 2901,
        "tffiMeanMs": 812,
        "emailConversion": 0.0373
      },
      "zScores": { "visits": 0.65, "engagement": -0.30, "tffi": 0.15 }
    },
    {
      "date": "2025-09-26",
      "raw": {
        "views": 123,
        "emailCopies": 4,
        "desktopViews": 80,
        "mobileTabletViews": 43,
        "sumScrollScore": 5230,
        "sumScrollTime": 18400,
        "qualityVisits": 67,
        "projectViewTimeTotal": 92000,
        "projectExposuresTotal": 310,
        "tffiSumMs": 84000,
        "tffiCount": 102,
        "socialClicksTotal": 9
      },
      "derived": {
        "deviceMix": { "desktopPct": 0.650, "mobileTabletPct": 0.350 },
        "engagementAvg": 42.520,
        "avgScrollTimeMs": 1495,
        "avgCardViewTimeMs": 2968,
        "tffiMeanMs": 823,
        "emailConversion": 0.0325
      },
      "zScores": { "visits": 0.18, "engagement": -0.07, "tffi": 0.22 }
    }
  ],

  "slots": [
    {
      "date": "2025-09-24",
      "projects": [
        { "projectId": 101, "exposures": 62, "viewTime": 1850, "codeViews": 14, "liveViews": 6 },
        { "projectId": 102, "exposures": 51, "viewTime": 1550, "codeViews": 9,  "liveViews": 5 }
      ],
      "heatmap": {
        "meta": { "rows": 64, "columns": 1024, "k": 400 },
        "cells": [
          { "index": 12345, "value": 87, "count": 12 },
          { "index": 23456, "value": 53, "count": 9  },
          { "index": 34567, "value": 31, "count": 6  }
        ]
      }
    },
    {
      "date": "2025-09-25",
      "projects": [
        { "projectId": 101, "exposures": 70, "viewTime": 2100, "codeViews": 19, "liveViews": 8 },
        { "projectId": 103, "exposures": 58, "viewTime": 1620, "codeViews": 11, "liveViews": 7 }
      ],
      "heatmap": {
        "meta": { "rows": 64, "columns": 1024, "k": 400 },
        "cells": [
          { "index": 12001, "value": 95, "count": 13 },
          { "index": 22022, "value": 49, "count": 7  }
        ]
      }
    },
    {
      "date": "2025-09-26",
      "projects": [
        { "projectId": 101, "exposures": 70, "viewTime": 2100, "codeViews": 19, "liveViews": 8 },
        { "projectId": 104, "exposures": 40, "viewTime": 980,  "codeViews": 5,  "liveViews": 2 }
      ],
      "heatmap": {
        "meta": { "rows": 64, "columns": 1024, "k": 400 },
        "cells": [
          { "index": 18080, "value": 74, "count": 11 },
          { "index": 38011, "value": 37, "count": 5  }
        ]
      }
    }
  ]
}
```

> Notes:
> - `viewTime` in slots is shown here in **deciseconds (ds)** to keep numbers small, following `units.timeBase`.  
> - The frontend converts using `to_ms(x)` if it wants milliseconds.

---

## 2) Refresh “today” only

**Route**

```
GET /metrics/today?portfolioId=<id>
```

- Returns **only** the current day, to merge into the store without re-downloading history.

**Sample Response**

```json
{
  "meta": {
    "calcVersion": "2025.09.26-r1",
    "generatedAt": "2025-09-26T15:12:10Z",
    "timezone": "Europe/Madrid",
    "units": { "timeBase": "ds", "displayTime": "ms" },
    "baseline": { "windowDays": 28 }
  },
  "date": "2025-09-26",
  "daily": {
    "raw": {
      "views": 126,
      "emailCopies": 4,
      "desktopViews": 83,
      "mobileTabletViews": 43,
      "sumScrollScore": 5400,
      "sumScrollTime": 19120,
      "qualityVisits": 70,
      "projectViewTimeTotal": 9410,
      "projectExposuresTotal": 319,
      "tffiSumMs": 86200,
      "tffiCount": 105,
      "socialClicksTotal": 10
    },
    "derived": {
      "deviceMix": { "desktopPct": 0.659, "mobileTabletPct": 0.341 },
      "engagementAvg": 42.857,
      "avgScrollTimeMs": 1517,
      "avgCardViewTimeMs": 2949,
      "tffiMeanMs": 821,
      "emailConversion": 0.0317
    },
    "zScores": { "visits": 0.22, "engagement": -0.05, "tffi": 0.25 }
  },
  "slot": {
    "projects": [
      { "projectId": 101, "exposures": 72, "viewTime": 2180, "codeViews": 20, "liveViews": 8 },
      { "projectId": 104, "exposures": 43, "viewTime": 1000, "codeViews": 6,  "liveViews": 3 }
    ],
    "heatmap": {
      "meta": { "rows": 64, "columns": 1024, "k": 400 },
      "cells": [
        { "index": 18080, "value": 76, "count": 12 },
        { "index": 38011, "value": 39, "count": 5  }
      ]
    }
  }
}
```

---

## 3) Month (lazy load a single month)

**Route**

```
GET /metrics/month?portfolioId=<id>&month=YYYY-MM
```

- Returns **only that month** of `dailyAgg`

**Sample Response (excerpt)**

```json
{
  "meta": {
    "calcVersion": "2025.09.26-r1",
    "generatedAt": "2025-08-31T23:59:59Z",
    "timezone": "Europe/Madrid",
    "units": { "timeBase": "ds", "displayTime": "ms" },
    "baseline": { "windowDays": 28 }
  },
  "dailyAgg": [
    { "date": "2025-08-01", "raw": { "views": 98,  "...": "..." }, "derived": { "...": "..." }, "zScores":{...} },
    { "date": "2025-08-02", "raw": { "views": 120, "...": "..." }, "derived": { "...": "..." }, "zScores":{...} }
    // ...
  ]
}
```

---

## 5) Suggested Frontend State Shape (TypeScript)

```ts
type DeviceMix = { desktopPct: number | null; mobileTabletPct: number | null };

type DailyRaw = {
  views: number;
  emailCopies: number;
  desktopViews: number;
  mobileTabletViews: number;
  sumScrollScore: number;
  sumScrollTime: number;
  qualityVisits: number;
  projectViewTimeTotal: number;
  projectExposuresTotal: number;
  tffiSumMs: number;
  tffiCount: number;
  socialClicksTotal?: number;
};

type DailyDerived = {
  deviceMix: DeviceMix;
  engagementAvg: number | null;
  avgScrollTimeMs: number | null;
  avgCardViewTimeMs: number | null;
  tffiMeanMs: number | null;
  emailConversion: number | null;
};

type DailyEntry = {
  date: string;              // YYYY-MM-DD
  raw: DailyRaw;
  derived?: DailyDerived;    // present if backend computes it
  zScores?: { [k: string]: number }; // optional z-scores per metric
};

type ProjectRaw = {
  projectId: number;
  exposures: number;
  viewTime: number;   // ds if timeBase=ds
  codeViews: number;
  liveViews: number;
};

type HeatmapCell = { index: number; value: number; count: number };
type Heatmap = { meta: { rows: number; columns: number; k: number }, cells: HeatmapCell[] };

type SlotEntry = {
  date: string;              // YYYY-MM-DD
  projects: ProjectRaw[];
  heatmap: Heatmap;
};

type BootstrapResponse = {
  meta: {
    calcVersion: string;
    generatedAt: string;
    timezone: string;
    units: { timeBase: 'ds' | 'ms'; displayTime: 'ms' };
    baseline?: { windowDays: number };
  };
  dailyAgg: DailyEntry[];
  slots: SlotEntry[];
};
```

---

## Notes & Best Practices

- The frontend **loads `/metrics/bootstrap` once**, stores everything, and only refreshes **`/metrics/today`** when the user clicks “Update”.
- No blobs: heatmaps arrive **decoded** as `cells`.
- With `zScores`, the frontend can color the calendar without new requests.
- Always honor `meta.units` when displaying times (`ds` → `ms`).

---
