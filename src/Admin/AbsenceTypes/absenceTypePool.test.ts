import { describe, expect, it } from "vitest";
import { ABSENCE_POOLS, poolFlags, poolLabel, readPool } from "./absenceTypePool";

describe("absenceTypePool", () => {
    it.each(ABSENCE_POOLS.map((p) => p.value))("wybór %s wraca z bazy jako ten sam wybór", (pool) => {
        expect(readPool(poolFlags(pool))).toBe(pool);
    });

    it.each(ABSENCE_POOLS.map((p) => p.value))("wybór %s ustawia najwyżej jedną flagę", (pool) => {
        const flags = poolFlags(pool);
        expect(Object.values(flags).filter(Boolean).length).toBeLessThanOrEqual(1);
    });

    it("typ bez żadnej flagi to 'żadna pula', nie limit urlopu", () => {
        expect(readPool({ countsAgainstLimit: false, countsAsCare: false, countsAsHoliday: false })).toBe("none");
    });

    it("dwie flagi naraz (dane sprzed bramki) czyta jak kontroler urlopów: opieka wygrywa", () => {
        expect(readPool({ countsAgainstLimit: true, countsAsCare: true })).toBe("care");
        expect(readPool({ countsAgainstLimit: true, countsAsHoliday: true })).toBe("holiday");
    });

    it("etykieta na liście odpowiada wyborowi", () => {
        expect(poolLabel({ countsAsHoliday: true })).toBe("Pula wolnego za święta");
    });
});
