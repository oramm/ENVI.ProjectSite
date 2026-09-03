import { describe, it, expect } from "vitest";
import { derivedVat, netFromVat, vatError } from "./vatAmount";

describe("vatAmount — VAT z netto i brutto", () => {
    it("pokazuje różnicę brutto minus netto z przecinkiem i dwoma miejscami", () => {
        expect(derivedVat("91,85", "112,98")).toBe("21,13");
        expect(derivedVat("100", "123")).toBe("23,00");
    });

    it("przyjmuje kropkę jako separator", () => {
        expect(derivedVat("91.85", "112.98")).toBe("21,13");
    });

    it("jest puste, gdy brakuje którejś kwoty albo nie jest liczbą", () => {
        expect(derivedVat("", "112,98")).toBe("");
        expect(derivedVat("91,85", "")).toBe("");
        expect(derivedVat("abc", "112,98")).toBe("");
    });

    it("nie gubi groszy na błędzie zaokrąglenia zmiennoprzecinkowego", () => {
        expect(derivedVat("0,10", "0,30")).toBe("0,20");
    });
});

describe("vatAmount — netto z brutto i VAT", () => {
    it("liczy brutto minus VAT", () => {
        expect(netFromVat("112,98", "21,13")).toBe("91,85");
        expect(netFromVat("123", "23")).toBe("100,00");
    });

    it("VAT zero daje netto równe brutto — zakup zwolniony", () => {
        expect(netFromVat("50,00", "0")).toBe("50,00");
    });

    it("nie liczy, gdy brakuje brutto albo VAT nie jest liczbą", () => {
        expect(netFromVat("", "21,13")).toBeNull();
        expect(netFromVat("112,98", "")).toBeNull();
        expect(netFromVat("112,98", "abc")).toBeNull();
    });
});

describe("vatAmount — komunikat pod polem", () => {
    it("puste pole nie ma zastrzeżeń", () => {
        expect(vatError("", "112,98")).toBeNull();
        expect(vatError("   ", "112,98")).toBeNull();
    });

    it("poprawny VAT niższy od brutto przechodzi, także bez brutto", () => {
        expect(vatError("21,13", "112,98")).toBeNull();
        expect(vatError("21,13", "")).toBeNull();
        expect(vatError("0", "112,98")).toBeNull();
    });

    it("odrzuca nie-liczbę, wartość ujemną i VAT nie niższy od brutto", () => {
        expect(vatError("abc", "112,98")).toBe("VAT musi być liczbą");
        expect(vatError("-1", "112,98")).toBe("VAT nie może być ujemny");
        expect(vatError("112,98", "112,98")).toBe("VAT musi być niższy od brutto");
        expect(vatError("200", "112,98")).toBe("VAT musi być niższy od brutto");
    });
});
