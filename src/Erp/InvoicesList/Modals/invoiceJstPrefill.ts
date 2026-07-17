import { EntityData, InvoiceThirdParty, OurContract } from "../../../../Typings/bussinesTypes";

/**
 * F3 — klasa JST (gmina = Nabywca FV, zakład/jednostka podrzędna = Odbiorca).
 *
 * Gdy NOWA faktura jest wystawiana z umowy, która ma ustawionego Nabywcę FV (`_invoiceBuyer`),
 * edytor FV wypełnia OBA podmioty automatycznie i blokuje je (D2/OD3):
 *  - Nabywca (Podmiot2)      = `_invoiceBuyer` (gmina),
 *  - Odbiorca (Podmiot3, rola 8, JST) = Zamawiający umowy (`_employers[0]`, zakład).
 *
 * Zwraca `null`, gdy auto-fill nie ma zastosowania:
 *  - edycja istniejącej FV (`isEditing`) — dane FV nietknięte (D3),
 *  - umowa bez Nabywcy FV — dzisiejsze zachowanie edytora bez zmian.
 */
export function computeJstInvoicePrefill(
    contract: OurContract | undefined,
    isEditing: boolean
): {
    _entity: EntityData;
    isJstSubordinate: true;
    includeThirdParty: true;
    _thirdParties: InvoiceThirdParty[];
} | null {
    if (isEditing) return null;
    const invoiceBuyer = contract?._invoiceBuyer;
    if (!invoiceBuyer) return null;
    const employer0 = contract?._employers?.[0];
    return {
        _entity: invoiceBuyer,
        isJstSubordinate: true,
        includeThirdParty: true,
        _thirdParties: [{ role: 8, _entity: employer0 }],
    };
}
