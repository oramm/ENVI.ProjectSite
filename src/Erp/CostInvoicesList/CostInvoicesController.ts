import { CostInvoice, CostInvoiceSyncResponse } from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import RepositoryReact from "../../React/RepositoryReact";

type CostInvoiceApiErrorPayload = {
    error?: string;
    message?: string;
    errorMessage?: string;
    [key: string]: unknown;
};

export class CostInvoiceApiError extends Error {
    status?: number;
    payload?: CostInvoiceApiErrorPayload;

    constructor(message: string, options?: { status?: number; payload?: CostInvoiceApiErrorPayload }) {
        super(message);
        this.name = "CostInvoiceApiError";
        this.status = options?.status;
        this.payload = options?.payload;
    }
}

async function throwCostInvoiceApiError(response: Response, fallbackMessage: string): Promise<never> {
    let payload: CostInvoiceApiErrorPayload | undefined;

    try {
        payload = (await response.json()) as CostInvoiceApiErrorPayload;
    } catch {
        payload = undefined;
    }

    const message =
        payload?.error ||
        payload?.message ||
        payload?.errorMessage ||
        `${fallbackMessage} (${response.status})`;

    throw new CostInvoiceApiError(message, {
        status: response.status,
        payload,
    });
}

/**
 * Statusy płatności faktur kosztowych
 */
export const PaymentStatuses = {
    UNPAID: "UNPAID",
    PARTIALLY_PAID: "PARTIALLY_PAID",
    PAID: "PAID",
    NOT_APPLICABLE: "NOT_APPLICABLE",
} as const;

export type PaymentStatus = typeof PaymentStatuses[keyof typeof PaymentStatuses];

export type CostInvoiceQrData = {
    qrVerificationUrl: string;
    qrLabel: string;
    qrPayload: {
        environment: string;
        sellerNip: string;
        issueDate: string;
        invoiceHash: string;
    };
};

export type CostInvoiceReparsePreviewItem = {
    id: number;
    ksefNumber: string;
    invoiceNumber: string;
    changes: Record<string, { before: unknown; after: unknown }>;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
};

export type CostInvoiceReparsePreviewResponse = {
    scanned: number;
    changed: number;
    errors: string[];
    invoices: CostInvoiceReparsePreviewItem[];
};

/**
 * Repozytorium faktur kosztowych
 * Dane pobierane z KSeF i przechowywane lokalnie
 */
export const costInvoicesRepository = new RepositoryReact<CostInvoice>({
    actionRoutes: {
        getRoute: "cost-invoices",
        addNewRoute: "cost-invoices",
        editRoute: "cost-invoices",
        deleteRoute: "cost-invoices",
    },
    name: "costInvoices",
});

/**
 * Synchronizacja faktur z KSeF
 */
export async function syncFromKsef(params: {
    syncType: "INCREMENTAL" | "VERIFICATION";
    dateFrom?: string;
    dateTo?: string;
}): Promise<CostInvoiceSyncResponse> {
    const response = await fetch(`${MainSetup.serverUrl}cost-invoices/sync`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
    });

    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd synchronizacji");
    }

    return response.json();
}

/**
 * Pobiera szczegóły pojedynczej faktury
 */
export async function fetchCostInvoiceDetails(id: number): Promise<CostInvoice> {
    const response = await fetch(`${MainSetup.serverUrl}cost-invoices/${id}`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd pobierania szczegółów faktury");
    }

    const result = await response.json();
    return result.data || result;
}

/**
 * Pobiera dane QR dla faktury kosztowej (KSeF)
 */
export async function fetchCostInvoiceQr(id: number): Promise<CostInvoiceQrData> {
    const response = await fetch(`${MainSetup.serverUrl}cost-invoices/${id}/qr`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd pobierania danych QR");
    }

    const result = await response.json();
    return result.data || result;
}

/**
 * Aktualizuje dane faktury edytowalne ręcznie: notatkę i stan płatności
 */
export async function updateCostInvoice(
    id: number,
    data: Partial<{
        paymentStatus: PaymentStatus;
        paidAmount: number;
        notes: string | null;
    }>
): Promise<CostInvoice> {
    const response = await fetch(`${MainSetup.serverUrl}cost-invoices/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd aktualizacji faktury");
    }

    const result = await response.json();
    return result.data || result;
}

/**
 * NIP-K2 — ręczna (re-)weryfikacja Białej Listy VAT (KAS wl-api) dla faktury kosztowej.
 * Nadpisuje poprzedni wynik (whiteListStatus/whiteListRequestId/whiteListCheckedAt) —
 * backend przechowuje tylko ostatni. Domyślnie sprawdza na dziś (bez `date` w body).
 * Backend: PS-nodeJS POST /cost-invoices/:id/white-list/check
 */
export async function checkWhiteList(id: number, date?: string): Promise<CostInvoice> {
    const response = await fetch(`${MainSetup.serverUrl}cost-invoices/${id}/white-list/check`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(date ? { date } : {}),
    });

    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd weryfikacji Białej Listy");
    }

    const result = await response.json();
    return result.data || result;
}

/**
 * Podgląd zmian reparse (nagłówek faktury, bez pozycji)
 */
export async function fetchCostInvoiceReparsePreview(): Promise<CostInvoiceReparsePreviewResponse> {
    const response = await fetch(`${MainSetup.serverUrl}cost-invoices/reparse-preview`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd podglądu reparse");
    }

    const result = await response.json();
    return result.data || result;
}

/**
 * Zastosuj reparse dla wybranych faktur
 */
export async function applyCostInvoiceReparse(ids: number[]): Promise<{ updated: number; errors: string[] }> {
    const response = await fetch(`${MainSetup.serverUrl}cost-invoices/reparse-apply`, {
        method: "POST",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd zastosowania reparse");
    }

    const result = await response.json();
    return result.data || result;
}
