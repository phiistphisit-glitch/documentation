/**
 * Box domain types — all dimensions in millimetres unless noted.
 */

/** Supported corrugated box styles. */
export type BoxStyle =
  | "RSC"        // Regular Slotted Container
  | "HSC"        // Half Slotted Container (flaps on one end only)
  | "FOL"        // Full Overlap Slotted Container
  | "TELESCOPE"  // Telescope box (cap + tray)
  | "WRAP_AROUND"; // Wrap-around blank

/** Corrugated flute profiles available in the factory. */
export type FluteType = "A" | "B" | "C" | "E" | "F" | "BC" | "EB";

/**
 * Customer-supplied box specification.
 * All dimensions are INNER dimensions of the finished box.
 */
export interface BoxSpec {
  /** Box style determines the die-cut blank formula. */
  style: BoxStyle;
  /** Inner length (longest horizontal dimension), mm. */
  length: number;
  /** Inner width (shortest horizontal dimension), mm. */
  width: number;
  /** Inner height (vertical dimension), mm. */
  height: number;
  /** Corrugated flute profile. */
  flute: FluteType;
  /** Manufacturer's joint glue overlap, mm. Defaults to 40. */
  jointAllowance?: number;
  /** Requested print quantity (units). */
  quantity: number;
}

/**
 * Computed flat (die-cut blank) dimensions before folding.
 * flatLength × flatWidth is the bounding rectangle of the blank.
 */
export interface FlatSize {
  /** Longer dimension — circumference direction (2L + 2W + joint), mm. */
  flatLength: number;
  /** Shorter dimension — height direction (H + flap allowance), mm. */
  flatWidth: number;
  /** Bounding area of the blank, mm². */
  area: number;
  /** Notation of the formula applied (e.g. "RSC_STANDARD"). */
  formula: string;
}
