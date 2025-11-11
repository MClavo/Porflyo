export type QualityType = 0 | 1 | 2 | 3;

export function createQualityManager(initialLevel: QualityType = 3) {
  return {
    level: initialLevel as QualityType,
    targetMs: 16.7,
    ema: 16.7,
    update(sampleMs: number) {
      this.ema = this.ema * 0.9 + sampleMs * 0.1;
      if (this.ema > 22 && this.level > 0) this.level = (this.level - 1) as QualityType;
      else if (this.ema < 14 && this.level < 3) this.level = (this.level + 1) as QualityType;
    },
  } as {
    level: QualityType;
    targetMs: number;
    ema: number;
    update(sampleMs: number): void;
  };
}
