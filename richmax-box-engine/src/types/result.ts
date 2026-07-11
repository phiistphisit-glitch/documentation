/**
 * Standard API result types.
 * All engine outputs are wrapped in EngineResult<T> so consumers
 * never need to inspect raw shapes.
 */

import type { BoxSpec, FlatSize } from "./box";
import type { MachineMatch } from "./machine";
import type { PaperUsage } from "./material";

/** Severity levels for validation messages. */
export type MessageSeverity = "INFO" | "WARNING" | "ERROR";

export interface ValidationMessage {
  severity: MessageSeverity;
  code: string;
  message: string;
  field?: string;
}

/** Layout orientation descriptor. */
export type LayoutOrientation = "NORMAL" | "ROTATED_90";

/** Result of one layout calculation attempt on a given sheet. */
export interface LayoutResult {
  sheetLength: number;
  sheetWidth: number;
  orientation: LayoutOrientation;
  /** Number of blanks along the length direction. */
  cols: number;
  /** Number of blanks along the width direction. */
  rows: number;
  piecesPerSheet: number;
  /** Sheet utilisation (0–1). */
  utilisation: number;
  wastePercent: number;
}

/**
 * Canonical calculation result returned by /api/box/calculate.
 * Designed for direct consumption by Costing and ERP modules.
 */
export interface BoxCalculationResult {
  /** ISO-8601 timestamp of when this result was computed. */
  calculatedAt: string;
  /** Echoed input spec for traceability. */
  input: BoxSpec;
  /** Computed flat/blank size. */
  flatSize: FlatSize;
  /** Best layout (maximum pieces per sheet). */
  bestLayout: LayoutResult;
  /** All viable layouts considered (for auditing). */
  allLayouts: LayoutResult[];
  /** Recommended machine(s) sorted by suitability. */
  machines: MachineMatch[];
  /** Paper usage summary for the recommended material. */
  paperUsage: PaperUsage | null;
  /** Validation messages (info / warnings / errors). */
  messages: ValidationMessage[];
  /** True if the job can proceed (no ERROR-severity messages). */
  isValid: boolean;
}

/** Generic engine result wrapper. */
export interface EngineResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}
