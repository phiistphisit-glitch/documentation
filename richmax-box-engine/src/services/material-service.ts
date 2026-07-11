/**
 * Material Service — abstracts data access for the Material Master.
 *
 * Swap the JSON source for a real DB call without touching engine or API code.
 */

import type { MaterialMaster } from "@/types/material";
import rawData from "@/data/material-master.json";

const materialData = rawData as MaterialMaster[];

/** Return all material records. */
export async function getAllMaterials(): Promise<MaterialMaster[]> {
  return materialData;
}

/** Return only active materials. */
export async function getActiveMaterials(): Promise<MaterialMaster[]> {
  return materialData.filter((m) => m.active);
}

/** Filter active materials by flute type. */
export async function getMaterialsByFlute(
  fluteType: string
): Promise<MaterialMaster[]> {
  return materialData.filter(
    (m) => m.active && m.fluteType.toUpperCase() === fluteType.toUpperCase()
  );
}
