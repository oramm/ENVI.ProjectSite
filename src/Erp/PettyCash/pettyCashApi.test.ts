import { afterEach, describe, expect, it, vi } from "vitest";
import { CommitResult, submitEntry, wroteAnything } from "./pettyCashApi";

/**
 * Ten jeden warunek decyduje, czy formularz powie „Zapisano", czy „Pominięto".
 * Wcześniej mówił „Zapisano" zawsze — także wtedy, gdy nic nie trafiło do arkusza,
 * bo backend odpowiada 201 również na pominięcie.
 */

const commit = (
    cash: CommitResult["cash"],
    register: CommitResult["register"] = null
): CommitResult => ({ cash, register });

describe("wroteAnything", () => {
    it("zwykły wpis do zaliczek to zapis", () => {
        expect(wroteAnything(commit({ action: "write", targetRow: 199 }))).toBe(true);
    });

    it("sam wiersz pominięty, bez rejestru, to NIE jest zapis", () => {
        expect(
            wroteAnything(commit({ action: "skip", reason: "Ten wpis zostal juz dodany." }))
        ).toBe(false);
    });

    it("wysyłka pocztowa pominięta po obu stronach to NIE jest zapis", () => {
        expect(
            wroteAnything(
                commit(
                    { action: "skip", reason: "Dokument jest juz w arkuszu." },
                    { action: "skip", reason: "Faktura ma juz blok." }
                )
            )
        ).toBe(false);
    });

    it("blok w rejestrze powstał, mimo że wiersz zaliczek pominięto - to jest zapis", () => {
        expect(
            wroteAnything(
                commit(
                    { action: "skip", reason: "Dokument jest juz w arkuszu." },
                    { action: "write", blockNumber: 83, headerRow: 440 }
                )
            )
        ).toBe(true);
    });
});


describe("submission failures", () => {
    afterEach(() => vi.unstubAllGlobals());
    it.each(["ANNUAL_SHEET_MISSING", "ANNUAL_SHEET_INCOMPLETE"])("preserves actionable %s", async (code) => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 409, json: async () => ({ error: "Sprawdź zakładkę roku 2027.", code }) }));
        await expect(submitEntry({} as any)).rejects.toMatchObject({ name: "PettyCashApiError", status: 409, code, message: "Sprawdź zakładkę roku 2027." });
    });
    it("preserves the global error handler message", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({ errorMessage: "Nie udało się zapisać w Google." }) }));
        await expect(submitEntry({} as any)).rejects.toThrow("Nie udało się zapisać w Google.");
    });
    it("non-JSON failures cannot return a success result", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => { throw new Error("html"); } }));
        await expect(submitEntry({} as any)).rejects.toMatchObject({ status: 502, message: "Nie udało się zapisać wpisu (502)" });
    });
});
