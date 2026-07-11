/**
 * Material Engine — selects the appropriate material and calculates paper usage.
 *
 * Selection logic:
 *   1. Filter by fluteType matching spec.flute (or "LINER" for liners).
 *   2. Filter by active = true.
 *   3. Prefer the material whose standard sheet size accommodates the flat best.
 */

import { round, mm2ToM2, wastePercent } from "@/utils/math";
import type { BoxSpec, FlatSize } from "@/types/box";
import type { MaterialMaster, PaperUsage } from "@/types/material";
import type { EngineResult } from "@/types/result";

/**
 * Select the best matching material for a given spec and flat size.
 *
 * @param spec       - Customer box spec (for flute type).
 * @param flatSize   - Computed blank dimensions.
 * @param piecesPerSheet - From the layout engine.
 * @param materials  - Full material master list.
 * @returns PaperUsage summary, or error if no material matches.
 */
export function calculateMaterialUsage(
  spec: BoxSpec,
  flatSize: FlatSize,
  piecesPerSheet: number,
  materials: MaterialMaster[]
): EngineResult<PaperUsage> {
  if (piecesPerSheet <= 0) {
    return { ok: false, error: "piecesPerSheet must be > 0" };
  }

  // Filter to active materials that match the required flute type
  const candidates = materials.filter(
    (m) =>
      m.active &&
      m.fluteType.toUpperCase() === spec.flute.toUpperCase()
  );

  if (candidates.length === 0) {
    return {
      ok: false,
      error: `No active material found for flute type "${spec.flute}"`,
    };
  }

  // Prefer the material whose standard sheet is largest (more options for layout)
  const material = candidates.reduce((best, m) =>
    m.standardSheetLength * m.standardSheetWidth >
    best.standardSheetLength * best.standardSheetWidth
      ? m
      : best
  );

  const sheetArea = material.standardSheetLength * material.standardSheetWidth; // mm²
  const blankArea = flatSize.area; // mm²
  const usedAreaPerSheet = blankArea * piecesPerSheet;

  const totalSheets = Math.ceil(spec.quantity / piecesPerSheet);
  const totalAreaM2 = round(mm2ToM2(sheetArea) * totalSheets, 4);

  // Weight: area (m²) × gsm (g/m²) → grams → kg
  const totalWeightKg = round((totalAreaM2 * material.gsm) / 1000, 2);

  const waste = wastePercent(usedAreaPerSheet, sheetArea);

  return {
    ok: true,
    data: {
      material,
      piecesPerSheet,
      totalSheets,
      totalAreaM2,
      totalWeightKg,
      wastePercent: waste,
    },
  };
}
