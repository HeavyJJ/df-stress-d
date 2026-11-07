export function clamp(n, lo, hi) { return n < lo ? lo : n > hi ? hi : n; }
export function percentOf(value, pct) { return Math.round(value * pct / 100); }
