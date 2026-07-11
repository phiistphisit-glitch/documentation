import { calculateLayout, deriveSheetCandidates } from "@/engine/layout-engine";
import type { FlatSize } from "@/types/box";

const flat: FlatSize = {
  flatLength: 1040,
  flatWidth: 350,
  area: 1040 * 350,
  formula: "RSC_STANDARD",
};

describe("Layout Engine — basic", () => {
  it("calculates correct pieces per sheet in NORMAL orientation", () => {
    const r = calculateLayout(flat, [{ length: 2080, width: 700 }]);
    expect(r.ok).toBe(true);
    // 2080/1040=2 cols, 700/350=2 rows → 4 pieces
    const normal = r.data!.all.find((l) => l.orientation === "NORMAL");
    expect(normal!.piecesPerSheet).toBe(4);
    expect(normal!.cols).toBe(2);
    expect(normal!.rows).toBe(2);
  });

  it("calculates correct pieces per sheet in ROTATED_90 orientation", () => {
    // Sheet 700×2080 in rotated: flatW=350 along length, flatL=1040 along width
    const r = calculateLayout(flat, [{ length: 700, width: 2080 }]);
    expect(r.ok).toBe(true);
    const rotated = r.data!.all.find((l) => l.orientation === "ROTATED_90");
    // 700/350=2 cols, 2080/1040=2 rows → 4
    expect(rotated!.piecesPerSheet).toBe(4);
  });

  it("selects the orientation with more pieces", () => {
    // 1050 × 360 sheet: NORMAL → floor(1050/1040)=1 × floor(360/350)=1 = 1 piece
    // ROTATED → floor(1050/350)=3 × floor(360/1040)=0 = 0 pieces
    const r = calculateLayout(flat, [{ length: 1050, width: 360 }]);
    expect(r.ok).toBe(true);
    expect(r.data!.best.piecesPerSheet).toBe(1);
    expect(r.data!.best.orientation).toBe("NORMAL");
  });

  it("returns error when no candidate fits", () => {
    const r = calculateLayout(flat, [{ length: 500, width: 300 }]);
    expect(r.ok).toBe(false);
  });

  it("returns error when no candidates provided", () => {
    const r = calculateLayout(flat, []);
    expect(r.ok).toBe(false);
  });
});

describe("Layout Engine — utilisation", () => {
  it("utilisation is between 0 and 1", () => {
    const r = calculateLayout(flat, [{ length: 2080, width: 700 }]);
    const u = r.data!.best.utilisation;
    expect(u).toBeGreaterThan(0);
    expect(u).toBeLessThanOrEqual(1);
  });

  it("wastePercent + utilisation*100 ≈ 100", () => {
    const r = calculateLayout(flat, [{ length: 2080, width: 700 }]);
    const best = r.data!.best;
    const sum = best.wastePercent + best.utilisation * 100;
    expect(sum).toBeCloseTo(100, 1);
  });
});

describe("deriveSheetCandidates", () => {
  it("returns 3 candidates based on max sheet size", () => {
    const candidates = deriveSheetCandidates(1060, 760);
    expect(candidates.length).toBe(3);
    expect(candidates[0]).toEqual({ length: 1060, width: 760 });
  });
});
