/**
 * Validation Engine — validates BoxSpec and emits typed messages
 * before any calculations are run.
 *
 * Rules:
 *   ERROR  — job cannot proceed
 *   WARNING — job can proceed but operator should review
 *   INFO   — informational only
 */

import type { BoxSpec } from "@/types/box";
import type { ValidationMessage } from "@/types/result";

/** Minimum and maximum sensible box dimension (mm). */
const MIN_DIM_MM = 10;
const MAX_DIM_MM = 3000;

/** Minimum order quantity. */
const MIN_QTY = 1;

/** Warn when any dimension is suspiciously small for structural integrity. */
const SMALL_DIM_WARN_MM = 50;

/** Warn when quantity is very large (may need split planning). */
const LARGE_QTY_WARN = 100_000;

/**
 * Run all validation rules against a BoxSpec.
 *
 * @returns Array of ValidationMessage sorted ERROR → WARNING → INFO.
 */
export function validateBoxSpec(spec: BoxSpec): ValidationMessage[] {
  const messages: ValidationMessage[] = [];

  function addError(code: string, message: string, field?: string) {
    messages.push({ severity: "ERROR", code, message, field });
  }
  function addWarning(code: string, message: string, field?: string) {
    messages.push({ severity: "WARNING", code, message, field });
  }
  function addInfo(code: string, message: string) {
    messages.push({ severity: "INFO", code, message });
  }

  // --- Dimension range checks ---
  const dims: [keyof BoxSpec, string][] = [
    ["length", "Length"],
    ["width", "Width"],
    ["height", "Height"],
  ];

  for (const [key, label] of dims) {
    const val = spec[key] as number;
    if (!Number.isFinite(val) || val <= 0) {
      addError(
        "DIM_INVALID",
        `${label} must be a positive number (got ${val})`,
        key
      );
    } else if (val < MIN_DIM_MM) {
      addError(
        "DIM_TOO_SMALL",
        `${label} ${val} mm is below minimum ${MIN_DIM_MM} mm`,
        key
      );
    } else if (val > MAX_DIM_MM) {
      addError(
        "DIM_TOO_LARGE",
        `${label} ${val} mm exceeds maximum ${MAX_DIM_MM} mm`,
        key
      );
    } else if (val < SMALL_DIM_WARN_MM) {
      addWarning(
        "DIM_VERY_SMALL",
        `${label} ${val} mm is unusually small — verify structural integrity`,
        key
      );
    }
  }

  // --- Length > Width convention ---
  if (spec.length > 0 && spec.width > 0 && spec.length < spec.width) {
    addWarning(
      "DIM_CONVENTION",
      `Length (${spec.length}) is less than Width (${spec.width}). Convention is L ≥ W — swap if needed`
    );
  }

  // --- Quantity ---
  if (!Number.isInteger(spec.quantity) || spec.quantity < MIN_QTY) {
    addError(
      "QTY_INVALID",
      `Quantity must be a positive integer (got ${spec.quantity})`,
      "quantity"
    );
  } else if (spec.quantity > LARGE_QTY_WARN) {
    addWarning(
      "QTY_LARGE",
      `Quantity ${spec.quantity.toLocaleString()} is very large — consider split production planning`,
      "quantity"
    );
  }

  // --- Joint allowance ---
  if (spec.jointAllowance !== undefined) {
    if (spec.jointAllowance < 10 || spec.jointAllowance > 80) {
      addWarning(
        "JOINT_UNUSUAL",
        `Joint allowance ${spec.jointAllowance} mm is outside the typical 10–80 mm range`,
        "jointAllowance"
      );
    }
  }

  // --- Style-specific checks ---
  if (spec.style === "TELESCOPE" && spec.height < 80) {
    addWarning(
      "TELESCOPE_SHORT",
      `Telescope boxes with height < 80 mm may have insufficient cap depth`
    );
  }

  // --- Informational ---
  if (messages.length === 0) {
    addInfo("SPEC_OK", "All dimensions and parameters are within normal range");
  }

  // Sort: ERROR → WARNING → INFO
  const order: Record<string, number> = { ERROR: 0, WARNING: 1, INFO: 2 };
  messages.sort((a, b) => order[a.severity] - order[b.severity]);

  return messages;
}

/** Returns true if the messages list contains no ERRORs. */
export function isValid(messages: ValidationMessage[]): boolean {
  return messages.every((m) => m.severity !== "ERROR");
}
