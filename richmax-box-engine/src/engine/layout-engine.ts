/**
 * Layout Engine — determines how many flat blanks fit on a press sheet,
 * in both normal and 90°-rotated orientations, and selects the best layout.
 *
 * Algorithm:
 *   For each candidate sheet size:
 *     Orientation NORMAL   → cols = ⌊sheetL / flatL⌋, rows = ⌊sheetW / flatW⌋
 *     Orientation ROTATED  → cols = ⌊sheetL / flatW⌋, rows = ⌊sheetW / flatL⌋
 *   Best = orientation with maximum piecesPerSheet.
 *   Tie-break: prefer NORMAL (lower tooling cost).
 */

import { round, utilisation, wastePercent } from "@/utils/math";
import type { FlatSize } from "@/types/box";
import type { LayoutResult } from "@/types/result";
import type { EngineResult } from "@/types/result";

/** A candidate sheet dimension (length × width in mm). */
export interface SheetCandidate {
  length: number;
  width: number;
}

/**
 * Compute a LayoutResult for one orientation on one sheet size.
 */
function tryOrientation(
  sheet: SheetCandidate,
  flatL: number,
  flatW: number,
  orientation: "NORMAL" | "ROTATED_90"
): LayoutResult {
  const cols = Math.floor(sheet.length / flatL);
  const rows = Math.floor(sheet.width / flatW);
  const pieces = cols * rows;
  const sheetArea = sheet.length * sheet.width;
  const usedArea = pieces * flatL * flatW;

  return {
    sheetLength: sheet.length,
    sheetWidth: sheet.width,
    orientation,
    cols,
    rows,
    piecesPerSheet: pieces,
    utilisation: utilisation(usedArea, sheetArea),
    wastePercent: wastePercent(usedArea, sheetArea),
  };
}

/**
 * Find the best layout across all candidate sheet sizes and orientations.
 *
 * @param flatSize - Computed blank dimensions from BoxEngine.
 * @param sheetCandidates - List of available sheet sizes to evaluate.
 * @returns EngineResult with the best layout and all layouts considered.
 */
export function calculateLayout(
  flatSize: FlatSize,
  sheetCandidates: SheetCandidate[]
): EngineResult<{ best: LayoutResult; all: LayoutResult[] }> {
  if (sheetCandidates.length === 0) {
    return { ok: false, error: "No sheet candidates provided" };
  }

  const allLayouts: LayoutResult[] = [];

  for (const sheet of sheetCandidates) {
    const normal = tryOrientation(
      sheet,
      flatSize.flatLength,
      flatSize.flatWidth,
      "NORMAL"
    );
    const rotated = tryOrientation(
      sheet,
      flatSize.flatWidth,
      flatSize.flatLength,
      "ROTATED_90"
    );

    // Only include orientations that produce at least one piece
    if (normal.piecesPerSheet > 0) allLayouts.push(normal);
    if (rotated.piecesPerSheet > 0) allLayouts.push(rotated);
  }

  if (allLayouts.length === 0) {
    return {
      ok: false,
      error:
        "Flat size exceeds all available sheet dimensions — no valid layout found",
    };
  }

  // Sort: most pieces first, NORMAL beats ROTATED_90 on equal count
  allLayouts.sort((a, b) => {
    if (b.piecesPerSheet !== a.piecesPerSheet) {
      return b.piecesPerSheet - a.piecesPerSheet;
    }
    return a.orientation === "NORMAL" ? -1 : 1;
  });

  return { ok: true, data: { best: allLayouts[0], all: allLayouts } };
}

/**
 * Derive candidate sheet sizes from a machine's max sheet dimensions.
 * Returns standard fractions of the max sheet that are in common use.
 */
export function deriveSheetCandidates(
  maxSheetLength: number,
  maxSheetWidth: number
): SheetCandidate[] {
  return [
    { length: maxSheetLength, width: maxSheetWidth },
    { length: round(maxSheetLength * 0.75), width: maxSheetWidth },
    { length: maxSheetLength, width: round(maxSheetWidth * 0.75) },
  ].filter((s) => s.length > 0 && s.width > 0);
}
