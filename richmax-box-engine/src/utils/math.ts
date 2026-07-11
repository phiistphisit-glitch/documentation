/**
 * Shared math utilities for engine modules.
 * All inputs and outputs in the same units as the caller (usually mm or mm²).
 */

/** Round to a given number of decimal places. */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/** Convert mm² to m². */
export function mm2ToM2(mm2: number): number {
  return mm2 / 1_000_000;
}

/** Convert m² to mm². */
export function m2ToMm2(m2: number): number {
  return m2 * 1_000_000;
}

/**
 * Calculate waste percentage given used area and total area.
 * Returns 0–100.
 */
export function wastePercent(usedArea: number, totalArea: number): number {
  if (totalArea <= 0) return 0;
  return round(((totalArea - usedArea) / totalArea) * 100, 2);
}

/**
 * Calculate sheet utilisation ratio (0–1).
 */
export function utilisation(usedArea: number, totalArea: number): number {
  if (totalArea <= 0) return 0;
  return round(usedArea / totalArea, 4);
}

/** Clamp a value between min and max. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
