import {
    CostInvoice,
    CostInvoiceCategory,
    CostInvoiceMonthlyReport,
    CostInvoiceSyncResponse,
} from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import RepositoryReact from "../../React/RepositoryReact";

type CostInvoiceApiErrorPayload = {
    error?: string;
    message?: string;
    errorMessage?: string;
    details?: unknown;
    validationErrors?: unknown;
    errors?: unknown;
    [key: string]: unknown;
};

export class CostInvoiceApiError extends Error {
    status?: number;
    details: string[];
    payload?: CostInvoiceApiErrorPayload;

    constructor(message: string, options?: { status?: number; details?: string[]; payload?: CostInvoiceApiErrorPayload }) {
        super(message);
        this.name = "CostInvoiceApiError";
        this.status = options?.status;
        this.details = options?.details || [];
        this.payload = options?.payload;
    }
}

const toDetailList = (value: unknown): string[] => {
    if (!value) return [];

    if (Array.isArray(value)) {
        return value
            .map((entry) => (typeof entry === "string" ? entry : JSON.stringify(entry)))
            .filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0);
    }

    if (typeof value === "object") {
        return Object.entries(value as Record<string, unknown>).flatMap(([key, detailsValue]) => {
            if (Array.isArray(detailsValue)) {
                return detailsValue.map((entry) => `${key}: ${String(entry)}`);
            }
            if (detailsValue) {
                return `${key}: ${String(detailsValue)}`;
            }
            return [];
        });
    }

    if (typeof value === "string") {
        return [value];
    }

    return [];
};

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

    const details = [
        ...toDetailList(payload?.details),
        ...toDetailList(payload?.validationErrors),
        ...toDetailList(payload?.errors),
    ];

    throw new CostInvoiceApiError(message, {
        status: response.status,
        details,
        payload,
    });
}

/**
 * Statusy faktur kosztowych
 */
export const CostInvoiceStatuses = {
    NEW: "NEW",
    EXCLUDED: "EXCLUDED",
    BOOKED: "BOOKED",
} as const;

export type CostInvoiceStatus = typeof CostInvoiceStatuses[keyof typeof CostInvoiceStatuses];

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
 * Cache kategorii kosztów
 */
let categoriesCache: CostInvoiceCategory[] | null = null;

function normalizeCategoryName(name: string): string {
    return name.trim().toLocaleLowerCase("pl-PL");
}

function getCategoryDedupKey(category: CostInvoiceCategory): string {
    return `${normalizeCategoryName(category.name)}|${category.vatDeductionDefault}`;
}

function deduplicateCategories(categories: CostInvoiceCategory[]): CostInvoiceCategory[] {
    const seen = new Map<string, CostInvoiceCategory>();
    const duplicates = new Map<string, number[]>();

    for (const category of categories) {
        const key = getCategoryDedupKey(category);
        const existing = seen.get(key);

        if (!existing) {
            seen.set(key, category);
            continue;
        }

        const existingIds = duplicates.get(key) || [existing.id];
        existingIds.push(category.id);
        duplicates.set(key, existingIds);
    }

    if (duplicates.size > 0) {
        console.warn("[CostInvoices] API zwróciło zduplikowane kategorie kosztów", {
            duplicates: Array.from(duplicates.entries()).map(([key, ids]) => ({
                key,
                ids,
            })),
        });
    }

    return Array.from(seen.values());
}

/**
 * Pobiera listę kategorii kosztów
 */
export async function fetchCategories(): Promise<CostInvoiceCategory[]> {
    if (categoriesCache) return categoriesCache;

    const response = await fetch(`${MainSetup.serverUrl}cost-invoices/categories`, {
        method: "GET",
        credentials: "include",
    });

    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd pobierania kategorii");
    }

    const result = await response.json();
    categoriesCache = deduplicateCategories(result.data || []);
    return categoriesCache!;
}

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
 * Aktualizuje ustawienia księgowania faktury
 */
export async function updateCostInvoice(
    id: number,
    data: Partial<{
        status: CostInvoiceStatus;
        paymentStatus: PaymentStatus;
        paidAmount: number;
        bookingPercentage: number;
        vatDeductionPercentage: number;
        categoryId: number | null;
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
 * Aktualizuje pozycję faktury
 */
export async function updateCostInvoiceItem(
    invoiceId: number,
    itemId: number,
    data: Partial<{
        isSelectedForBooking: boolean;
        bookingPercentage: number;
        vatDeductionPercentage: number;
        categoryId: number | null;
    }>
): Promise<void> {
    const response = await fetch(`${MainSetup.serverUrl}cost-invoices/${invoiceId}/items/${itemId}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd aktualizacji pozycji");
    }
}

/**
 * Księguje fakturę
 */
export async function bookCostInvoice(id: number): Promise<CostInvoice> {
    const response = await fetch(`${MainSetup.serverUrl}cost-invoices/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            status: CostInvoiceStatuses.BOOKED,
        }),
    });

    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd księgowania faktury");
    }

    const result = await response.json();
    return result.data || result;
}

/**
 * Pobiera raport miesięczny
 */
export async function fetchMonthlyReport(
    year: number,
    month: number,
    format: "json" | "csv" | "xml" = "json"
): Promise<CostInvoiceMonthlyReport | Blob> {
    const response = await fetch(
        `${MainSetup.serverUrl}cost-invoices/report/monthly?year=${year}&month=${month}&format=${format}`,
        {
            method: "GET",
            credentials: "include",
        }
    );

    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd pobierania raportu");
    }

    if (format === "json") {
        const result = await response.json();
        return result.data as CostInvoiceMonthlyReport;
    } else {
        return response.blob();
    }
}

/**
 * Eksportuje raport miesięczny jako plik
 */
export async function downloadMonthlyReport(
    year: number,
    month: number,
    format: "csv" | "xml"
): Promise<void> {
    const blob = await fetchMonthlyReport(year, month, format) as Blob;
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `koszty_${year}_${String(month).padStart(2, "0")}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
