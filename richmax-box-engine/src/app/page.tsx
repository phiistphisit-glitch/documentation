"use client";

import { useState } from "react";
import { BoxForm } from "@/components/BoxForm";
import { ResultPanel } from "@/components/ResultPanel";
import type { BoxSpec } from "@/types/box";
import type { BoxCalculationResult } from "@/types/result";

export default function HomePage() {
  const [result, setResult] = useState<BoxCalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCalculate(spec: BoxSpec) {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/box/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(spec),
      });

      const json = await res.json();

      if (!res.ok || !json.ok) {
        setError(json.error ?? "Calculation failed");
      } else {
        setResult(json.data as BoxCalculationResult);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-brand-700 text-white px-6 py-3 flex items-center gap-3 shadow">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            Richmax Box Engine
          </h1>
          <p className="text-brand-100 text-xs">
            V1 · Packaging Calculation System
          </p>
        </div>
      </header>

      {/* Two-column layout */}
      <main className="flex-1 flex flex-col md:flex-row gap-0 overflow-hidden">
        {/* Left — Form */}
        <aside className="w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 p-5 overflow-y-auto shrink-0">
          <BoxForm onCalculate={handleCalculate} loading={loading} />
        </aside>

        {/* Right — Results */}
        <section className="flex-1 p-5 overflow-y-auto">
          <ResultPanel result={result} error={error} />
        </section>
      </main>
    </div>
  );
}
