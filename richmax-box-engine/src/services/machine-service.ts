/**
 * Machine Service — abstracts data access for the Machine Master.
 *
 * In production, replace the JSON import with a real DB call (e.g. Supabase,
 * Prisma, or an internal API) without touching any engine or API route code.
 */

import type { MachineMaster } from "@/types/machine";
import rawData from "@/data/machine-master.json";

// Cast once at the service boundary — engines receive typed objects
const machineData = rawData as MachineMaster[];

/**
 * Return all machine master records.
 * In production this would be: `await db.machine.findMany({ where: { deletedAt: null } })`
 */
export async function getAllMachines(): Promise<MachineMaster[]> {
  return machineData;
}

/**
 * Return only active machines.
 */
export async function getActiveMachines(): Promise<MachineMaster[]> {
  return machineData.filter((m) => m.active);
}

/**
 * Look up a single machine by its ID.
 */
export async function getMachineById(
  id: string
): Promise<MachineMaster | null> {
  return machineData.find((m) => m.id === id) ?? null;
}
