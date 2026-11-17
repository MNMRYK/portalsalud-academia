import { describe, it, expect } from "vitest";
import { fmtMoney, nextManualNumber } from "../Facturacion";

describe("Facturación", () => {
  it("formatea importes como 1.234,56 €", () => {
    expect(fmtMoney(1234.56)).toBe("1.234,56 €");
    expect(fmtMoney(1234567.5)).toBe("1.234.567,50 €");
    expect(fmtMoney(90)).toBe("90,00 €");
  });
  it("numera facturas manuales de forma correlativa por año", () => {
    expect(nextManualNumber([], 2026)).toBe("M-2026-0001");
    expect(nextManualNumber(["M-2026-0001", "M-2026-0002", "M-2025-0009"], 2026)).toBe("M-2026-0003");
  });
});
