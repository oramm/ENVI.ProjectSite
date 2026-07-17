import { describe, it, expect } from "vitest";
import { computeJstInvoicePrefill } from "./invoiceJstPrefill";
import { OurContract } from "../../../../Typings/bussinesTypes";

const gmina = { id: 747 - 100, name: "Gmina Duszniki", taxNumber: "7871995455", address: "ul. Sportowa 1, 64-550 Duszniki" } as any;
const zaklad = { id: 747, name: "Komunalny Zakład Budżetowy", taxNumber: "7871006601", address: "ul. Szamotulska 16, 64-550 Duszniki" } as any;

function contract(overrides: Partial<OurContract>): OurContract {
    return { _employers: [zaklad], ...overrides } as OurContract;
}

describe("computeJstInvoicePrefill (F3 — auto-fill Nabywca/Odbiorca dla klasy JST)", () => {
    it("NOWA FV z umowy z Nabywcą FV → Nabywca=gmina, Odbiorca=Zamawiający rola 8, JST+Podmiot3 on", () => {
        const result = computeJstInvoicePrefill(contract({ _invoiceBuyer: gmina }), false);
        expect(result).not.toBeNull();
        expect(result!._entity).toBe(gmina); // Podmiot2 = Nabywca = gmina
        expect(result!.isJstSubordinate).toBe(true);
        expect(result!.includeThirdParty).toBe(true);
        expect(result!._thirdParties).toHaveLength(1);
        expect(result!._thirdParties[0].role).toBe(8); // JST odbiorca
        expect(result!._thirdParties[0]._entity).toBe(zaklad); // Odbiorca = Zamawiający (zakład)
    });

    it("NOWA FV z umowy BEZ Nabywcy FV → null (dzisiejsze zachowanie)", () => {
        expect(computeJstInvoicePrefill(contract({ _invoiceBuyer: undefined }), false)).toBeNull();
    });

    it("EDYCJA istniejącej FV → null nawet gdy umowa ma Nabywcę FV (D3 — dane FV nietknięte)", () => {
        expect(computeJstInvoicePrefill(contract({ _invoiceBuyer: gmina }), true)).toBeNull();
    });

    it("umowa z Nabywcą FV ale bez Zamawiającego → Odbiorca=null (graceful, blok bez encji)", () => {
        const result = computeJstInvoicePrefill(contract({ _invoiceBuyer: gmina, _employers: [] }), false);
        expect(result).not.toBeNull();
        expect(result!._thirdParties[0].role).toBe(8);
        expect(result!._thirdParties[0]._entity).toBeUndefined();
    });

    it("brak umowy (contextData undefined) → null", () => {
        expect(computeJstInvoicePrefill(undefined, false)).toBeNull();
    });
});
