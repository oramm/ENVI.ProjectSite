import { describe, expect, it } from "vitest";
import { CommitResult, wroteAnything } from "./pettyCashApi";

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
