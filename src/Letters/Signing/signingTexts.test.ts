/**
 * SIG-4 — teksty okna podpisu. Użytkownik nie ma widzieć kodów programu ani technicznych błędów,
 * więc każdy powód przerwania, który wysyła program ENVI Podpis (Messages.cs, CancelReason),
 * musi mieć zwykłe zdanie i podpowiedź, co dalej.
 */
import { describe, expect, it } from "vitest";
import { explainCancelReason, formatCheckCode, pluralFiles, pluralPages } from "./signingTexts";

/** Powody wysyłane przez program (desktop/envi-podpis/src/Messages.cs i MainForm.cs) oraz przez PS. */
const REASONS_FROM_PROGRAM = [
    "user_cancelled",
    "no_certificate",
    "signing_WrongPin",
    "signing_PinBlocked",
    "signing_NoCard",
    "signing_Cancelled",
    "signing_InvalidResult",
    "signing_UnsupportedKey",
    "signing_Other",
    "check_code_mismatch",
    "file_count_mismatch",
    "api_error",
    "program_error",
    "ps_user_cancelled",
];

describe("explainCancelReason", () => {
    it.each(REASONS_FROM_PROGRAM)("%s ma zdanie po polsku bez kodu technicznego i mówi, że nic nie podpisano", (reason) => {
        const text = explainCancelReason(reason).message;
        expect(text).toMatch(/Nic nie zostało podpisane|niczego nie podpisał/);
        expect(text).not.toContain(reason.includes("_") ? reason : "\u0000");
    });

    it("zablokowany PIN i nieobsługiwana karta kierują do „Wgraj podpisany”", () => {
        expect(explainCancelReason("signing_PinBlocked").suggestUpload).toBe(true);
        expect(explainCancelReason("signing_UnsupportedKey").suggestUpload).toBe(true);
        expect(explainCancelReason("signing_WrongPin").suggestUpload).toBe(false);
    });

    it("błędny PIN ostrzega przed blokadą karty", () => {
        expect(explainCancelReason("signing_WrongPin").message).toMatch(/blokuje/);
    });

    it("nieznany powód nie jest ukrywany ani zmyślany: jest podany wprost", () => {
        const text = explainCancelReason("nowy_powod_x").message;
        expect(text).toContain("nowy_powod_x");
        expect(text).toMatch(/Nic nie zostało podpisane/);
    });

    it("brak powodu to zwykłe anulowanie", () => {
        expect(explainCancelReason(null).message).toMatch(/anulowane/);
    });
});

describe("formatCheckCode", () => {
    it("zapisuje osiem znaków jako XXXX-XXXX wielkimi literami", () => {
        expect(formatCheckCode("3f9ac12b")).toBe("3F9A-C12B");
        expect(formatCheckCode("3F9A-C12B")).toBe("3F9A-C12B");
    });

    it("nie psuje wartości o innej długości ani pustej", () => {
        expect(formatCheckCode("abc")).toBe("ABC");
        expect(formatCheckCode(null)).toBe("");
    });
});

describe("liczebniki", () => {
    it("pliki i strony odmieniają się po polsku", () => {
        expect(pluralFiles(1)).toBe("1 plik");
        expect(pluralFiles(2)).toBe("2 pliki");
        expect(pluralFiles(5)).toBe("5 plików");
        expect(pluralFiles(12)).toBe("12 plików");
        expect(pluralFiles(22)).toBe("22 pliki");
        expect(pluralPages(1)).toBe("1 strona");
        expect(pluralPages(3)).toBe("3 strony");
        expect(pluralPages(14)).toBe("14 stron");
    });
});
