// Numeric helpers.

/** Clamp n into [lo, hi]. */
export function clamp(n, lo, hi) {
  if (n < lo) return lo;
  if (n > hi) return hi;
  return n;
}

/** Percentage (0-100) of value, rounded to an integer. */
export function percentOf(value, pct) {
  return Math.round(value * pct / 100);
}
