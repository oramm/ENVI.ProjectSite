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
const MainSetupReact_1 = __importDefault(require("../../React/MainSetupReact"));
const CostInvoiceModalButtons_1 = require("./Modals/CostInvoiceModalButtons");
const CostInvoicesBadges_1 = require("./CostInvoicesBadges");
function CostInvoicesSearch({ title }) {
    const [isSyncing, setIsSyncing] = (0, react_1.useState)(false);
    const [syncError, setSyncError] = (0, react_1.useState)(null);
    const [syncSuccess, setSyncSuccess] = (0, react_1.useState)(null);
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    /**
     * Synchronizacja faktur z KSeF
     * Pobiera nowe faktury zakupowe z KSeF i zapisuje je w bazie danych
     */
    const syncFromKsef = (0, react_1.useCallback)(async () => {
        setIsSyncing(true);
        setSyncError(null);
        setSyncSuccess(null);
        try {
            const response = await fetch(`${MainSetupReact_1.default.serverUrl}costInvoices/ksef/sync`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || `Błąd synchronizacji (${response.status})`);
            }
            const result = await response.json();
            setSyncSuccess(`Zsynchronizowano ${result.newInvoicesCount || 0} nowych faktur z KSeF`);
            // Odśwież listę faktur
            await CostInvoicesController_1.costInvoicesRepository.loadItemsFromServerPOST([]);
        }
        catch (error) {
            setSyncError(error instanceof Error ? error.message : "Błąd synchronizacji z KSeF");
        }
        finally {
            setIsSyncing(false);
        }
    }, []);
    function renderSellerInfo(invoice) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "fw-bold" }, invoice.sellerName),
            react_1.default.createElement("div", { className: "text-muted small" },
                "NIP: ",
                invoice.sellerNip),
            invoice.description && react_1.default.createElement("div", { className: "text-muted small" }, invoice.description)));
    }
    function renderValues(invoice) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            invoice.grossValue && (react_1.default.createElement("div", { className: "text-end fw-bold" },
                Tools_1.default.formatNumber(invoice.grossValue),
                " z\u0142")),
            invoice.netValue && (react_1.default.createElement("div", { className: "text-end text-muted small" },
                "netto: ",
                Tools_1.default.formatNumber(invoice.netValue),
                " z\u0142"))));
    }
    function renderFlags(invoice) {
        return (react_1.default.createElement("div", { className: "d-flex flex-column gap-1" },
            react_1.default.createElement(CostInvoicesBadges_1.CompanyCostBadge, { isCompanyCost: invoice.isCompanyCost }),
            react_1.default.createElement(CostInvoicesBadges_1.PaidStatusBadge, { isPaid: invoice.isPaid })));
    }
    function renderKsefNumber(invoice) {
        return (react_1.default.createElement("div", { className: "small" },
            react_1.default.createElement("code", { className: "text-break", style: { fontSize: "0.75em" } }, invoice.ksefNumber)));
    }
    // Przycisk synchronizacji KSeF jako dodatkowy przycisk w nagłówku
    const SyncKsefButton = () => (react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-primary", size: "sm", onClick: syncFromKsef, disabled: isSyncing, className: "me-2" }, isSyncing ? (react_1.default.createElement(react_1.default.Fragment, null,
        react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-1" }),
        "Synchronizacja...")) : ("🔄 Pobierz z KSeF")));
    return (react_1.default.createElement(react_1.default.Fragment, null,
        syncError && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => setSyncError(null), dismissible: true, className: "mx-3 mt-3" }, syncError)),
        syncSuccess && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "success", onClose: () => setSyncSuccess(null), dismissible: true, className: "mx-3 mt-3" }, syncSuccess)),
        react_1.default.createElement(FilterableTable_1.default, { id: "costInvoices", title: title, FilterBodyComponent: CostInvoicesFilterBody_1.CostInvoicesFilterBody, tableStructure: [
                { header: "Numer", objectAttributeToShow: "number", colMd: 1 },
                { header: "Kontrahent", renderTdBody: renderSellerInfo, colMd: 3 },
                { header: "Data", objectAttributeToShow: "issueDate", colMd: 1 },
                { header: "Termin płatności", objectAttributeToShow: "paymentDeadline", colMd: 1 },
                { header: "Wartość brutto", renderTdBody: renderValues, colMd: 1 },
                { header: "Kategoria", objectAttributeToShow: "costCategory", colMd: 1 },
                {
                    header: "Status",
                    renderTdBody: (invoice) => (react_1.default.createElement(CostInvoicesBadges_1.CostInvoiceStatusBadge, { status: invoice.status })),
                    colMd: 1,
                },
                { header: "Flagi", renderTdBody: renderFlags, colMd: 1 },
                { header: "Nr KSeF", renderTdBody: renderKsefNumber, colMd: 1 },
            ], AddNewButtonComponents: [SyncKsefButton], EditButtonComponent: CostInvoiceModalButtons_1.CostInvoiceEditModalButton, isDeletable: false, isCopyable: false, repository: CostInvoicesController_1.costInvoicesRepository })));
}
exports.default = CostInvoicesSearch;
