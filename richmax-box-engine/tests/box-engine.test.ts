import { calculateFlatSize } from "@/engine/box-engine";
import type { BoxSpec } from "@/types/box";

const base: BoxSpec = {
  style: "RSC",
  length: 300,
  width: 200,
  height: 150,
  flute: "B",
  quantity: 1000,
  jointAllowance: 40,
};

describe("Box Engine — RSC", () => {
  it("computes correct flat length: 2*(L+W)+joint", () => {
    const r = calculateFlatSize(base);
    expect(r.ok).toBe(true);
    expect(r.data!.flatLength).toBe(2 * (300 + 200) + 40); // 1040
  });

  it("computes correct flat width: H+W", () => {
    const r = calculateFlatSize(base);
    expect(r.data!.flatWidth).toBe(150 + 200); // 350
  });

  it("computes area = flatLength × flatWidth", () => {
    const r = calculateFlatSize(base);
    expect(r.data!.area).toBe(1040 * 350);
  });

  it("uses default joint of 40 mm when omitted", () => {
    const spec = { ...base, jointAllowance: undefined };
    const r = calculateFlatSize(spec);
    expect(r.data!.flatLength).toBe(2 * (300 + 200) + 40);
  });

  it("respects custom joint allowance", () => {
    const spec = { ...base, jointAllowance: 50 };
    const r = calculateFlatSize(spec);
    expect(r.data!.flatLength).toBe(2 * (300 + 200) + 50);
  });
});

describe("Box Engine — HSC", () => {
  const spec: BoxSpec = { ...base, style: "HSC" };

  it("flat width = H + W/2 for HSC", () => {
    const r = calculateFlatSize(spec);
    expect(r.data!.flatWidth).toBe(150 + 200 / 2); // 250
  });
});

describe("Box Engine — FOL", () => {
  const spec: BoxSpec = { ...base, style: "FOL" };

  it("flat width = H + L + W/2 for FOL", () => {
    const r = calculateFlatSize(spec);
    expect(r.data!.flatWidth).toBe(150 + 300 + 200 / 2); // 550
  });
});

describe("Box Engine — TELESCOPE", () => {
  const spec: BoxSpec = { ...base, style: "TELESCOPE" };

  it("flat width = telescopeDepth(H*0.6) + W/2", () => {
    const r = calculateFlatSize(spec);
    const telescopeDepth = Math.round(150 * 0.6 * 100) / 100; // 90
    expect(r.data!.flatWidth).toBe(telescopeDepth + 200 / 2); // 190
  });
});

describe("Box Engine — WRAP_AROUND", () => {
  const spec: BoxSpec = { ...base, style: "WRAP_AROUND" };

  it("flat length = 2*(L+H)+W+joint for WRAP_AROUND", () => {
    const r = calculateFlatSize(spec);
    expect(r.data!.flatLength).toBe(2 * (300 + 150) + 200 + 40); // 1140
  });

  it("flat width = W + 2*20 flange for WRAP_AROUND", () => {
    const r = calculateFlatSize(spec);
    expect(r.data!.flatWidth).toBe(200 + 2 * 20); // 240
  });
});

describe("Box Engine — error handling", () => {
  it("returns error for unknown style", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const spec = { ...base, style: "UNKNOWN" as any };
    const r = calculateFlatSize(spec);
    expect(r.ok).toBe(false);
    expect(r.error).toContain("Unsupported box style");
  });
});
