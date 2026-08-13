import { describe, it, expect } from "vitest";
import { makePettyCashValidationSchema } from "./PettyCashValidationSchema";

const schema = makePettyCashValidationSchema();

const base = {
    entryKind: "INVOICE",
    entryDate: "2026-08-13",
    description: "paliwo do FORD OP8105L",
    settlementMethod: "CARD",
    payerLabel: "Krzysiek",
    note: "",
    documentNumber: "178/F/365/26",
    netAmount: "91,85",
    grossAmount: "112,98",
    noDocumentAmount: "",
    inflowAmount: "",
    items: [],
};

const postal = {
    ...base,
    entryKind: "POSTAL",
    settlementMethod: "CASH",
    description: "poczta - listy",
    documentNumber: "F00014G082600999273P",
    netAmount: "",
    grossAmount: "19,60",
    items: [
        {
            trackingNumber: "559007734369539067",
            scanned: true,
            addressee: "ZWiK Strzelin",
            contentsDescription: "pismo 5620",
            amount: "9,80",
        },
        {
            trackingNumber: "559007734369539074",
            scanned: true,
            addressee: "PGKiM Ozimek",
            contentsDescription: "",
            amount: "9,80",
        },
    ],
};

/** Zwraca listę komunikatów; pusta = formularz poprawny. */
async function errorsOf(values: unknown): Promise<string[]> {
    try {
        await schema.validate(values, { abortEarly: false });
        return [];
    } catch (error: any) {
        return error.errors ?? [String(error.message)];
    }
}

describe("walidacja — wpisy poprawne", () => {
    it("faktura na kartę przechodzi", async () => {
        expect(await errorsOf(base)).toEqual([]);
    });

    it("wysyłka pocztowa ze zgodną sumą przechodzi", async () => {
        expect(await errorsOf(postal)).toEqual([]);
    });

    it("wydatek bez dokumentu przechodzi bez numeru i bez kwot netto/brutto", async () => {
        expect(
            await errorsOf({
                ...base,
                entryKind: "NO_DOCUMENT",
                settlementMethod: "CASH",
                description: "p.Irena 7/2026",
                documentNumber: "",
                netAmount: "",
                grossAmount: "",
                noDocumentAmount: "500",
            })
        ).toEqual([]);
    });

    it("wypłata zaliczki przechodzi z samą przekazaną kwotą", async () => {
        expect(
            await errorsOf({
                ...base,
                entryKind: "ADVANCE",
                settlementMethod: "ADVANCE",
                description: "zaliczka",
                documentNumber: "",
                netAmount: "",
                grossAmount: "",
                inflowAmount: "2000",
            })
        ).toEqual([]);
    });
});

describe("walidacja — pola wymagane", () => {
    it("wskazuje brak opisu, płacącego i daty", async () => {
        const errors = await errorsOf({ ...base, description: "", payerLabel: "", entryDate: "" });
        expect(errors).toContain("Podaj opis");
        expect(errors).toContain("Podaj, kto zapłacił");
        expect(errors).toContain("Podaj datę");
    });

    it("faktura wymaga numeru dokumentu i obu kwot", async () => {
        const errors = await errorsOf({
            ...base,
            documentNumber: "",
            netAmount: "",
            grossAmount: "",
        });
        expect(errors).toContain("Podaj numer dokumentu");
        expect(errors).toContain("Podaj kwotę netto");
        expect(errors).toContain("Podaj kwotę brutto");
    });

    it("wydatek bez dokumentu wymaga kwoty", async () => {
        const errors = await errorsOf({
            ...base,
            entryKind: "NO_DOCUMENT",
            settlementMethod: "CASH",
            documentNumber: "",
            netAmount: "",
            grossAmount: "",
            noDocumentAmount: "",
        });
        expect(errors).toContain("Podaj kwotę");
    });
});

describe("walidacja — kwoty", () => {
    it("przyjmuje przecinek jako separator dziesiętny", async () => {
        expect(await errorsOf({ ...base, netAmount: "91,85" })).toEqual([]);
        expect(await errorsOf({ ...base, netAmount: "91.85" })).toEqual([]);
    });

    it("odrzuca kwotę, która nie jest liczbą, i zero", async () => {
        expect(await errorsOf({ ...base, grossAmount: "abc" })).toContain(
            "kwotę brutto musi być liczbą"
        );
        expect(await errorsOf({ ...base, grossAmount: "0" })).toContain(
            "kwotę brutto musi być większa od zera"
        );
    });

    it("nie pozwala, żeby netto było wyższe od brutto", async () => {
        expect(await errorsOf({ ...base, netAmount: "200", grossAmount: "112,98" })).toContain(
            "Netto nie może być wyższe od brutto"
        );
    });
});

describe("walidacja — wysyłka pocztowa", () => {
    it("wymaga co najmniej jednego listu", async () => {
        expect(await errorsOf({ ...postal, items: [] })).toContain(
            "Zeskanuj albo dodaj przynajmniej jeden list"
        );
    });

    it("wychwytuje sumę listów niezgodną z kwotą faktury", async () => {
        expect(await errorsOf({ ...postal, grossAmount: "30,00" })).toContain(
            "Suma listów nie zgadza się z kwotą faktury"
        );
    });

    it("wskazuje list bez adresata i z błędnym numerem nadania", async () => {
        const errors = await errorsOf({
            ...postal,
            items: [
                { ...postal.items[0], addressee: "" },
                { ...postal.items[1], trackingNumber: "12345" },
            ],
        });
        expect(errors).toContain("Podaj adresata");
        expect(errors.some((message) => message.includes("Numer nadania jest niepoprawny"))).toBe(
            true
        );
    });

    it("wpis niepocztowy nie może mieć listów", async () => {
        const errors = await errorsOf({ ...base, items: postal.items });
        expect(errors.length).toBeGreaterThan(0);
    });
});
