"use client";

import { useState } from "react";
import type { BoxSpec, BoxStyle, FluteType } from "@/types/box";

const BOX_STYLES: { value: BoxStyle; label: string }[] = [
  { value: "RSC", label: "RSC — Regular Slotted Container" },
  { value: "HSC", label: "HSC — Half Slotted Container" },
  { value: "FOL", label: "FOL — Full Overlap" },
  { value: "TELESCOPE", label: "Telescope (Cap)" },
  { value: "WRAP_AROUND", label: "Wrap Around" },
];

const FLUTE_TYPES: { value: FluteType; label: string }[] = [
  { value: "B", label: "B-Flute" },
  { value: "C", label: "C-Flute" },
  { value: "E", label: "E-Flute" },
  { value: "BC", label: "BC-Flute (Double Wall)" },
  { value: "EB", label: "EB-Flute (Double Wall)" },
  { value: "A", label: "A-Flute" },
  { value: "F", label: "F-Flute (Micro)" },
];

const DEFAULT_SPEC: BoxSpec = {
  style: "RSC",
  length: 300,
  width: 200,
  height: 150,
  flute: "B",
  quantity: 1000,
  jointAllowance: 40,
};

interface BoxFormProps {
  onCalculate: (spec: BoxSpec) => void;
  loading: boolean;
}

export function BoxForm({ onCalculate, loading }: BoxFormProps) {
  const [spec, setSpec] = useState<BoxSpec>(DEFAULT_SPEC);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value, type } = e.target;
    setSpec((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onCalculate(spec);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-lg font-semibold text-gray-800 border-b pb-2">
        Box Specification
      </h2>

      {/* Box Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Box Style
        </label>
        <select
          name="style"
          value={spec.style}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {BOX_STYLES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-3 gap-3">
        {(["length", "width", "height"] as const).map((dim) => (
          <div key={dim}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {dim} (mm)
            </label>
            <input
              type="number"
              name={dim}
              value={spec[dim]}
              onChange={handleChange}
              min={10}
              max={3000}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        ))}
      </div>

      {/* Flute */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Flute Type
        </label>
        <select
          name="flute"
          value={spec.flute}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {FLUTE_TYPES.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Quantity (units)
        </label>
        <input
          type="number"
          name="quantity"
          value={spec.quantity}
          onChange={handleChange}
          min={1}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      {/* Joint Allowance */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Joint Allowance (mm)
        </label>
        <input
          type="number"
          name="jointAllowance"
          value={spec.jointAllowance ?? 40}
          onChange={handleChange}
          min={10}
          max={80}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-md text-sm transition-colors"
      >
        {loading ? "Calculating…" : "Calculate"}
      </button>
    </form>
  );
}
