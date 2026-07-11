import { validateBoxSpec, isValid } from "@/engine/validation-engine";
import type { BoxSpec } from "@/types/box";

const valid: BoxSpec = {
  style: "RSC",
  length: 300,
  width: 200,
  height: 150,
  flute: "B",
  quantity: 1000,
  jointAllowance: 40,
};

describe("Validation Engine — valid spec", () => {
  it("emits no errors for a good spec", () => {
    const msgs = validateBoxSpec(valid);
    expect(msgs.filter((m) => m.severity === "ERROR")).toHaveLength(0);
  });

  it("isValid returns true for a good spec", () => {
    expect(isValid(validateBoxSpec(valid))).toBe(true);
  });

  it("emits INFO when spec is clean", () => {
    const msgs = validateBoxSpec(valid);
    expect(msgs.some((m) => m.severity === "INFO")).toBe(true);
  });
});

describe("Validation Engine — dimension errors", () => {
  it("errors on zero length", () => {
    const msgs = validateBoxSpec({ ...valid, length: 0 });
    expect(msgs.some((m) => m.code === "DIM_INVALID" && m.field === "length")).toBe(true);
  });

  it("errors on negative height", () => {
    const msgs = validateBoxSpec({ ...valid, height: -10 });
    expect(msgs.some((m) => m.severity === "ERROR" && m.field === "height")).toBe(true);
  });

  it("errors on dimension exceeding max", () => {
    const msgs = validateBoxSpec({ ...valid, length: 5000 });
    expect(msgs.some((m) => m.code === "DIM_TOO_LARGE")).toBe(true);
  });

  it("warns on very small dimension", () => {
    const msgs = validateBoxSpec({ ...valid, width: 30 });
    expect(msgs.some((m) => m.severity === "WARNING" && m.code === "DIM_VERY_SMALL")).toBe(true);
  });
});

describe("Validation Engine — quantity", () => {
  it("errors on zero quantity", () => {
    const msgs = validateBoxSpec({ ...valid, quantity: 0 });
    expect(msgs.some((m) => m.code === "QTY_INVALID")).toBe(true);
    expect(isValid(msgs)).toBe(false);
  });

  it("warns on very large quantity", () => {
    const msgs = validateBoxSpec({ ...valid, quantity: 200_000 });
    expect(msgs.some((m) => m.code === "QTY_LARGE")).toBe(true);
  });
});

describe("Validation Engine — conventions", () => {
  it("warns when length < width", () => {
    const msgs = validateBoxSpec({ ...valid, length: 100, width: 300 });
    expect(msgs.some((m) => m.code === "DIM_CONVENTION")).toBe(true);
  });

  it("warns on unusual joint allowance", () => {
    const msgs = validateBoxSpec({ ...valid, jointAllowance: 5 });
    expect(msgs.some((m) => m.code === "JOINT_UNUSUAL")).toBe(true);
  });
});

describe("Validation Engine — message ordering", () => {
  it("errors appear before warnings", () => {
    const msgs = validateBoxSpec({ ...valid, length: 0, quantity: 200_000 });
    const firstError = msgs.findIndex((m) => m.severity === "ERROR");
    const firstWarning = msgs.findIndex((m) => m.severity === "WARNING");
    if (firstError >= 0 && firstWarning >= 0) {
      expect(firstError).toBeLessThan(firstWarning);
    }
  });
});
