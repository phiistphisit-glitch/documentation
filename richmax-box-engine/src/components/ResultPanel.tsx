"use client";

import type { BoxCalculationResult, ValidationMessage } from "@/types/result";

interface ResultPanelProps {
  result: BoxCalculationResult | null;
  error: string | null;
}

function SeverityBadge({ severity }: { severity: ValidationMessage["severity"] }) {
  const cls =
    severity === "ERROR"
      ? "bg-red-100 text-red-700"
      : severity === "WARNING"
      ? "bg-yellow-100 text-yellow-700"
      : "bg-blue-100 text-blue-700";
  return (
    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${cls}`}>
      {severity}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between text-sm py-1 border-b border-gray-100 last:border-0">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}

export function ResultPanel({ result, error }: ResultPanelProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
        <strong>Error:</strong> {error}
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        Fill in the form and click Calculate to see results
      </div>
    );
  }

  const { flatSize, bestLayout, machines, paperUsage, messages } = result;
  const suitableMachines = machines.filter((m) => m.fits);

  return (
    <div className="space-y-4 overflow-y-auto">
      <div className="flex items-center gap-2 border-b pb-2">
        <h2 className="text-lg font-semibold text-gray-800">Results</h2>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            result.isValid
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {result.isValid ? "Valid" : "Has Errors"}
        </span>
      </div>

      {/* Flat Size */}
      <Section title="Flat / Die-Cut Size">
        <div className="bg-white rounded-lg border p-3">
          <Row label="Flat Length" value={`${flatSize.flatLength} mm`} />
          <Row label="Flat Width" value={`${flatSize.flatWidth} mm`} />
          <Row
            label="Blank Area"
            value={`${(flatSize.area / 1_000_000).toFixed(4)} m²`}
          />
          <Row label="Formula" value={flatSize.formula} />
        </div>
      </Section>

      {/* Best Layout */}
      <Section title="Best Layout">
        <div className="bg-white rounded-lg border p-3">
          <Row
            label="Sheet Size"
            value={`${bestLayout.sheetLength} × ${bestLayout.sheetWidth} mm`}
          />
          <Row label="Orientation" value={bestLayout.orientation} />
          <Row label="Columns × Rows" value={`${bestLayout.cols} × ${bestLayout.rows}`} />
          <Row label="Pieces per Sheet" value={bestLayout.piecesPerSheet} />
          <Row
            label="Utilisation"
            value={`${(bestLayout.utilisation * 100).toFixed(1)} %`}
          />
          <Row label="Waste" value={`${bestLayout.wastePercent} %`} />
        </div>
      </Section>

      {/* Machines */}
      <Section title={`Suitable Machines (${suitableMachines.length})`}>
        {suitableMachines.length === 0 ? (
          <p className="text-sm text-red-600">
            No machine can handle this flat size.
          </p>
        ) : (
          <div className="space-y-2">
            {suitableMachines.map((m) => (
              <div
                key={m.machine.id}
                className="bg-white rounded-lg border p-3 text-sm"
              >
                <div className="font-medium text-gray-800">{m.machine.name}</div>
                <div className="text-gray-500 text-xs mt-0.5">
                  {m.machine.type} · {m.machine.speedSheetsPerHour.toLocaleString()} sh/hr ·
                  Sheet {m.requiredSheetLength}×{m.requiredSheetWidth} mm
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Paper Usage */}
      {paperUsage && (
        <Section title="Paper Usage">
          <div className="bg-white rounded-lg border p-3">
            <Row label="Material" value={paperUsage.material.name} />
            <Row label="Grade / GSM" value={`${paperUsage.material.grade} · ${paperUsage.material.gsm} gsm`} />
            <Row label="Total Sheets" value={paperUsage.totalSheets.toLocaleString()} />
            <Row label="Total Area" value={`${paperUsage.totalAreaM2.toFixed(2)} m²`} />
            <Row label="Est. Weight" value={`${paperUsage.totalWeightKg.toFixed(1)} kg`} />
            <Row label="Waste" value={`${paperUsage.wastePercent} %`} />
          </div>
        </Section>
      )}

      {/* Validation Messages */}
      {messages.length > 0 && (
        <Section title="Messages">
          <div className="space-y-1.5">
            {messages.map((msg, i) => (
              <div
                key={i}
                className="flex items-start gap-2 bg-white rounded-lg border px-3 py-2 text-sm"
              >
                <SeverityBadge severity={msg.severity} />
                <span className="text-gray-700">{msg.message}</span>
              </div>
            ))}
          </div>
        </Section>
      )}

      <p className="text-xs text-gray-400 text-right">
        Calculated: {new Date(result.calculatedAt).toLocaleString("th-TH")}
      </p>
    </div>
  );
}
