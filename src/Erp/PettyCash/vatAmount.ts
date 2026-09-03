import { formatAmount, toAmount } from "./previewRows";

/**
 * Pomocnicze pole „VAT" w formularzu zaliczek.
 *
 * Nie trafia do arkusza ani do backendu — istnieje po to, żeby wpisujący nie liczył
 * w głowie. Paragon podaje zwykle brutto i sumę podatku, a arkusz chce netto i brutto:
 *  - wpisane VAT i brutto dają netto (brutto minus VAT),
 *  - wpisane netto i brutto pokazują VAT do porównania z paragonem.
 *
 * Netto i VAT to para, z której ostatnio wpisana wartość jest źródłem, a druga wynika
 * z brutto. Brutto jest zawsze wpisywane ręcznie — to ono decyduje o stanie portfela.
 */

/** VAT wynikający z netto i brutto; pusty, gdy którejś kwoty brakuje albo nie jest liczbą. */
export function derivedVat(netAmount: string, grossAmount: string): string {
    const net = toAmount(netAmount);
    const gross = toAmount(grossAmount);
    if (!Number.isFinite(net) || !Number.isFinite(gross)) return "";
    return formatAmount(gross - net);
}

/** Netto wynikające z brutto i VAT; null, gdy nie da się policzyć. */
export function netFromVat(grossAmount: string, vatAmount: string): string | null {
    const gross = toAmount(grossAmount);
    const vat = toAmount(vatAmount);
    if (!Number.isFinite(gross) || !Number.isFinite(vat)) return null;
    return formatAmount(gross - vat);
}

/**
 * Komunikat pod polem VAT; null = bez zastrzeżeń.
 *
 * Pole jest pomocnicze, więc nie blokuje zapisu — błąd i tak wyjdzie przy netto,
 * które z niego wynika. Komunikat mówi tylko, dlaczego netto wyszło źle.
 */
export function vatError(vatAmount: string, grossAmount: string): string | null {
    if (!vatAmount.trim()) return null;
    const vat = toAmount(vatAmount);
    if (!Number.isFinite(vat)) return "VAT musi być liczbą";
    if (vat < 0) return "VAT nie może być ujemny";
    const gross = toAmount(grossAmount);
    if (Number.isFinite(gross) && vat >= gross) return "VAT musi być niższy od brutto";
    return null;
}
