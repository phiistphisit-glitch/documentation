# Richmax Box Engine V1 — Architecture

## Overview

A Next.js 14 application implementing Clean Architecture + Domain-Driven Design for
corrugated-box calculation in an offset printing factory context.

## Module Map

```
BoxSpec (input)
    │
    ▼
ValidationEngine ──────────────────► ValidationMessage[]
    │
    ▼
BoxEngine ─────────────────────────► FlatSize
    │
    ├──► MachineEngine ─────────────► MachineMatch[]
    │         (uses MachineService → machine-master.json / DB)
    │
    ├──► LayoutEngine ──────────────► LayoutResult (best + all)
    │
    └──► MaterialEngine ────────────► PaperUsage
              (uses MaterialService → material-master.json / DB)
    │
    ▼
ResultEngine ──────────────────────► BoxCalculationResult (JSON)
    │
    ▼
POST /api/box/calculate  ──────────► HTTP 200 { ok: true, data: BoxCalculationResult }
```

## Layer Responsibilities

| Layer | Path | Rule |
|-------|------|------|
| Types | `src/types/` | Pure TS interfaces — no logic |
| Utils | `src/utils/` | Pure functions — no imports from engine/service |
| Engine | `src/engine/` | Pure business logic — no DB, no HTTP |
| Services | `src/services/` | Data access only — abstracts DB/JSON |
| API Routes | `src/app/api/` | HTTP boundary — calls services + ResultEngine |
| Components | `src/components/` | UI only — no business logic |
| Data | `src/data/` | Seed JSON files (replace with real DB in production) |

## Swapping to a Real Database

1. Edit `src/services/machine-service.ts` — replace JSON import with DB call.
2. Edit `src/services/material-service.ts` — same pattern.
3. No engine or API route code needs to change.

## ERP / Costing Integration

`BoxCalculationResult` is the canonical hand-off payload.
Downstream systems consume it via `POST /api/box/calculate` and receive:

- `flatSize` — blank dimensions for die design
- `bestLayout` — pieces/sheet, utilisation for press planning
- `machines` — eligible machines for scheduling
- `paperUsage` — material + weight for cost estimation
- `messages` — structured warnings for human review

## Adding a New Box Style

1. Add the style literal to `BoxStyle` in `src/types/box.ts`.
2. Implement a `calcNewStyle(spec)` function in `src/engine/box-engine.ts`.
3. Add a `case` in the `switch` in `calculateFlatSize`.
4. Add tests in `tests/box-engine.test.ts`.
