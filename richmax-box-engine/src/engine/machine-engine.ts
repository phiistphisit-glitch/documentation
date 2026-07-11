/**
 * Machine Engine — matches a flat blank against the machine master
 * to identify which machines can run the job and in what order of suitability.
 *
 * Suitability scoring:
 *   +3  active machine
 *   +2  flat fits (both dimensions within max sheet)
 *   +1  utilisation > 60 %
 *   Machines are sorted by score descending.
 */

import type { FlatSize } from "@/types/box";
import type { MachineMaster, MachineMatch } from "@/types/machine";
import type { EngineResult } from "@/types/result";

/**
 * Evaluate whether a flat blank can be processed on a specific machine.
 */
function evaluateMachine(
  machine: MachineMaster,
  flatSize: FlatSize
): MachineMatch {
  const { flatLength, flatWidth } = flatSize;

  // The blank must fit within the machine sheet envelope in at least one orientation
  const fitsNormal =
    flatLength <= machine.maxSheetLength &&
    flatWidth <= machine.maxSheetWidth &&
    flatLength >= machine.minSheetLength &&
    flatWidth >= machine.minSheetWidth;

  const fitsRotated =
    flatWidth <= machine.maxSheetLength &&
    flatLength <= machine.maxSheetWidth &&
    flatWidth >= machine.minSheetLength &&
    flatLength >= machine.minSheetWidth;

  const fits = machine.active && (fitsNormal || fitsRotated);

  // Determine required sheet dimensions (prefer normal orientation)
  const useRotated = !fitsNormal && fitsRotated;
  const requiredSheetLength = useRotated ? flatWidth : flatLength;
  const requiredSheetWidth = useRotated ? flatLength : flatWidth;

  let reason: string | undefined;
  if (!machine.active) {
    reason = "Machine is not active";
  } else if (!fits) {
    reason =
      `Flat size ${flatLength}×${flatWidth} mm exceeds machine limits ` +
      `(max ${machine.maxSheetLength}×${machine.maxSheetWidth} mm)`;
  }

  return {
    machine,
    fits,
    reason,
    requiredSheetLength,
    requiredSheetWidth,
  };
}

/**
 * Match a flat blank against all machines in the master list.
 *
 * @param flatSize - Computed blank dimensions.
 * @param machines - Full machine master list (loaded from DB / service).
 * @returns Sorted list of MachineMatch objects (suitable machines first).
 */
export function matchMachines(
  flatSize: FlatSize,
  machines: MachineMaster[]
): EngineResult<MachineMatch[]> {
  if (machines.length === 0) {
    return { ok: false, error: "Machine master is empty" };
  }

  const matches = machines.map((m) => evaluateMachine(m, flatSize));

  // Sort: fitting + active machines first, then by speed descending
  matches.sort((a, b) => {
    const scoreA = (a.fits ? 10 : 0) + (a.machine.active ? 1 : 0);
    const scoreB = (b.fits ? 10 : 0) + (b.machine.active ? 1 : 0);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return b.machine.speedSheetsPerHour - a.machine.speedSheetsPerHour;
  });

  return { ok: true, data: matches };
}
