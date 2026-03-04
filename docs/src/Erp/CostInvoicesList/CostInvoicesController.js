"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.costInvoicesRepository = exports.PaymentStatuses = exports.CostInvoiceStatuses = exports.CostInvoiceApiError = void 0;
exports.fetchCategories = fetchCategories;
exports.syncFromKsef = syncFromKsef;
exports.fetchCostInvoiceDetails = fetchCostInvoiceDetails;
exports.updateCostInvoice = updateCostInvoice;
exports.updateCostInvoiceItem = updateCostInvoiceItem;
exports.bookCostInvoice = bookCostInvoice;
exports.fetchMonthlyReport = fetchMonthlyReport;
exports.downloadMonthlyReport = downloadMonthlyReport;
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const RepositoryReact_1 = __importDefault(require("../../React/RepositoryReact"));
class CostInvoiceApiError extends Error {
    constructor(message, options) {
        super(message);
        this.name = "CostInvoiceApiError";
        this.status = options?.status;
        this.details = options?.details || [];
        this.payload = options?.payload;
    }
}
exports.CostInvoiceApiError = CostInvoiceApiError;
const toDetailList = (value) => {
    if (!value)
        return [];
    if (Array.isArray(value)) {
        return value
            .map((entry) => (typeof entry === "string" ? entry : JSON.stringify(entry)))
            .filter((entry) => typeof entry === "string" && entry.trim().length > 0);
    }
    if (typeof value === "object") {
        return Object.entries(value).flatMap(([key, detailsValue]) => {
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
async function throwCostInvoiceApiError(response, fallbackMessage) {
    let payload;
    try {
        payload = (await response.json());
    }
    catch {
        payload = undefined;
    }
    const message = payload?.error ||
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
exports.CostInvoiceStatuses = {
    NEW: "NEW",
    EXCLUDED: "EXCLUDED",
    BOOKED: "BOOKED",
};
/**
 * Statusy płatności faktur kosztowych
 */
exports.PaymentStatuses = {
    UNPAID: "UNPAID",
    PARTIALLY_PAID: "PARTIALLY_PAID",
    PAID: "PAID",
};
/**
 * Repozytorium faktur kosztowych
 * Dane pobierane z KSeF i przechowywane lokalnie
 */
exports.costInvoicesRepository = new RepositoryReact_1.default({
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
let categoriesCache = null;
function normalizeCategoryName(name) {
    return name.trim().toLocaleLowerCase("pl-PL");
}
function getCategoryDedupKey(category) {
    return `${normalizeCategoryName(category.name)}|${category.vatDeductionDefault}`;
}
function deduplicateCategories(categories) {
    const seen = new Map();
    const duplicates = new Map();
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
async function fetchCategories() {
    if (categoriesCache)
        return categoriesCache;
    const response = await fetch(`${MainSetupReact_1.default.serverUrl}cost-invoices/categories`, {
        method: "GET",
        credentials: "include",
    });
    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd pobierania kategorii");
    }
    const result = await response.json();
    categoriesCache = deduplicateCategories(result.data || []);
    return categoriesCache;
}
/**
 * Synchronizacja faktur z KSeF
 */
async function syncFromKsef(params) {
    const response = await fetch(`${MainSetupReact_1.default.serverUrl}cost-invoices/sync`, {
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
async function fetchCostInvoiceDetails(id) {
    const response = await fetch(`${MainSetupReact_1.default.serverUrl}cost-invoices/${id}`, {
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
 * Aktualizuje ustawienia księgowania faktury
 */
async function updateCostInvoice(id, data) {
    const response = await fetch(`${MainSetupReact_1.default.serverUrl}cost-invoices/${id}`, {
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
async function updateCostInvoiceItem(invoiceId, itemId, data) {
    const response = await fetch(`${MainSetupReact_1.default.serverUrl}cost-invoices/${invoiceId}/items/${itemId}`, {
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
async function bookCostInvoice(id) {
    const response = await fetch(`${MainSetupReact_1.default.serverUrl}cost-invoices/${id}`, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            status: exports.CostInvoiceStatuses.BOOKED,
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
async function fetchMonthlyReport(year, month, format = "json") {
    const response = await fetch(`${MainSetupReact_1.default.serverUrl}cost-invoices/report/monthly?year=${year}&month=${month}&format=${format}`, {
        method: "GET",
        credentials: "include",
    });
    if (!response.ok) {
        await throwCostInvoiceApiError(response, "Błąd pobierania raportu");
    }
    if (format === "json") {
        const result = await response.json();
        return result.data;
    }
    else {
        return response.blob();
    }
}
/**
 * Eksportuje raport miesięczny jako plik
 */
async function downloadMonthlyReport(year, month, format) {
    const blob = await fetchMonthlyReport(year, month, format);
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `koszty_${year}_${String(month).padStart(2, "0")}.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}
