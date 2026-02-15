"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.costInvoicesRepository = exports.CostInvoiceStatuses = void 0;
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
/**
 * Statusy faktur kosztowych
 */
exports.CostInvoiceStatuses = {
    NEW: "NEW",
    EXCLUDED: "EXCLUDED",
    BOOKED: "BOOKED",
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
        throw new Error("Błąd pobierania kategorii");
    }
    const result = await response.json();
    categoriesCache = result.data;
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
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `Błąd synchronizacji (${response.status})`);
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
        throw new Error("Błąd pobierania szczegółów faktury");
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
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Błąd aktualizacji faktury");
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
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Błąd aktualizacji pozycji");
    }
}
/**
 * Księguje fakturę
 */
async function bookCostInvoice(id) {
    const response = await fetch(`${MainSetupReact_1.default.serverUrl}cost-invoices/${id}/book`, {
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
async function fetchMonthlyReport(year, month, format = "json") {
    const response = await fetch(`${MainSetupReact_1.default.serverUrl}cost-invoices/report/monthly?year=${year}&month=${month}&format=${format}`, {
        method: "GET",
        credentials: "include",
    });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || "Błąd pobierania raportu");
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
