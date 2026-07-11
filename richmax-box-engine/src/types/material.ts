/**
 * Material (paper/board) domain types.
 */

/** Board grade classification. */
export type BoardGrade = "KRAFT" | "TEST" | "WHITE_TOP" | "VIRGIN";

/**
 * Material master record — loaded from database.
 */
export interface MaterialMaster {
  id: string;
  /** Material code used in ERP / Costing. */
  code: string;
  name: string;
  /** Flute type this material is used for (or "LINER" for linerboard). */
  fluteType: string;
  grade: BoardGrade;
  /** Grammage, gsm. */
  gsm: number;
  /** Standard sheet length available from supplier, mm. */
  standardSheetLength: number;
  /** Standard sheet width available from supplier, mm. */
  standardSheetWidth: number;
  /** Cost per tonne, THB. Required for costing export. */
  pricePerTonne: number;
  /** Density for weight calculation, kg/m² per gsm (typically 1.0). */
  densityFactor: number;
  active: boolean;
}

/**
 * Paper usage summary for one job.
 */
export interface PaperUsage {
  material: MaterialMaster;
  /** Pieces per sheet (from layout engine). */
  piecesPerSheet: number;
  /** Total sheets required for the order quantity. */
  totalSheets: number;
  /** Total area consumed, m². */
  totalAreaM2: number;
  /** Estimated weight of paper consumed, kg. */
  totalWeightKg: number;
  /** Waste percentage (0–100). */
  wastePercent: number;
}
