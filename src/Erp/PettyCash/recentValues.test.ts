import { describe, it, expect, beforeEach, vi } from "vitest";
import { remember, recall, lastUsed, forget, RECENT_KEYS } from "./recentValues";

describe("recentValues", () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it("zwraca pustą listę, gdy nic jeszcze nie zapamiętano", () => {
        expect(recall(RECENT_KEYS.payer)).toEqual([]);
        expect(lastUsed(RECENT_KEYS.payer)).toBeNull();
    });

    it("trzyma najnowszą wartość na początku", () => {
        remember(RECENT_KEYS.payer, "got. Karolina");
        remember(RECENT_KEYS.payer, "got. Michał");
        expect(recall(RECENT_KEYS.payer)).toEqual(["got. Michał", "got. Karolina"]);
        expect(lastUsed(RECENT_KEYS.payer)).toBe("got. Michał");
    });

    it("nie duplikuje wartości, tylko przesuwa ją na początek", () => {
        remember(RECENT_KEYS.itemAmount, "9,80");
        remember(RECENT_KEYS.itemAmount, "10,30");
        remember(RECENT_KEYS.itemAmount, "9,80");
        expect(recall(RECENT_KEYS.itemAmount)).toEqual(["9,80", "10,30"]);
    });

    it("pamięta najwyżej sześć wartości", () => {
        for (let i = 1; i <= 9; i++) remember(RECENT_KEYS.addressee, `Adresat ${i}`);
        const values = recall(RECENT_KEYS.addressee);
        expect(values).toHaveLength(6);
        expect(values[0]).toBe("Adresat 9");
        expect(values).not.toContain("Adresat 1");
    });

    it("ignoruje puste wpisy", () => {
        remember(RECENT_KEYS.payer, "   ");
        expect(recall(RECENT_KEYS.payer)).toEqual([]);
    });

    it("przycina wartość przed zapamiętaniem", () => {
        remember(RECENT_KEYS.payer, "  got. ADOR  ");
        expect(recall(RECENT_KEYS.payer)).toEqual(["got. ADOR"]);
    });

    it("kasuje podpowiedzi na żądanie", () => {
        remember(RECENT_KEYS.payer, "got. Karolina");
        forget(RECENT_KEYS.payer);
        expect(recall(RECENT_KEYS.payer)).toEqual([]);
    });

    it("nie wywraca się, gdy pamięć przeglądarki zawiedzie", () => {
        const failing = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
            throw new Error("QuotaExceededError");
        });
        expect(() => remember(RECENT_KEYS.payer, "got. Karolina")).not.toThrow();
        failing.mockRestore();
    });

    it("znosi uszkodzoną zawartość pamięci", () => {
        window.localStorage.setItem("pettyCash.recent.payer", "{ to nie jest json");
        expect(recall(RECENT_KEYS.payer)).toEqual([]);
    });
});
