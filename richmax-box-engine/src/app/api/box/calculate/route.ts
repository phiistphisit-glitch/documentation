/**
 * POST /api/box/calculate
 *
 * Accepts a BoxSpec JSON body and returns a BoxCalculationResult.
 * This is the single entry-point for Costing, ERP, and the UI.
 */

import { NextRequest, NextResponse } from "next/server";
import { buildResult } from "@/engine/result-engine";
import { getActiveMachines } from "@/services/machine-service";
import { getActiveMaterials } from "@/services/material-service";
import type { BoxSpec } from "@/types/box";

export async function POST(req: NextRequest) {
  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Basic shape guard before passing to engine
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { ok: false, error: "Request body must be a JSON object" },
      { status: 400 }
    );
  }

  const spec = body as BoxSpec;

  // Load master data from services (DB-backed in production)
  const [machines, materials] = await Promise.all([
    getActiveMachines(),
    getActiveMaterials(),
  ]);

  const result = buildResult(spec, { machines, materials });

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true, data: result.data }, { status: 200 });
}

/** Allow CORS for ERP / Costing integrations calling from other origins. */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
