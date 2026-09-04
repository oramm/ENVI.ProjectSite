import { describe, it, expect } from "vitest";
import {
    previewCashRow,
    previewExpense,
    previewInflow,
    previewPayer,
    previewRegisterBlock,
    PreviewInput,
} from "./previewRows";

const base: PreviewInput = {
    entryKind: "INVOICE",
    entryDate: "2026-08-13",
    description: "paliwo do FORD OP8105L",
    netAmount: "91,85",
    grossAmount: "112,98",
    noDocumentAmount: "",
    inflowAmount: "",
    documentNumber: "178/F/365/26",
    payerLabel: "Krzysiek",
    settlementMethod: "CARD",
    note: "",
    odometerReading: "",
};

const values = (input: PreviewInput) => previewCashRow(input).map((cell) => cell.value);
const last = <T>(list: T[]) => list[list.length - 1];

describe("previewRows — uwaga przy tankowaniu", () => {
    const fuel = { ...base, entryKind: "FUEL" as const, odometerReading: "150480" };

    it("licznik wchodzi do kolumny uwagi przed treścią uwagi", () => {
        expect(last(values(fuel))).toBe("licznik 150 480 km");
        expect(last(values({ ...fuel, note: "do pełna" }))).toBe(
            "licznik 150 480 km, do pełna"
        );
    });

    it("komórka uwagi przestaje być edytowalna, gdy składa się z dwóch pól", () => {
        expect(last(previewCashRow(fuel)).field).toBeUndefined();
        expect(last(previewCashRow({ ...base, note: "cokolwiek" })).field).toBe("note");
    });
});

describe("previewRows — kolumna wpływu i wydatku", () => {
    it("karta: wpływ lustrzany do wydatku, więc saldo portfela się nie zmienia", () => {
        expect(previewExpense(base)).toBe(112.98);
        expect(previewInflow(base)).toBe(112.98);
    });

    it("gotówka: kolumna wpływu pusta", () => {
        expect(previewInflow({ ...base, settlementMethod: "CASH" })).toBeNull();
    });

    it("wypłata zaliczki: wpływ wprost, wydatek zero", () => {
        const advance: PreviewInput = {
            ...base,
            entryKind: "ADVANCE",
            settlementMethod: "ADVANCE",
            inflowAmount: "2000",
            netAmount: "",
            grossAmount: "",
        };
        expect(previewInflow(advance)).toBe(2000);
        expect(previewExpense(advance)).toBe(0);
    });

    it("wydatek bez dokumentu liczy się z kolumny BEZ FV", () => {
        expect(
            previewExpense({
                ...base,
                entryKind: "NO_DOCUMENT",
                grossAmount: "",
                noDocumentAmount: "500",
            })
        ).toBe(500);
    });
});

describe("previewRows — kto zapłacił", () => {
    it("skleja sposób płatności z osobą", () => {
        expect(previewPayer(base)).toBe("karta Krzysiek");
        expect(previewPayer({ ...base, settlementMethod: "CASH", payerLabel: "Karolina" })).toBe(
            "got. Karolina"
        );
    });

    it("nie dubluje przedrostka wpisanego ręcznie i poprawia niezgodny", () => {
        expect(previewPayer({ ...base, payerLabel: "karta Krzysiek" })).toBe("karta Krzysiek");
        expect(previewPayer({ ...base, payerLabel: "got. Krzysiek" })).toBe("karta Krzysiek");
    });

    it("puste nazwisko nie tworzy samego przedrostka", () => {
        expect(previewPayer({ ...base, payerLabel: "" })).toBe("");
    });
});

describe("previewRows — wiersz zaliczek", () => {
    it("ma dziesięć kolumn, w kolejności arkusza", () => {
        const row = values(base);
        expect(row).toHaveLength(10);
        expect(row[0]).toBe("2026-08-13");
        expect(row[1]).toBe("112,98"); // wpływ (karta)
        expect(row[2]).toBe("paliwo do FORD OP8105L");
        expect(row[3]).toBe("91,85"); // netto
        expect(row[4]).toBe("112,98"); // brutto
        expect(row[5]).toBe(""); // bez FV
        expect(row[6]).toBe("112,98"); // wydatek
        expect(row[7]).toBe("178/F/365/26");
        expect(row[8]).toBe("karta Krzysiek");
    });

    it("przy poczcie netto powtarza brutto, bo usługa jest zwolniona z VAT", () => {
        const row = values({
            ...base,
            entryKind: "POSTAL",
            settlementMethod: "CASH",
            netAmount: "",
            grossAmount: "19,60",
            payerLabel: "Karolina",
        });
        expect(row[3]).toBe("19,60");
        expect(row[4]).toBe("19,60");
        expect(row[1]).toBe(""); // gotówka nie wypełnia kolumny wpływu
    });
});

describe("previewRows — co wolno edytować w tabeli", () => {
    it("kolumny liczone przez arkusz są zablokowane i mówią dlaczego", () => {
        const row = previewCashRow(base);
        const expense = row[6];
        const inflow = row[1];
        const payer = row[8];

        expect(expense.field).toBeUndefined();
        expect(expense.hint).toContain("formułą");
        expect(inflow.field).toBeUndefined();
        expect(inflow.hint).toContain("karcie");
        expect(payer.field).toBeUndefined();
        expect(payer.hint).toContain("czym zapłacono");
    });

    it("kolumny wpisywane wskazują pole formularza, które zmieniają", () => {
        const row = previewCashRow(base);
        expect(row[0].field).toBe("entryDate");
        expect(row[2].field).toBe("description");
        expect(row[3].field).toBe("netAmount");
        expect(row[4].field).toBe("grossAmount");
        expect(row[7].field).toBe("documentNumber");
        expect(row[9].field).toBe("note");
    });

    it("przy poczcie netto jest zablokowane, bo wynika z brutto", () => {
        const row = previewCashRow({ ...base, entryKind: "POSTAL", settlementMethod: "CASH" });
        expect(row[3].field).toBeUndefined();
        expect(row[3].hint).toContain("zwolnione z VAT");
    });

    it("przy wypłacie zaliczki kolumna wpływu staje się polem do wpisania", () => {
        const row = previewCashRow({
            ...base,
            entryKind: "ADVANCE",
            settlementMethod: "ADVANCE",
            inflowAmount: "2000",
        });
        expect(row[1].field).toBe("inflowAmount");
    });
});

describe("previewRows — blok rejestru listów", () => {
    const postal: PreviewInput = {
        ...base,
        entryKind: "POSTAL",
        settlementMethod: "CASH",
        grossAmount: "19,60",
        documentNumber: "F00014G082600999273P",
        payerLabel: "Karolina",
    };
    const items = [
        {
            trackingNumber: "559007734369539067",
            addressee: "ZWiK Strzelin",
            contentsDescription: "pismo 5620",
            amount: "9,80",
        },
        {
            trackingNumber: "559007734369539074",
            addressee: "PGKiM Ozimek",
            contentsDescription: "FV 336",
            amount: "9,80",
        },
    ];
    const block = () => previewRegisterBlock(postal, items);

    it("ma nagłówek, pozycje i wiersz sumy", () => {
        expect(block()).toHaveLength(4);
        expect(block()[0][1].value).toBe("F00014G082600999273P");
        expect(block()[1][2].value).toBe("ZWiK Strzelin");
        expect(block()[3][6].value).toBe("19,60");
        expect(block()[3][7].value).toBe("got. Karolina");
    });

    it("data stoi tylko przy pierwszym liście — resztę kryje scalenie w arkuszu", () => {
        expect(block()[1][5].value).toBe("2026-08-13");
        expect(block()[2][5].value).toBe("");
        expect(block()[2][5].field).toBeUndefined();
    });

    it("numer nadania pokazuje się w postaci arkuszowej i da się go poprawić", () => {
        const cell = block()[1][4];
        expect(cell.value).toBe("(00)559007734369539067");
        expect(cell.item).toEqual({ index: 0, field: "trackingNumber" });
    });

    it("pola listu wskazują, którą pozycję zmieniają", () => {
        expect(block()[2][2].item).toEqual({ index: 1, field: "addressee" });
        expect(block()[2][3].item).toEqual({ index: 1, field: "contentsDescription" });
        expect(block()[2][6].item).toEqual({ index: 1, field: "amount" });
    });

    it("numer bloku i suma pozostają zablokowane", () => {
        expect(block()[0][0].field).toBeUndefined();
        expect(block()[0][0].hint).toContain("nadaje arkusz");
        expect(block()[3][6].field).toBeUndefined();
        expect(block()[3][6].hint).toContain("formułą");
    });
});
