import { describe, it, expect } from "vitest";
import { personShortcut } from "./PettyCashEntryPage";

describe("personShortcut", () => {
    it("bierze pierwszą literę imienia i trzy pierwsze nazwiska, wielkimi", () => {
        expect(personShortcut("Anna Dorosińska")).toBe("ADOR");
        expect(personShortcut("Michał Kotala")).toBe("MKOT");
        expect(personShortcut("krzysztof brodacki")).toBe("KBRO");
    });

    it("znosi nadmiarowe spacje i drugie imię traktuje jak nazwisko", () => {
        expect(personShortcut("  Anna   Dorosińska  ")).toBe("ADOR");
        expect(personShortcut("Anna Maria Dorosińska")).toBe("AMAR");
    });

    it("radzi sobie z samym imieniem i z pustym wejściem", () => {
        expect(personShortcut("Karolina")).toBe("K");
        expect(personShortcut("")).toBe("");
        expect(personShortcut("   ")).toBe("");
    });

    it("zachowuje polskie znaki po zamianie na wielkie litery", () => {
        expect(personShortcut("Łukasz Ćwik")).toBe("ŁĆWI");
    });
});
