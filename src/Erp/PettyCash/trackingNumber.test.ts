import { describe, it, expect } from "vitest";
import {
    normalizeTrackingNumber,
    hasValidCheckDigit,
    isValidTrackingNumber,
    formatTrackingNumber,
    describeRejection,
} from "./trackingNumber";

/** Prawdziwe numery z rejestru listów, roczniki 2011-2026. */
const REAL = [
    "559007734369539067",
    "559007734369539074",
    "559007734369516372",
    "759007734163447845",
    "359007731352700431",
    "659007734064088942",
];
const SSCC = REAL[0];

describe("normalizeTrackingNumber", () => {
    it("zdejmuje identyfikator aplikacji (00) z odczytu skanera", () => {
        expect(normalizeTrackingNumber(`(00)${SSCC}`)).toBe(SSCC);
        expect(normalizeTrackingNumber(`00${SSCC}`)).toBe(SSCC);
    });

    it("przyjmuje same 18 cyfr", () => {
        expect(normalizeTrackingNumber(SSCC)).toBe(SSCC);
    });

    it("ignoruje spacje i znaki rozdzielające", () => {
        expect(normalizeTrackingNumber("(00) 5590 0773 4369 5390 67")).toBe(SSCC);
    });

    it("odrzuca odczyt o złej długości", () => {
        expect(normalizeTrackingNumber(SSCC.slice(0, 16))).toBeNull();
        expect(normalizeTrackingNumber(`${SSCC}12`)).toBeNull();
        expect(normalizeTrackingNumber("")).toBeNull();
        expect(normalizeTrackingNumber(null)).toBeNull();
    });

    it("odrzuca kod innego typu", () => {
        expect(normalizeTrackingNumber("EE 38 951 937 5 PL")).toBeNull();
    });
});

describe("hasValidCheckDigit", () => {
    it("potwierdza wszystkie prawdziwe numery z arkusza", () => {
        for (const real of REAL) expect(hasValidCheckDigit(real)).toBe(true);
    });

    it("odrzuca przekłamaną ostatnią cyfrę", () => {
        const wrong = SSCC.slice(0, 17) + (Number(SSCC[17]) === 8 ? "7" : "8");
        expect(hasValidCheckDigit(wrong)).toBe(false);
    });

    it("odrzuca przekłamaną cyfrę w środku", () => {
        const wrong = SSCC.slice(0, 9) + (Number(SSCC[9]) === 9 ? "8" : "9") + SSCC.slice(10);
        expect(wrong).not.toBe(SSCC);
        expect(hasValidCheckDigit(wrong)).toBe(false);
    });

    it("odrzuca cokolwiek, co nie ma 18 cyfr", () => {
        expect(hasValidCheckDigit("123")).toBe(false);
        expect(hasValidCheckDigit(`00${SSCC}`)).toBe(false);
    });
});

describe("isValidTrackingNumber i formatTrackingNumber", () => {
    it("uznaje odczyt ze skanera za poprawny", () => {
        expect(isValidTrackingNumber(`(00)${SSCC}`)).toBe(true);
        expect(isValidTrackingNumber("123")).toBe(false);
    });

    it("zwraca postać używaną w arkuszu", () => {
        expect(formatTrackingNumber(SSCC)).toBe(`(00)${SSCC}`);
    });
});

describe("describeRejection", () => {
    it("nie zgłasza nic dla poprawnego, nowego numeru", () => {
        expect(describeRejection(`(00)${SSCC}`, [])).toBeNull();
    });

    it("rozróżnia zły kod od złego odczytu", () => {
        expect(describeRejection("ABC")).toBe("not-a-number");
        expect(describeRejection(SSCC.slice(0, 12))).toBe("wrong-length");
        expect(describeRejection(SSCC.slice(0, 17) + "0")).toBe("bad-check-digit");
    });

    it("rozpoznaje kod S10 (Pocztex, paczka) jako nieobsługiwany rodzaj przesyłki", () => {
        expect(describeRejection("EE 38 951 937 5 PL")).toBe("unsupported-code");
        expect(describeRejection("EE389519375PL")).toBe("unsupported-code");
    });

    it("wykrywa list już dopisany do wysyłki", () => {
        expect(describeRejection(`(00)${SSCC}`, [SSCC])).toBe("duplicate");
    });
});
