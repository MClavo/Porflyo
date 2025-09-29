# Porflyo — Derived Metrics & z-Scores Reference

This document defines **derived metrics**, **window aggregations**, and **z-score** calculations for Porflyo dashboards. It is implementation-agnostic and suitable for backend computation with frontend presentation.

---

## Conventions

| Symbol | Meaning |
|---|---|
| `safe_div(a,b)` | `a/b` if `b > 0`, else `null` (or `0` if preferred) |
| `to_ms(x)` | If stored in **deciseconds (ds)**: `x * 100`; if stored in **milliseconds (ms)**: `x` |
| Window `R` | Set of days in the selected range (e.g., last 10/30/60 days) |
| `Σ_R` | Sum over the window `R` |
| Units | Ratios are fractions `0..1` (multiply by 100 in UI) |

---

## Derived — Portfolio **per day**

For day `d` variables:  
`v=views`, `e=emailCopies`, `vd=desktopViews`, `vm=mobileTabletViews`,  
`S=sumScrollScore`, `T=sumScrollTime`, `q=qualityVisits`,  
`PVT=projectViewTimeTotal`, `PE=projectExposuresTotal`,  
`TS=tffiSumMs`, `TC=tffiCount`, `SC=socialClicksTotal (optional)`.

| Derived metric | Formula |
|---|---|
| `deviceMix.desktopPct` | `safe_div(vd, vd + vm)` |
| `deviceMix.mobileTabletPct` | `safe_div(vm, vd + vm)` |
| `engagementAvg` | `safe_div(S, v)` |
| `avgScrollTimeMs` | `safe_div(to_ms(T), v)` |
| `avgCardViewTimeMs` | `safe_div(to_ms(PVT), PE)` |
| `tffiMeanMs` | `safe_div(TS, TC)` |
| `emailConversion` | `safe_div(e, v)` |
| `qualityVisitRate` *(optional)* | `safe_div(q, v)` |
| `socialCtr` *(optional)* | `safe_div(SC, v)` |

---

## Derived — **Project per day**

Per project `p` on day `d`: `Xp=exposures`, `VTp=viewTime`, `CVp=codeViews`, `LVp=liveViews`.

| Derived metric (project) | Formula |
|---|---|
| `avgViewTimeMs[p]` | `safe_div(to_ms(VTp), Xp)` |
| `codeCtr[p]` | `safe_div(CVp, Xp)` |
| `liveCtr[p]` | `safe_div(LVp, Xp)` |

---

## Derived — **Window aggregations** `R` (portfolio)

| Metric in window `R` | Formula |
|---|---|
| `views_R` | `Σ_R v` |
| `engagementAvg_R` | `safe_div(Σ_R S, Σ_R v)` |
| `avgScrollTimeMs_R` | `safe_div(Σ_R to_ms(T), Σ_R v)` |
| `avgCardViewTimeMs_R` | `safe_div(Σ_R to_ms(PVT), Σ_R PE)` |
| `tffiMeanMs_R` | `safe_div(Σ_R TS, Σ_R TC)` |
| `emailConversion_R` | `safe_div(Σ_R e, Σ_R v)` |
| `qualityVisitRate_R` *(optional)* | `safe_div(Σ_R q, Σ_R v)` |

---

## Derived — **Window aggregations** `R` (per project)

| Metric in window `R` (project `p`) | Formula |
|---|---|
| `avgViewTimeMs_R[p]` | `safe_div(Σ_R to_ms(VTp), Σ_R Xp)` |
| `codeCtr_R[p]` | `safe_div(Σ_R CVp, Σ_R Xp)` |
| `liveCtr_R[p]` | `safe_div(Σ_R LVp, Σ_R Xp)` |

---

## Delta vs previous period (optional)

For metric `X` in window `R` and the immediately previous window `R_prev` of the same size:

| Delta % | Formula |
|---|---|
| `deltaPct` | `safe_div( X_R - X_Rprev, abs(X_Rprev) + 1e-9 )` |

---

## z-Scores (normalization vs personal baseline)

**Definition:** `(value - mean_window) / std_window`, using **only previous days** (exclude current day).

### Typical selection
- **Higher = better:** `visits`, `engagementAvg`, `qualityVisitRate`, `socialCtr`.
- **Lower = better:** `tffiMeanMs` *(recommend log transform)*.

### Calculation for day `d` with previous window of `W` days

Let `x_d` be the value for day `d`, and `B_d = { x_{d-1}, …, x_{d-W} }`. If `n = |B_d| < 2` → return `z = 0`.

| Step | Formula |
|---|---|
| Mean | `μ = (1/n) * Σ_{i∈B_d} x_i` |
| Std (sample) | `σ = sqrt( max( (Σ(x_i − μ)^2)/(n − 1), 0 ) )` |
| z (higher=better) | `z = (x_d − μ) / σ` if `σ > 0`, else `0` |

### For “lower = better” metrics
| Option | Formula |
|---|---|
| A) Sign invert | `z_display = − z` |
| B) Log + invert *(recommended for TTFI)* | `x' = ln(max(x,1))` → compute `z'` with `x'` → `z_display = − z'` |

### Visual clamping (optional)

| Step | Formula |
|---|---|
| Clamp | `z_clamped = clamp(z_display, −3, +3)` |
| Coloring | `> +1` green, `[-1, +1]` neutral, `< −1` amber/red |

---

## Heatmap (extras)

| Metric | Formula |
|---|---|
| `activeCells` | `count(c ∈ cells : c.value > 0)` |
| `coverage` | `safe_div(activeCells, K)` with `K=400 (or 350)` |
| `normValue` (0..1, per day) | `safe_div(value − minValue, maxValue − minValue)` if `max > min` |

---

## Notes

- Prefer computing **derived metrics** in the **backend** for consistency; the frontend formats and orders.
- Use **deciseconds (ds)** in storage to save space; convert to **ms** at serialization or in UI.  
- Always include metadata in responses: `calcVersion`, `generatedAt`, `timezone`, `units`, `baseline.windowDays`.
