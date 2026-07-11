/**
 * Box Engine — computes the flat (die-cut blank) size from a BoxSpec.
 *
 * Formulae reference:
 *   RSC  : flatLength = 2*(L+W) + joint
 *          flatWidth  = H + W           (flaps top & bottom = W/2 each)
 *   HSC  : flatLength = 2*(L+W) + joint
 *          flatWidth  = H + W/2         (flaps on one end only)
 *   FOL  : flatLength = 2*(L+W) + joint
 *          flatWidth  = H + L + W/2     (full-overlap top flap = L)
 *   TELESCOPE (cap):
 *          flatLength = 2*(L+W) + joint
 *          flatWidth  = telescopeDepth + W/2  (depth ≈ H*0.6 by convention)
 *   WRAP_AROUND:
 *          flatLength = 2*(L+H) + W + joint
 *          flatWidth  = W + 2*flangeAllowance (flange ≈ 20 mm each side)
 */

import { round } from "@/utils/math";
import type { BoxSpec, FlatSize } from "@/types/box";
import type { EngineResult } from "@/types/result";

const DEFAULT_JOINT_MM = 40;
const TELESCOPE_DEPTH_RATIO = 0.6;
const WRAP_AROUND_FLANGE_MM = 20;

/**
 * Calculate the flat/blank size for an RSC box.
 */
function calcRSC(spec: BoxSpec): FlatSize {
  const joint = spec.jointAllowance ?? DEFAULT_JOINT_MM;
  const flatLength = round(2 * (spec.length + spec.width) + joint);
  const flatWidth = round(spec.height + spec.width);
  return {
    flatLength,
    flatWidth,
    area: round(flatLength * flatWidth),
    formula: "RSC_STANDARD",
  };
}

/**
 * Calculate the flat size for an HSC box.
 */
function calcHSC(spec: BoxSpec): FlatSize {
  const joint = spec.jointAllowance ?? DEFAULT_JOINT_MM;
  const flatLength = round(2 * (spec.length + spec.width) + joint);
  const flatWidth = round(spec.height + spec.width / 2);
  return {
    flatLength,
    flatWidth,
    area: round(flatLength * flatWidth),
    formula: "HSC_STANDARD",
  };
}

/**
 * Calculate the flat size for a Full Overlap (FOL) box.
 */
function calcFOL(spec: BoxSpec): FlatSize {
  const joint = spec.jointAllowance ?? DEFAULT_JOINT_MM;
  const flatLength = round(2 * (spec.length + spec.width) + joint);
  // Top full-overlap flap = spec.length; bottom flap = spec.width / 2
  const flatWidth = round(spec.height + spec.length + spec.width / 2);
  return {
    flatLength,
    flatWidth,
    area: round(flatLength * flatWidth),
    formula: "FOL_STANDARD",
  };
}

/**
 * Calculate the flat size for a Telescope box (cap portion).
 */
function calcTelescope(spec: BoxSpec): FlatSize {
  const joint = spec.jointAllowance ?? DEFAULT_JOINT_MM;
  const telescopeDepth = round(spec.height * TELESCOPE_DEPTH_RATIO);
  const flatLength = round(2 * (spec.length + spec.width) + joint);
  const flatWidth = round(telescopeDepth + spec.width / 2);
  return {
    flatLength,
    flatWidth,
    area: round(flatLength * flatWidth),
    formula: "TELESCOPE_CAP",
  };
}

/**
 * Calculate the flat size for a Wrap-Around blank.
 */
function calcWrapAround(spec: BoxSpec): FlatSize {
  const joint = spec.jointAllowance ?? DEFAULT_JOINT_MM;
  const flatLength = round(
    2 * (spec.length + spec.height) + spec.width + joint
  );
  const flatWidth = round(spec.width + 2 * WRAP_AROUND_FLANGE_MM);
  return {
    flatLength,
    flatWidth,
    area: round(flatLength * flatWidth),
    formula: "WRAP_AROUND_STANDARD",
  };
}

/**
 * Compute the flat/blank size for any supported BoxStyle.
 *
 * @param spec - Customer-supplied box specification.
 * @returns EngineResult containing the FlatSize, or an error string.
 */
export function calculateFlatSize(spec: BoxSpec): EngineResult<FlatSize> {
  try {
    let flatSize: FlatSize;

    switch (spec.style) {
      case "RSC":
        flatSize = calcRSC(spec);
        break;
      case "HSC":
        flatSize = calcHSC(spec);
        break;
      case "FOL":
        flatSize = calcFOL(spec);
        break;
      case "TELESCOPE":
        flatSize = calcTelescope(spec);
        break;
      case "WRAP_AROUND":
        flatSize = calcWrapAround(spec);
        break;
      default:
        return { ok: false, error: `Unsupported box style: ${spec.style}` };
    }

    return { ok: true, data: flatSize };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown error in box engine",
    };
  }
}
