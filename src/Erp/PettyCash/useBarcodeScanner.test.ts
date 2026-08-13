import { describe, it, expect } from "vitest";
import { evaluateScan } from "./useBarcodeScanner";

const SSCC = "559007734369539067";
const SSCC_2 = "559007734369539074";
const RAW = `(00)${SSCC}`;

describe("evaluateScan — przyjęcie odczytu", () => {
    it("przyjmuje poprawny, nowy numer i zwraca go w postaci 18 cyfr", () => {
        expect(evaluateScan(RAW, [], null, 1000)).toEqual({
            action: "accept",
            trackingNumber: SSCC,
        });
    });

    it("przyjmuje kolejny, inny numer mimo krótkiego odstępu", () => {
        const previous = { value: RAW, at: 1000 };
        expect(evaluateScan(`(00)${SSCC_2}`, [SSCC], previous, 1100)).toEqual({
            action: "accept",
            trackingNumber: SSCC_2,
        });
    });
});

describe("evaluateScan — ten sam kod w kadrze", () => {
    it("ignoruje powtórzony odczyt w oknie tłumienia", () => {
        const previous = { value: RAW, at: 1000 };
        expect(evaluateScan(RAW, [], previous, 1200)).toEqual({ action: "ignore" });
    });

    it("po upływie okna reaguje ponownie — wtedy jako duplikat listy", () => {
        const previous = { value: RAW, at: 1000 };
        expect(evaluateScan(RAW, [SSCC], previous, 5000)).toEqual({
            action: "reject",
            rejection: "duplicate",
        });
    });
});

describe("evaluateScan — odczyty do odrzucenia", () => {
    it("odrzuca list już dopisany do wysyłki", () => {
        expect(evaluateScan(RAW, [SSCC], null, 1000)).toEqual({
            action: "reject",
            rejection: "duplicate",
        });
    });

    it("odrzuca urwany odczyt", () => {
        expect(evaluateScan(SSCC.slice(0, 12), [], null, 1000)).toEqual({
            action: "reject",
            rejection: "wrong-length",
        });
    });

    it("odrzuca przekłamaną cyfrę zamiast wpuścić zły numer", () => {
        expect(evaluateScan(SSCC.slice(0, 17) + "0", [], null, 1000)).toEqual({
            action: "reject",
            rejection: "bad-check-digit",
        });
    });

    it("rozpoznaje Pocztex jako inny rodzaj przesyłki, a nie jako zły odczyt", () => {
        expect(evaluateScan("EE 38 951 937 5 PL", [], null, 1000)).toEqual({
            action: "reject",
            rejection: "unsupported-code",
        });
    });
});
