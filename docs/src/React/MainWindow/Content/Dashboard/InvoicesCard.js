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
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
const MainWindowController_1 = require("../../MainWindowController");
const ToolsDate_1 = __importDefault(require("../../../Tools/ToolsDate"));
const Tools_1 = __importDefault(require("../../../Tools/Tools"));
const invoiceStatusIcons = {
    "Na później": "⏳",
    "Do zrobienia": "📝",
    Zrobiona: "✅",
    Wysłana: "📤",
    Zapłacona: "💸",
    "Do korekty": "✏️",
    Wycofana: "🚫",
};
function InvoicesCard({ className }) {
    const [expandedStatus, setExpandedStatus] = (0, react_1.useState)({});
    const [dataLoaded, setDataLoaded] = (0, react_1.useState)(false);
    const [data, setData] = (0, react_1.useState)(undefined);
    const INITIAL_VISIBLE = 0;
    // Przykład zakresu dat – podmień na logikę pod projekt!
    const issueDateFrom = ToolsDate_1.default.addDays(new Date(), -60).toISOString().slice(0, 10);
    const issueDateTo = ToolsDate_1.default.addDays(new Date(), 30).toISOString().slice(0, 10);
    (0, react_1.useEffect)(() => {
        async function fetchData() {
            setDataLoaded(false);
            const invoices = (await MainWindowController_1.invoicesRepository.loadItemsFromServerPOST([
                {
                    statuses: Object.values(MainSetupReact_1.default.InvoiceStatuses),
                    issueDateFrom,
                    issueDateTo,
                },
            ]));
            setData(invoices);
            setDataLoaded(true);
        }
        fetchData();
    }, []);
    function renderInvoiceStatusSection(params) {
        const { sectionData, status, expanded, onToggle } = params;
        const visibleData = expanded ? sectionData : sectionData.slice(0, INITIAL_VISIBLE);
        const totalValue = Tools_1.default.formatNumber(getTotalValue(sectionData)) + " zł";
        return (react_1.default.createElement(react_bootstrap_1.ListGroup.Item, { key: status, className: "p-0 border-0" },
            react_1.default.createElement("div", { className: "d-flex align-items-center list-group-item-action", style: { cursor: "pointer" }, onClick: onToggle },
                react_1.default.createElement("span", { className: "d-flex align-items-center flex-grow-1" },
                    react_1.default.createElement("span", { style: { fontSize: 14, width: 14 } }, invoiceStatusIcons[status] || "📄"),
                    react_1.default.createElement("span", { className: "ms-2 fw-semibold" }, status)),
                react_1.default.createElement("span", { className: "d-flex align-items-center" },
                    react_1.default.createElement(react_bootstrap_1.Badge, { bg: "light", text: "dark" }, sectionData.length),
                    react_1.default.createElement("span", { className: "text-secondary small ms-2", style: { fontSize: "0.9em" } }, expanded ? "▼" : "▸"))),
            react_1.default.createElement("div", { className: "ps-4" },
                react_1.default.createElement("span", { className: "small text-secondary" },
                    "\u0141\u0105cznie: ",
                    totalValue)),
            react_1.default.createElement("ul", { className: "ps-4 mt-2 mb-2", style: { listStyleType: "none" } }, visibleData.map((invoice) => renderListItem(invoice)))));
    }
    function renderListItem(invoice) {
        return (react_1.default.createElement("li", { key: invoice.id, className: "mb-2 d-flex align-items-center" },
            react_1.default.createElement("span", { className: "text-secondary small flex-grow-1" },
                react_1.default.createElement("span", { className: "fw-semibold" }, invoice._contract.ourId),
                ", ",
                invoice.number || invoice._contract._city?.name),
            react_1.default.createElement("span", { className: "text-secondary small text-end ms-2", style: { minWidth: 70 } },
                react_1.default.createElement("span", { className: "fw-light" },
                    Tools_1.default.formatNumber(invoice._totalNetValue || 0),
                    " z\u0142"))));
    }
    function renderCardTitle() {
        return (react_1.default.createElement("div", { className: "d-flex justify-content-between align-items-center" },
            react_1.default.createElement(react_bootstrap_1.Card.Title, { className: "mb-0" }, "Faktury"),
            react_1.default.createElement("span", { style: { fontSize: "0.85em" }, className: "text-secondary" },
                ToolsDate_1.default.dateToDdMmm(issueDateFrom),
                " - ",
                ToolsDate_1.default.dateToDdMmm(issueDateTo))));
    }
    function getTotalValue(invoices = []) {
        return invoices.reduce((acc, inv) => {
            // Zamieni wszystko (number, undefined, string) na string, więc replace zawsze istnieje
            const raw = inv._totalNetValue;
            const num = parseFloat(String(raw).replace(",", "."));
            return acc + (isNaN(num) ? 0 : num);
        }, 0);
    }
    function handleToggle(status) {
        setExpandedStatus((prev) => ({
            ...prev,
            [status]: !prev[status],
        }));
    }
    if (!dataLoaded) {
        return (react_1.default.createElement(react_bootstrap_1.Card, { className: className },
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Card.Title, null, "Faktury"),
                react_1.default.createElement("div", { className: "text-center" },
                    react_1.default.createElement("span", { className: "spinner-border spinner-border-sm", role: "status", "aria-hidden": "true" })))));
    }
    if (!data || data.length === 0) {
        return (react_1.default.createElement(react_bootstrap_1.Card, { className: className },
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Card.Title, null, "Faktury"),
                react_1.default.createElement("div", { className: "text-center" },
                    react_1.default.createElement("span", { className: "text-secondary" }, "Brak faktur do wy\u015Bwietlenia")))));
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, { className: className },
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            renderCardTitle(),
            react_1.default.createElement(react_bootstrap_1.ListGroup, { variant: "flush", className: "mt-3" }, Object.values(MainSetupReact_1.default.InvoiceStatuses).map((status) => {
                const invoicesInStatus = data.filter((inv) => inv.status === status);
                if (invoicesInStatus.length === 0)
                    return null;
                return renderInvoiceStatusSection({
                    sectionData: invoicesInStatus,
                    status,
                    expanded: expandedStatus[status] || false,
                    onToggle: () => handleToggle(status),
                });
            })))));
}
exports.default = InvoicesCard;
