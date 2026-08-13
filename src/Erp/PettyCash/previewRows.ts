import { EntryKind, SettlementMethod } from "./pettyCashApi";
import { formatTrackingNumber } from "./trackingNumber";

/**
 * Wiersze arkusza w postaci komórek: wartość plus informacja, czy da się w niej pisać.
 *
 * Tabela pod formularzem nie jest podglądem, tylko drugą powierzchnią edycji tych samych
 * danych — można wpisywać w formularzu albo wprost w komórce, bo obie czytają i zapisują
 * ten sam stan. Dlatego kazda komorka mowi, ktore pole zmienia.
 *
 * Komorki bez pola sa wyliczane: albo liczy je arkusz formula, albo skladaja sie z kilku
 * pol formularza. Wpisywanie w nie recznie rozjechaloby wiersz z tym, co naprawde powstanie.
 */

export type CashField =
    | "entryDate"
    | "description"
    | "netAmount"
    | "grossAmount"
    | "noDocumentAmount"
    | "inflowAmount"
    | "documentNumber"
    | "note";

export type ItemField = "addressee" | "contentsDescription" | "trackingNumber" | "amount";

export type PreviewCell = {
    value: string;
    /** Pole formularza, które ta komórka edytuje. Brak = komórka wyliczana. */
    field?: CashField;
    /** Pozycja listu, którą ta komórka edytuje. */
    item?: { index: number; field: ItemField };
    /** Dlaczego nie da się tu pisać — pokazywane po najechaniu. */
    hint?: string;
    numeric?: boolean;
    /** Treść bywa długa (opis, co wysłano), więc komórka ma się zawijać, a nie ucinać. */
    multiline?: boolean;
};

export type PreviewInput = {
    entryKind: EntryKind;
    entryDate: string;
    description: string;
    netAmount: string;
    grossAmount: string;
    noDocumentAmount: string;
    inflowAmount: string;
    documentNumber: string;
    payerLabel: string;
    settlementMethod: SettlementMethod;
    note: string;
};

export type PreviewItem = {
    trackingNumber: string;
    addressee: string;
    contentsDescription: string;
    amount: string;
};

/**
 * Kwota z pola tekstowego. W arkuszu i na klawiaturze telefonu używa się przecinka.
 * `toAmount` zwraca NaN dla nie-liczby (walidacja musi je odróżnić), `toNumber` zero
 * (podgląd i sumy wolą policzyć się z tym, co jest).
 */
export function toAmount(value: unknown): number {
    return Number.parseFloat(String(value ?? "").replace(",", "."));
}

export function toNumber(value: unknown): number {
    const parsed = toAmount(value);
    return Number.isFinite(parsed) ? parsed : 0;
}

/** Kwoty w arkuszu mają dwa miejsca po przecinku i przecinek jako separator. */
export function formatAmount(value: number): string {
    return value.toFixed(2).replace(".", ",");
}

/** Kolumna wydatku to w arkuszu formuła `=E+F`. */
export function previewExpense(input: PreviewInput): number {
    if (input.entryKind === "ADVANCE") return 0;
    if (input.entryKind === "NO_DOCUMENT") return toNumber(input.noDocumentAmount);
    return toNumber(input.grossAmount);
}

/** Kolumna wpływu: karta lustrzanie do wydatku, wypłata zaliczki wprost, gotówka pusto. */
export function previewInflow(input: PreviewInput): number | null {
    if (input.settlementMethod === "CARD") return previewExpense(input);
    if (input.settlementMethod === "ADVANCE") return toNumber(input.inflowAmount);
    return null;
}

/**
 * Kolumna „kto zapłacił” łączy sposób płatności z osobą: `got. Karolina`, `karta Krzysiek`.
 * Przedrostek wpisany przez człowieka zdejmujemy, żeby nie powstało `got. got. Michał`.
 */
export function previewPayer(input: PreviewInput): string {
    const name = input.payerLabel.replace(/^\s*(got\.?|gotówk[aą]|karta\.?|kart[ąa])\s+/i, "").trim();
    if (!name) return "";
    return input.settlementMethod === "CARD" ? `karta ${name}` : `got. ${name}`;
}

/** Netto przy poczcie równa się brutto — usługa jest zwolniona z VAT. */
export function previewNet(input: PreviewInput): string {
    if (input.entryKind === "POSTAL") return input.grossAmount;
    if (input.entryKind === "NO_DOCUMENT" || input.entryKind === "ADVANCE") return "";
    return input.netAmount || input.grossAmount;
}

const editable = (
    value: string,
    field: CashField,
    numeric = false,
    multiline = false
): PreviewCell => ({ value, field, numeric, multiline });

const derived = (value: string, hint: string, numeric = false): PreviewCell => ({
    value,
    hint,
    numeric,
});

/** Wiersz arkusza zaliczek, kolumny A..J, w kolejności arkusza. */
export function previewCashRow(input: PreviewInput): PreviewCell[] {
    const inflow = previewInflow(input);
    const hasDocumentAmounts =
        input.entryKind === "POSTAL" ||
        input.entryKind === "INVOICE" ||
        input.entryKind === "RECEIPT";
    const isPostal = input.entryKind === "POSTAL";
    const isAdvance = input.entryKind === "ADVANCE";
    const isNoDocument = input.entryKind === "NO_DOCUMENT";

    return [
        editable(input.entryDate, "entryDate"),
        isAdvance
            ? editable(input.inflowAmount, "inflowAmount", true)
            : derived(
                  inflow === null ? "" : formatAmount(inflow),
                  input.settlementMethod === "CARD"
                      ? "Przy karcie arkusz wpisuje tu formułę równą wydatkowi — saldo portfela się nie zmienia."
                      : "Przy gotówce ta kolumna zostaje pusta.",
                  true
              ),
        editable(input.description, "description", false, true),
        isPostal
            ? derived(
                  previewNet(input).replace(".", ","),
                  "Usługi pocztowe są zwolnione z VAT, więc netto równa się kwocie faktury.",
                  true
              )
            : hasDocumentAmounts
              ? editable(input.netAmount, "netAmount", true)
              : derived("", "Ten rodzaj wpisu nie ma kwoty netto.", true),
        hasDocumentAmounts
            ? editable(input.grossAmount, "grossAmount", true)
            : derived("", "Ten rodzaj wpisu nie ma kwoty brutto.", true),
        isNoDocument
            ? editable(input.noDocumentAmount, "noDocumentAmount", true)
            : derived("", "Ta kolumna dotyczy tylko wydatków bez dokumentu.", true),
        derived(
            formatAmount(previewExpense(input)),
            "Arkusz liczy tę kolumnę formułą: brutto plus kwota bez dokumentu.",
            true
        ),
        hasDocumentAmounts
            ? editable(input.documentNumber, "documentNumber")
            : derived("", "Ten rodzaj wpisu nie ma numeru dokumentu."),
        derived(
            previewPayer(input),
            "Składa się z pól „czym zapłacono” i „kto zapłacił”."
        ),
        editable(input.note, "note", false, true),
    ];
}

/**
 * Szerokości kolumn podglądu. Numer nadania musi zmieścić 22 znaki, bo ucięta ostatnia
 * cyfra wygląda jak poprawny numer. Data i kwota dostają mniej, bo więcej nie potrzebują.
 */
export const CASH_WIDTHS = [96, 104, 230, 76, 76, 92, 88, 176, 132, 170];
export const REGISTER_WIDTHS = [44, 150, 176, 260, 190, 96, 78, 132];

export const CASH_HEADERS = [
    "Data",
    "ZALICZKA, zapłata kartą (wpływ)",
    "OPIS",
    "NETTO",
    "BRUTTO",
    "BEZ FV / PARAGON",
    "wydatek",
    "saldo / Nr faktury",
    "kto zapłacił",
    "uwaga",
];

export const REGISTER_HEADERS = [
    "nr",
    "nr faktury / lp",
    "adresat",
    "co wysłano",
    "nr listu",
    "data",
    "kwota",
    "kto zapłacił",
];

/** Blok rejestru listów: nagłówek, pozycje, suma — dokładnie jak w arkuszu. */
export function previewRegisterBlock(
    input: PreviewInput,
    items: PreviewItem[]
): PreviewCell[][] {
    const total = items.reduce((sum, item) => sum + toNumber(item.amount), 0);

    const header: PreviewCell[] = [
        derived("?", "Numer bloku nadaje arkusz: o jeden wyższy od ostatniego."),
        editable(input.documentNumber, "documentNumber"),
        derived("", "Numer faktury zajmuje w arkuszu trzy scalone komórki."),
        derived("", "Numer faktury zajmuje w arkuszu trzy scalone komórki."),
        derived("nr listu", "Etykieta kolumny, przepisywana z poprzedniego bloku."),
        derived("data", "Etykieta kolumny, przepisywana z poprzedniego bloku."),
        derived("kwota", "Etykieta kolumny, przepisywana z poprzedniego bloku."),
        derived("", ""),
    ];

    const rows: PreviewCell[][] = items.map((item, index) => [
        derived("", "Numer bloku stoi tylko w nagłówku — niżej kryje go scalenie."),
        derived(String(index + 1), "Numer porządkowy listu w bloku."),
        {
            value: item.addressee,
            item: { index, field: "addressee" },
        },
        {
            value: item.contentsDescription,
            item: { index, field: "contentsDescription" },
            multiline: true,
        },
        {
            value: item.trackingNumber ? formatTrackingNumber(item.trackingNumber) : "",
            item: { index, field: "trackingNumber" },
        },
        index === 0
            ? editable(input.entryDate, "entryDate")
            : derived("", "Data stoi tylko przy pierwszym liście — resztę kryje scalenie."),
        { value: item.amount, item: { index, field: "amount" }, numeric: true },
        derived("", ""),
    ]);

    const sum: PreviewCell[] = [
        derived("", ""),
        derived("", ""),
        derived("", ""),
        derived("", ""),
        derived("", ""),
        derived("", ""),
        derived(formatAmount(total), "Arkusz liczy sumę formułą z kwot listów.", true),
        derived(previewPayer(input), "Składa się z pól „czym zapłacono” i „kto zapłacił”."),
    ];

    return [header, ...rows, sum];
}
