import {
    CostInvoice,
    CostInvoiceCategory,
    CostInvoiceMonthlyReport,
    CostInvoiceSyncResponse,
} from "../../../Typings/bussinesTypes";
import MainSetup from "../../React/MainSetupReact";
import RepositoryReact from "../../React/RepositoryReact";

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
        throw new Error("Błąd pobierania kategorii");
    }

    const result = await response.json();
    categoriesCache = result.data;
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
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `Błąd synchronizacji (${response.status})`);
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
        throw new Error("Błąd pobierania szczegółów faktury");
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
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Błąd aktualizacji faktury");
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
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Błąd aktualizacji pozycji");
    }
}

/**
 * Księguje fakturę
 */
export async function bookCostInvoice(id: number): Promise<CostInvoice> {
    const response = await fetch(`${MainSetup.serverUrl}cost-invoices/${id}/book`, {
        method: "POST",
        credentials: "include",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Błąd księgowania faktury");
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
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Błąd pobierania raportu");
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
