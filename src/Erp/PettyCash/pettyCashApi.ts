import MainSetup from "../../React/MainSetupReact";

export type EntryKind = "POSTAL" | "INVOICE" | "RECEIPT" | "NO_DOCUMENT" | "ADVANCE";
export type SettlementMethod = "CASH" | "CARD" | "ADVANCE";

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

export type SheetLinks = { pettyCashUrl: string | null; registerUrl: string | null };

/** Adresy obu arkuszy — pochodzą z konfiguracji serwera, więc w dev prowadzą do kopii. */
export async function fetchSheetLinks(): Promise<SheetLinks> {
    const response = await fetch(`${MainSetup.serverUrl}pettyCash/links`, {
        credentials: "include",
    });
    if (!response.ok) await parseError(response, "Nie udało się pobrać adresów arkuszy");
    return await response.json();
}
