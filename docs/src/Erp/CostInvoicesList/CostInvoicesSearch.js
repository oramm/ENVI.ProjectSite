"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CostInvoicesSearch;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const CostInvoicesFilterBody_1 = require("./CostInvoicesFilterBody");
const CostInvoicesController_1 = require("./CostInvoicesController");
const Tools_1 = __importDefault(require("../../React/Tools/Tools"));
const ToolsDate_1 = __importDefault(require("../../React/Tools/ToolsDate"));
const CostInvoicesBadges_1 = require("./CostInvoicesBadges");
const FilterableTableContext_1 = require("../../View/Resultsets/FilterableTable/FilterableTableContext");
require("./CostInvoicesSearch.css");
function CostInvoicesSearch({ title }) {
    const [isSyncing, setIsSyncing] = (0, react_1.useState)(false);
    const [syncError, setSyncError] = (0, react_1.useState)(null);
    const [syncSuccess, setSyncSuccess] = (0, react_1.useState)(null);
    const [statusError, setStatusError] = (0, react_1.useState)(null);
    const [showSyncModal, setShowSyncModal] = (0, react_1.useState)(false);
    const [syncType, setSyncType] = (0, react_1.useState)("INCREMENTAL");
    const [dateFrom, setDateFrom] = (0, react_1.useState)("");
    const [dateTo, setDateTo] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    const toNumber = (value) => {
        if (typeof value === "number")
            return value;
        if (typeof value === "string") {
            const parsed = Number(value.replace(",", "."));
            return Number.isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };
    const formatDate = (value) => {
        if (!value)
            return "-";
        return ToolsDate_1.default.dateYMDtoDMY(value);
    };
    const formatAmount = (value, currency) => `${Tools_1.default.formatNumber(toNumber(value))} ${currency || "PLN"}`;
    /**
     * Synchronizacja faktur z KSeF
     */
    const handleSync = (0, react_1.useCallback)(async () => {
        setIsSyncing(true);
        setSyncError(null);
        setSyncSuccess(null);
        setShowSyncModal(false);
        try {
            const params = {
                syncType,
            };
            if (syncType === "VERIFICATION") {
                if (!dateFrom || !dateTo) {
                    throw new Error("Dla weryfikacji wymagane są daty od i do");
                }
                params.dateFrom = dateFrom;
                params.dateTo = dateTo;
            }
            const result = await (0, CostInvoicesController_1.syncFromKsef)(params);
            setSyncSuccess(result.message || `Zaimportowano ${result.data.imported} faktur, pominięto ${result.data.skipped}`);
            // Odśwież listę faktur
            await CostInvoicesController_1.costInvoicesRepository.loadItemsFromServerPOST([]);
        }
        catch (error) {
            setSyncError(error instanceof Error ? error.message : "Błąd synchronizacji z KSeF");
        }
        finally {
            setIsSyncing(false);
        }
    }, [syncType, dateFrom, dateTo]);
    function CostInvoiceStatusCell({ invoice }) {
        const { repository, setObjects } = (0, FilterableTableContext_1.useFilterableTableContext)();
        const [isUpdating, setIsUpdating] = (0, react_1.useState)(false);
        const handleStatusChange = async (status) => {
            if (status === invoice.status)
                return;
            setIsUpdating(true);
            setStatusError(null);
            try {
                const updated = await (0, CostInvoicesController_1.updateCostInvoice)(invoice.id, { status });
                repository.replaceItemById(invoice.id, updated);
                repository.saveToSessionStorage();
                setObjects([...repository.items]);
            }
            catch (error) {
                setStatusError(error instanceof Error ? error.message : "Błąd zmiany statusu");
            }
            finally {
                setIsUpdating(false);
            }
        };
        if (invoice.status !== CostInvoicesController_1.CostInvoiceStatuses.NEW) {
            return react_1.default.createElement(CostInvoicesBadges_1.CostInvoiceStatusBadge, { status: invoice.status });
        }
        return (react_1.default.createElement("div", { onClick: (e) => e.stopPropagation() },
            react_1.default.createElement(react_bootstrap_1.Form.Select, { size: "sm", value: invoice.status, disabled: isUpdating, onChange: (e) => handleStatusChange(e.target.value), onClick: (e) => e.stopPropagation() },
                react_1.default.createElement("option", { value: CostInvoicesController_1.CostInvoiceStatuses.NEW }, "Nowa"),
                react_1.default.createElement("option", { value: CostInvoicesController_1.CostInvoiceStatuses.EXCLUDED }, "Poza kosztami"),
                react_1.default.createElement("option", { value: CostInvoicesController_1.CostInvoiceStatuses.BOOKED }, "Zaksi\u0119gowana"))));
    }
    function renderInvoiceCard(invoice, isActive) {
        void isActive;
        const category = invoice._category || null;
        const vatDeductionPercentage = toNumber(invoice.vatDeductionPercentage);
        const bookingPercentage = toNumber(invoice.bookingPercentage);
        const netAmount = toNumber(invoice.netAmount);
        const bookableNetAmount = invoice.bookableNetAmount !== undefined ? toNumber(invoice.bookableNetAmount) : null;
        const notes = invoice.notes?.trim();
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "cost-invoice-card__header" },
                react_1.default.createElement("div", null,
                    react_1.default.createElement("div", { className: "cost-invoice-card__number" }, invoice.invoiceNumber || "-"),
                    react_1.default.createElement("div", { className: "cost-invoice-card__supplier" }, invoice.supplierName || "Brak dostawcy"),
                    react_1.default.createElement("div", { className: "cost-invoice-card__meta" },
                        "NIP: ",
                        invoice.supplierNip || "-",
                        invoice.supplierAddress ? ` | ${invoice.supplierAddress}` : "")),
                react_1.default.createElement("div", { className: "cost-invoice-card__status-wrap" },
                    react_1.default.createElement(CostInvoiceStatusCell, { invoice: invoice }),
                    react_1.default.createElement(CostInvoicesBadges_1.PaymentStatusBadge, { status: invoice.paymentStatus, paidAmount: invoice.paidAmount, grossAmount: toNumber(invoice.grossAmount) }))),
            react_1.default.createElement("div", { className: "cost-invoice-card__body" },
                react_1.default.createElement("div", { className: "cost-invoice-card__dates" },
                    react_1.default.createElement("div", { className: "cost-invoice-card__date-item" },
                        react_1.default.createElement("div", { className: "cost-invoice-card__label" }, "Data wyst."),
                        react_1.default.createElement("div", { className: "cost-invoice-card__value" }, formatDate(invoice.issueDate))),
                    react_1.default.createElement("div", { className: "cost-invoice-card__date-item" },
                        react_1.default.createElement("div", { className: "cost-invoice-card__label" }, "Data sprzed."),
                        react_1.default.createElement("div", { className: "cost-invoice-card__value" }, formatDate(invoice.saleDate))),
                    react_1.default.createElement("div", { className: "cost-invoice-card__date-item" },
                        react_1.default.createElement("div", { className: "cost-invoice-card__label" }, "Termin plat."),
                        react_1.default.createElement("div", { className: "cost-invoice-card__value" }, formatDate(invoice.dueDate)))),
                react_1.default.createElement("div", { className: "cost-invoice-card__amounts" },
                    react_1.default.createElement("div", { className: "cost-invoice-card__gross" }, formatAmount(invoice.grossAmount, invoice.currency)),
                    react_1.default.createElement("div", { className: "cost-invoice-card__amount-detail" },
                        "Netto: ",
                        formatAmount(invoice.netAmount, invoice.currency)),
                    react_1.default.createElement("div", { className: "cost-invoice-card__amount-detail" },
                        "VAT: ",
                        formatAmount(invoice.vatAmount, invoice.currency)),
                    bookableNetAmount !== null && bookableNetAmount !== netAmount && (react_1.default.createElement("div", { className: "cost-invoice-card__amount-detail cost-invoice-card__amount-detail--info" },
                        "Do ksieg.: ",
                        formatAmount(bookableNetAmount, invoice.currency))))),
            react_1.default.createElement("div", { className: "cost-invoice-card__bottom" },
                react_1.default.createElement("div", { className: "cost-invoice-card__tags" },
                    react_1.default.createElement(CostInvoicesBadges_1.CategoryBadge, { category: category }),
                    react_1.default.createElement(CostInvoicesBadges_1.VatDeductionBadge, { percentage: vatDeductionPercentage }),
                    react_1.default.createElement("span", { className: "badge bg-info-subtle text-info-emphasis border border-info-subtle" },
                        "Ksiegowanie ",
                        bookingPercentage,
                        "%"),
                    invoice.status === CostInvoicesController_1.CostInvoiceStatuses.BOOKED && invoice.bookedAt && (react_1.default.createElement("span", { className: "badge bg-success-subtle text-success-emphasis border border-success-subtle" },
                        "Zaksiegowano ",
                        ToolsDate_1.default.dateToDDmmmYYYYHHMM(invoice.bookedAt),
                        invoice._bookedByPerson
                            ? ` (${invoice._bookedByPerson.name} ${invoice._bookedByPerson.surname})`
                            : "")),
                    notes && (react_1.default.createElement("span", { className: "badge bg-secondary-subtle text-secondary-emphasis" },
                        "Notatka: ",
                        notes))),
                react_1.default.createElement("div", { className: "cost-invoice-card__footer" },
                    react_1.default.createElement("span", { className: "cost-invoice-card__label" }, "KSeF:"),
                    react_1.default.createElement("code", { className: "cost-invoice-card__ksef" }, invoice.ksefNumber || "-")))));
    }
    // Przycisk synchronizacji KSeF jako dodatkowy przycisk w nagłówku
    const SyncKsefButton = () => (react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-primary", size: "sm", onClick: () => setShowSyncModal(true), disabled: isSyncing, className: "me-2" }, isSyncing ? (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-1" }),
        "Synchronizacja...")) : ("Pobierz z KSeF")));
    return (react_1.default.createElement(react_1.default.Fragment, null,
        syncError && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => setSyncError(null), dismissible: true, className: "mx-3 mt-3" }, syncError)),
        syncSuccess && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "success", onClose: () => setSyncSuccess(null), dismissible: true, className: "mx-3 mt-3" }, syncSuccess)),
        statusError && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => setStatusError(null), dismissible: true, className: "mx-3 mt-3" }, statusError)),
        react_1.default.createElement("div", { className: "cost-invoices-search" },
            react_1.default.createElement(FilterableTable_1.default, { id: "costInvoices", title: title, FilterBodyComponent: CostInvoicesFilterBody_1.CostInvoicesFilterBody, tableStructure: [
                    { header: undefined, renderTdBody: renderInvoiceCard },
                ], AddNewButtonComponents: [SyncKsefButton], isDeletable: false, isCopyable: false, repository: CostInvoicesController_1.costInvoicesRepository, selectedObjectRoute: "/cost-invoice/" })),
        react_1.default.createElement(react_bootstrap_1.Modal, { show: showSyncModal, onHide: () => setShowSyncModal(false) },
            react_1.default.createElement(react_bootstrap_1.Modal.Header, { closeButton: true },
                react_1.default.createElement(react_bootstrap_1.Modal.Title, null, "Synchronizacja z KSeF")),
            react_1.default.createElement(react_bootstrap_1.Modal.Body, null,
                react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Typ synchronizacji"),
                    react_1.default.createElement(react_bootstrap_1.Form.Select, { value: syncType, onChange: (e) => setSyncType(e.target.value) },
                        react_1.default.createElement("option", { value: "INCREMENTAL" }, "Przyrostowa (od ostatniej synchronizacji)"),
                        react_1.default.createElement("option", { value: "VERIFICATION" }, "Weryfikacyjna (zakres dat)")),
                    react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" }, syncType === "INCREMENTAL"
                        ? "Pobiera nowe faktury od ostatniej synchronizacji"
                        : "Pobiera faktury z podanego zakresu dat (do weryfikacji kompletności)")),
                syncType === "VERIFICATION" && (react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data od"),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", value: dateFrom, onChange: (e) => setDateFrom(e.target.value), required: true }))),
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Data do"),
                            react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "date", value: dateTo, onChange: (e) => setDateTo(e.target.value), required: true })))))),
            react_1.default.createElement(react_bootstrap_1.Modal.Footer, null,
                react_1.default.createElement(react_bootstrap_1.Button, { variant: "secondary", onClick: () => setShowSyncModal(false) }, "Anuluj"),
                react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleSync, disabled: syncType === "VERIFICATION" && (!dateFrom || !dateTo) }, "Synchronizuj")))));
}
