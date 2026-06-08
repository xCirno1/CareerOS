export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const smoothstep = (t: number) => {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
};

/** Map progress onto a sub-range [start,end] → 0..1. */
export const subProgress = (p: number, start: number, end: number) =>
  clamp01((p - start) / (end - start));

/**
 * Opacity for a caption that should be visible within [start,end] with soft
 * fade edges of width `fade`.
 */
export const bandOpacity = (p: number, start: number, end: number, fade = 0.07) => {
  if (p < start || p > end) return 0;
  const up = clamp01((p - start) / fade);
  const down = clamp01((end - p) / fade);
  return Math.min(up, down);
};
