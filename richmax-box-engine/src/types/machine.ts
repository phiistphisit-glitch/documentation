/**
 * Machine domain types.
 */

/** Type of production machine. */
export type MachineType = "ROTARY_DIE_CUT" | "FLATBED_DIE_CUT" | "OFFSET_PRINT";

/** Feed orientation supported by the machine. */
export type FeedDirection = "LONG_EDGE" | "SHORT_EDGE" | "BOTH";

/**
 * Machine master record — loaded from database, never hard-coded.
 */
export interface MachineMaster {
  /** Unique machine identifier. */
  id: string;
  /** Human-readable machine name. */
  name: string;
  /** Machine category. */
  type: MachineType;
  /** Minimum sheet length the machine can handle, mm. */
  minSheetLength: number;
  /** Maximum sheet length the machine can handle, mm. */
  maxSheetLength: number;
  /** Minimum sheet width the machine can handle, mm. */
  minSheetWidth: number;
  /** Maximum sheet width the machine can handle, mm. */
  maxSheetWidth: number;
  /** Rated production speed, sheets per hour. */
  speedSheetsPerHour: number;
  /** Whether this machine is currently available for scheduling. */
  active: boolean;
  /** Optional notes (maintenance windows, special capabilities). */
  notes?: string;
}

/**
 * Result of matching a flat-blank size against the machine master.
 */
export interface MachineMatch {
  machine: MachineMaster;
  /** True if the flat fits within this machine's sheet limits. */
  fits: boolean;
  /** Human-readable reason when fits === false. */
  reason?: string;
  /** Required sheet size to run this job on this machine. */
  requiredSheetLength: number;
  requiredSheetWidth: number;
}
