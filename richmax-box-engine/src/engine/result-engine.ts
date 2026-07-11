/**
 * Result Engine — assembles a BoxCalculationResult from the outputs of
 * all other engine modules.
 *
 * This is the single integration point: it is the only module that knows
 * about all other engines. Costing and ERP consumers receive the
 * BoxCalculationResult JSON and never call individual engines directly.
 */

import { calculateFlatSize } from "@/engine/box-engine";
import { calculateLayout, deriveSheetCandidates } from "@/engine/layout-engine";
import { matchMachines } from "@/engine/machine-engine";
import { calculateMaterialUsage } from "@/engine/material-engine";
import { validateBoxSpec, isValid } from "@/engine/validation-engine";

import type { BoxSpec } from "@/types/box";
import type { MachineMaster } from "@/types/machine";
import type { MaterialMaster } from "@/types/material";
import type { BoxCalculationResult, EngineResult } from "@/types/result";

interface ResultEngineDeps {
  machines: MachineMaster[];
  materials: MaterialMaster[];
}

/**
 * Orchestrate all engines and produce a single BoxCalculationResult.
 *
 * @param spec  - Customer box specification.
 * @param deps  - Injected master-data (machines + materials from DB/service).
 * @returns EngineResult wrapping the complete BoxCalculationResult.
 */
export function buildResult(
  spec: BoxSpec,
  deps: ResultEngineDeps
): EngineResult<BoxCalculationResult> {
  // 1. Validate spec
  const messages = validateBoxSpec(spec);
  const specIsValid = isValid(messages);

  // 2. Flat size
  const flatResult = calculateFlatSize(spec);
  if (!flatResult.ok || !flatResult.data) {
    return { ok: false, error: flatResult.error };
  }
  const flatSize = flatResult.data;

  // 3. Machine matching
  const machineResult = matchMachines(flatSize, deps.machines);
  if (!machineResult.ok || !machineResult.data) {
    return { ok: false, error: machineResult.error };
  }
  const machineMatches = machineResult.data;

  // 4. Layout — use the best fitting machine's sheet size, fall back to defaults
  const bestMachine = machineMatches.find((m) => m.fits);
  const sheetCandidates = bestMachine
    ? deriveSheetCandidates(
        bestMachine.machine.maxSheetLength,
        bestMachine.machine.maxSheetWidth
      )
    : [{ length: 1000, width: 700 }]; // fallback sheet

  const layoutResult = calculateLayout(flatSize, sheetCandidates);
  if (!layoutResult.ok || !layoutResult.data) {
    messages.push({
      severity: "ERROR",
      code: "LAYOUT_FAIL",
      message: layoutResult.error ?? "Layout calculation failed",
    });
    return {
      ok: true,
      data: {
        calculatedAt: new Date().toISOString(),
        input: spec,
        flatSize,
        bestLayout: {
          sheetLength: 0,
          sheetWidth: 0,
          orientation: "NORMAL",
          cols: 0,
          rows: 0,
          piecesPerSheet: 0,
          utilisation: 0,
          wastePercent: 100,
        },
        allLayouts: [],
        machines: machineMatches,
        paperUsage: null,
        messages,
        isValid: false,
      },
    };
  }
  const { best: bestLayout, all: allLayouts } = layoutResult.data;

  // 5. Material / paper usage
  const materialResult = calculateMaterialUsage(
    spec,
    flatSize,
    bestLayout.piecesPerSheet,
    deps.materials
  );

  const paperUsage = materialResult.ok ? (materialResult.data ?? null) : null;
  if (!materialResult.ok) {
    messages.push({
      severity: "WARNING",
      code: "MATERIAL_NOT_FOUND",
      message: materialResult.error ?? "No matching material found",
    });
  }

  return {
    ok: true,
    data: {
      calculatedAt: new Date().toISOString(),
      input: spec,
      flatSize,
      bestLayout,
      allLayouts,
      machines: machineMatches,
      paperUsage,
      messages,
      isValid: specIsValid,
    },
  };
}
