import MainSetup from "../../React/MainSetupReact";
import { AiUsageInfo } from "../../../Typings/bussinesTypes";

export type EntryKind = "POSTAL" | "INVOICE" | "RECEIPT" | "FUEL" | "NO_DOCUMENT" | "ADVANCE";
export type SettlementMethod = "CASH" | "CARD" | "ADVANCE";

/**
 * Rodzaje z kwotą netto, brutto i numerem dokumentu. Formularz, walidacja i podgląd
 * wiersza pytają o to samo, więc lista stoi w jednym miejscu. Backend ma tę regułę
 * u siebie, na modelu domenowym - to jest jej odbicie po stronie ekranu.
 */
export const KINDS_WITH_DOCUMENT: readonly EntryKind[] = [
    "POSTAL",
    "INVOICE",
    "RECEIPT",
    "FUEL",
];

export type PostalItemPayload = {
    trackingNumber: string;
    addressee: string;
    contentsDescription?: string | null;
    amount: string;
};

export type PettyCashEntryPayload = {
    entryKind: EntryKind;
    entryDate: string;
    description: string;
    netAmount?: string | null;
    grossAmount?: string | null;
    noDocumentAmount?: string | null;
    inflowAmount?: string | null;
    documentNumber?: string | null;
    payerLabel: string;
    settlementMethod: SettlementMethod;
    note?: string | null;
    dispatch?: { invoiceNumber: string; items: PostalItemPayload[] } | null;
};

export type CommitResult = {
    register: { action: string; blockNumber?: number; headerRow?: number; reason?: string } | null;
    cash: { action: string; targetRow?: number; reason?: string };
};

/**
 * Czy cokolwiek naprawdę trafiło do arkusza.
 *
 * Backend odpowiada 201 także wtedy, gdy pominął zapis, bo ten sam wpis już tam jest —
 * z punktu widzenia HTTP nic się nie stało złego. Dla człowieka to jednak różnica między
 * „dodane" a „nie dodane", i to ona decyduje o kolorze komunikatu.
 */
export function wroteAnything(result: CommitResult): boolean {
    return result.cash.action === "write" || result.register?.action === "write";
}

export class PettyCashApiError extends Error {
    /** Lista błędów walidacji z backendu; pusta, gdy błąd nie był walidacyjny. */
    readonly errors: string[];
    readonly status: number;

    constructor(message: string, status: number, errors: string[] = []) {
        super(message);
        this.name = "PettyCashApiError";
        this.status = status;
        this.errors = errors;
    }
}

async function parseError(response: Response, fallback: string): Promise<never> {
    let payload: any;
    try {
        payload = await response.json();
    } catch {
        payload = undefined;
    }
    throw new PettyCashApiError(
        payload?.error || `${fallback} (${response.status})`,
        response.status,
        Array.isArray(payload?.errors) ? payload.errors : []
    );
}

export async function submitEntry(payload: PettyCashEntryPayload): Promise<CommitResult> {
    const response = await fetch(`${MainSetup.serverUrl}pettyCash/entries`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!response.ok) await parseError(response, "Nie udało się zapisać wpisu");
    return (await response.json()) as CommitResult;
}

export type ReceiptSuggestion = {
    documentNumber: string | null;
    netAmount: number | null;
    grossAmount: number | null;
    /** false = nie rozpoznano; `reason` mówi dlaczego i co zrobić */
    recognized: boolean;
    reason?: string;
    /** Zużycie modelu — pokazywane tak samo jak przy pismach. Brak, gdy model nie był wołany. */
    _model?: string;
    _usage?: AiUsageInfo;
};

/**
 * Zdjęcie albo PDF paragonu/faktury → podpowiedzi kwot i numeru.
 *
 * Serwer odczytuje tekst i pyta model; obraz nie opuszcza backendu. Nagłówka
 * `Content-Type` nie ustawiamy — przy `FormData` przeglądarka musi dopisać własną
 * granicę multipart, a ręczne ustawienie ją psuje.
 */
export async function analyzeDocument(file: File): Promise<ReceiptSuggestion> {
    const body = new FormData();
    body.append("file", file);
    const response = await fetch(`${MainSetup.serverUrl}pettyCash/documents/analyze`, {
        method: "POST",
        credentials: "include",
        body,
    });
    if (!response.ok) await parseError(response, "Nie udało się przeanalizować dokumentu");
    return (await response.json()) as ReceiptSuggestion;
}

export type SheetLinks = { pettyCashUrl: string | null; registerUrl: string | null };

/** Adresy obu arkuszy — pochodzą z konfiguracji serwera, więc w dev prowadzą do kopii. */
export async function fetchSheetLinks(): Promise<SheetLinks> {
    const response = await fetch(`${MainSetup.serverUrl}pettyCash/links`, {
        credentials: "include",
    });
    if (!response.ok) await parseError(response, "Nie udało się pobrać adresów arkuszy");
    return await response.json();
}
