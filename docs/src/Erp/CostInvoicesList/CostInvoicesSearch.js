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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const CostInvoicesFilterBody_1 = require("./CostInvoicesFilterBody");
const CostInvoicesController_1 = require("./CostInvoicesController");
const Tools_1 = __importDefault(require("../../React/Tools/Tools"));
const CostInvoicesBadges_1 = require("./CostInvoicesBadges");
const FilterableTableContext_1 = require("../../View/Resultsets/FilterableTable/FilterableTableContext");
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
    function renderSupplierInfo(invoice) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "fw-bold" }, invoice.supplierName),
            react_1.default.createElement("div", { className: "text-muted small" },
                "NIP: ",
                invoice.supplierNip)));
    }
    function renderValues(invoice) {
        const grossAmount = toNumber(invoice.grossAmount);
        const netAmount = toNumber(invoice.netAmount);
        const bookableNetAmount = invoice.bookableNetAmount !== undefined
            ? toNumber(invoice.bookableNetAmount)
            : undefined;
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "text-end fw-bold" },
                Tools_1.default.formatNumber(grossAmount),
                " z\u0142"),
            react_1.default.createElement("div", { className: "text-end text-muted small" },
                "netto: ",
                Tools_1.default.formatNumber(netAmount),
                " z\u0142"),
            bookableNetAmount !== undefined && bookableNetAmount !== netAmount && (react_1.default.createElement("div", { className: "text-end text-info small" },
                "do ksi\u0119g.: ",
                Tools_1.default.formatNumber(bookableNetAmount),
                " z\u0142"))));
    }
    function renderBookingInfo(invoice) {
        const invoiceWithCategory = invoice;
        const category = invoice.category || invoiceWithCategory._category || null;
        const vatDeductionPercentage = toNumber(invoice.vatDeductionPercentage);
        return (react_1.default.createElement("div", { className: "d-flex flex-column gap-1" },
            react_1.default.createElement(CostInvoicesBadges_1.CategoryBadge, { category: category }),
            react_1.default.createElement(CostInvoicesBadges_1.VatDeductionBadge, { percentage: vatDeductionPercentage })));
    }
    function renderKsefNumber(invoice) {
        return (react_1.default.createElement("div", { className: "small" },
            react_1.default.createElement("code", { className: "text-break", style: { fontSize: "0.75em" } }, invoice.ksefNumber)));
    }
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
    // Przycisk synchronizacji KSeF jako dodatkowy przycisk w nagłówku
    const SyncKsefButton = () => (react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-primary", size: "sm", onClick: () => setShowSyncModal(true), disabled: isSyncing, className: "me-2" }, isSyncing ? (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-1" }),
        "Synchronizacja...")) : ("🔄 Pobierz z KSeF")));
    return (react_1.default.createElement(react_1.default.Fragment, null,
        syncError && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => setSyncError(null), dismissible: true, className: "mx-3 mt-3" }, syncError)),
        syncSuccess && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "success", onClose: () => setSyncSuccess(null), dismissible: true, className: "mx-3 mt-3" }, syncSuccess)),
        statusError && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => setStatusError(null), dismissible: true, className: "mx-3 mt-3" }, statusError)),
        react_1.default.createElement(FilterableTable_1.default, { id: "costInvoices", title: title, FilterBodyComponent: CostInvoicesFilterBody_1.CostInvoicesFilterBody, tableStructure: [
                { header: "Nr faktury", objectAttributeToShow: "invoiceNumber", colMd: 1 },
                { header: "Dostawca", renderTdBody: renderSupplierInfo, colMd: 3 },
                { header: "Data wyst.", objectAttributeToShow: "issueDate", colMd: 1 },
                { header: "Termin płat.", objectAttributeToShow: "dueDate", colMd: 1 },
                { header: "Wartość", renderTdBody: renderValues, colMd: 1 },
                { header: "Księgowanie", renderTdBody: renderBookingInfo, colMd: 2 },
                {
                    header: "Status",
                    renderTdBody: (invoice) => react_1.default.createElement(CostInvoiceStatusCell, { invoice: invoice }),
                    colMd: 1,
                },
                { header: "Nr KSeF", renderTdBody: renderKsefNumber, colMd: 1 },
            ], AddNewButtonComponents: [SyncKsefButton], isDeletable: false, isCopyable: false, repository: CostInvoicesController_1.costInvoicesRepository, selectedObjectRoute: "/cost-invoice/" }),
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
exports.default = CostInvoicesSearch;
