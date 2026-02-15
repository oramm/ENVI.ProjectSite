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
exports.default = CostInvoicesReport;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const CostInvoicesController_1 = require("./CostInvoicesController");
const CostInvoicesBadges_1 = require("./CostInvoicesBadges");
const Tools_1 = __importDefault(require("../../React/Tools/Tools"));
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const MONTHS = [
    "Styczeń",
    "Luty",
    "Marzec",
    "Kwiecień",
    "Maj",
    "Czerwiec",
    "Lipiec",
    "Sierpień",
    "Wrzesień",
    "Październik",
    "Listopad",
    "Grudzień",
];
function CostInvoicesReport() {
    const currentDate = new Date();
    const [year, setYear] = (0, react_1.useState)(currentDate.getFullYear());
    const [month, setMonth] = (0, react_1.useState)(currentDate.getMonth() + 1);
    const [report, setReport] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [exporting, setExporting] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const toNumber = (value) => {
        if (typeof value === "number")
            return value;
        if (typeof value === "string") {
            const parsed = Number(value.replace(",", "."));
            return Number.isNaN(parsed) ? 0 : parsed;
        }
        return 0;
    };
    const getInvoiceCategory = (invoice) => {
        const invoiceWithCategory = invoice;
        return invoice.category || invoiceWithCategory._category || null;
    };
    (0, react_1.useEffect)(() => {
        document.title = "Raport miesięczny faktur kosztowych";
    }, []);
    const loadReport = (0, react_1.useCallback)(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = (await (0, CostInvoicesController_1.fetchMonthlyReport)(year, month, "json"));
            setReport(data);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Błąd ładowania raportu");
        }
        finally {
            setLoading(false);
        }
    }, [year, month]);
    (0, react_1.useEffect)(() => {
        loadReport();
    }, [loadReport]);
    const handleExport = async (format) => {
        setExporting(true);
        try {
            await (0, CostInvoicesController_1.downloadMonthlyReport)(year, month, format);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : `Błąd eksportu ${format.toUpperCase()}`);
        }
        finally {
            setExporting(false);
        }
    };
    // Generuj listę lat (od 2024 do bieżącego + 1)
    const years = [];
    for (let y = 2024; y <= currentDate.getFullYear() + 1; y++) {
        years.push(y);
    }
    return (react_1.default.createElement(react_bootstrap_1.Container, { fluid: true, className: "py-3" },
        react_1.default.createElement("h3", { className: "mb-4" }, "\uD83D\uDCCA Raport miesi\u0119czny faktur kosztowych"),
        error && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => setError(null), dismissible: true }, error)),
        react_1.default.createElement(react_bootstrap_1.Card, { className: "mb-4" },
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Row, { className: "align-items-end" },
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 2 },
                        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Rok"),
                            react_1.default.createElement(react_bootstrap_1.Form.Select, { value: year, onChange: (e) => setYear(Number(e.target.value)) }, years.map((y) => (react_1.default.createElement("option", { key: y, value: y }, y)))))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                        react_1.default.createElement(react_bootstrap_1.Form.Group, null,
                            react_1.default.createElement(react_bootstrap_1.Form.Label, null, "Miesi\u0105c"),
                            react_1.default.createElement(react_bootstrap_1.Form.Select, { value: month, onChange: (e) => setMonth(Number(e.target.value)) }, MONTHS.map((name, idx) => (react_1.default.createElement("option", { key: idx + 1, value: idx + 1 }, name)))))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: "auto" },
                        react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: loadReport, disabled: loading }, loading ? (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-1" }),
                            "\u0141adowanie...")) : ("Wygeneruj raport"))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: "auto" },
                        react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-success", onClick: () => handleExport("csv"), disabled: exporting || !report }, "\u2B07 Eksport CSV")),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: "auto" },
                        react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-info", onClick: () => handleExport("xml"), disabled: exporting || !report }, "\u2B07 Eksport XML"))))),
        loading ? (react_1.default.createElement("div", { className: "text-center m-5" },
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null),
            react_1.default.createElement("div", { className: "mt-3" }, "Generowanie raportu..."))) : report ? (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-4" },
                react_1.default.createElement(react_bootstrap_1.Col, { md: 2 },
                    react_1.default.createElement(react_bootstrap_1.Card, { className: "text-center h-100" },
                        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                            react_1.default.createElement("div", { className: "text-muted small" }, "Liczba faktur"),
                            react_1.default.createElement("h3", { className: "mb-0" }, report.summary.totalInvoices)))),
                react_1.default.createElement(react_bootstrap_1.Col, { md: 2 },
                    react_1.default.createElement(react_bootstrap_1.Card, { className: "text-center h-100 border-primary" },
                        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                            react_1.default.createElement("div", { className: "text-muted small" }, "Suma netto"),
                            react_1.default.createElement("h4", { className: "mb-0 text-primary" },
                                Tools_1.default.formatNumber(toNumber(report.summary.totalNet)),
                                " z\u0142")))),
                react_1.default.createElement(react_bootstrap_1.Col, { md: 2 },
                    react_1.default.createElement(react_bootstrap_1.Card, { className: "text-center h-100" },
                        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                            react_1.default.createElement("div", { className: "text-muted small" }, "Suma VAT"),
                            react_1.default.createElement("h4", { className: "mb-0" },
                                Tools_1.default.formatNumber(toNumber(report.summary.totalVat)),
                                " z\u0142")))),
                react_1.default.createElement(react_bootstrap_1.Col, { md: 2 },
                    react_1.default.createElement(react_bootstrap_1.Card, { className: "text-center h-100" },
                        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                            react_1.default.createElement("div", { className: "text-muted small" }, "Suma brutto"),
                            react_1.default.createElement("h4", { className: "mb-0" },
                                Tools_1.default.formatNumber(toNumber(report.summary.totalGross)),
                                " z\u0142")))),
                react_1.default.createElement(react_bootstrap_1.Col, { md: 2 },
                    react_1.default.createElement(react_bootstrap_1.Card, { className: "text-center h-100 border-success" },
                        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                            react_1.default.createElement("div", { className: "text-muted small" }, "Do zaksi\u0119gowania"),
                            react_1.default.createElement("h4", { className: "mb-0 text-success" },
                                Tools_1.default.formatNumber(toNumber(report.summary.bookableNet)),
                                " z\u0142")))),
                react_1.default.createElement(react_bootstrap_1.Col, { md: 2 },
                    react_1.default.createElement(react_bootstrap_1.Card, { className: "text-center h-100 border-info" },
                        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                            react_1.default.createElement("div", { className: "text-muted small" }, "VAT do odliczenia"),
                            react_1.default.createElement("h4", { className: "mb-0 text-info" },
                                Tools_1.default.formatNumber(toNumber(report.summary.deductibleVat)),
                                " z\u0142"))))),
            react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-4" },
                react_1.default.createElement(react_bootstrap_1.Col, { md: 6 },
                    react_1.default.createElement(react_bootstrap_1.Card, { className: "h-100" },
                        react_1.default.createElement(react_bootstrap_1.Card.Header, null,
                            react_1.default.createElement("h6", { className: "mb-0" }, "Podzia\u0142 wg kategorii")),
                        react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "p-0" },
                            react_1.default.createElement(react_bootstrap_1.Table, { striped: true, hover: true, size: "sm", className: "mb-0" },
                                react_1.default.createElement("thead", null,
                                    react_1.default.createElement("tr", null,
                                        react_1.default.createElement("th", null, "Kategoria"),
                                        react_1.default.createElement("th", { className: "text-center" }, "Liczba"),
                                        react_1.default.createElement("th", { className: "text-end" }, "Netto"),
                                        react_1.default.createElement("th", { className: "text-end" }, "VAT"))),
                                react_1.default.createElement("tbody", null, Object.entries(report.summary.byCategory || {}).map(([categoryName, data]) => (react_1.default.createElement("tr", { key: categoryName },
                                    react_1.default.createElement("td", null, categoryName),
                                    react_1.default.createElement("td", { className: "text-center" }, data.count),
                                    react_1.default.createElement("td", { className: "text-end" },
                                        Tools_1.default.formatNumber(toNumber(data.net)),
                                        " z\u0142"),
                                    react_1.default.createElement("td", { className: "text-end" },
                                        Tools_1.default.formatNumber(toNumber(data.vat)),
                                        " z\u0142"))))))))),
                react_1.default.createElement(react_bootstrap_1.Col, { md: 6 },
                    react_1.default.createElement(react_bootstrap_1.Card, { className: "h-100" },
                        react_1.default.createElement(react_bootstrap_1.Card.Header, null,
                            react_1.default.createElement("h6", { className: "mb-0" }, "Podzia\u0142 wg statusu")),
                        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                            react_1.default.createElement(react_bootstrap_1.Row, null, Object.entries(report.summary.byStatus || {}).map(([status, count]) => (react_1.default.createElement(react_bootstrap_1.Col, { key: status, className: "text-center" },
                                react_1.default.createElement(CostInvoicesBadges_1.CostInvoiceStatusBadge, { status: status }),
                                react_1.default.createElement("h4", { className: "mt-2 mb-0" }, count))))))))),
            react_1.default.createElement(react_bootstrap_1.Card, null,
                react_1.default.createElement(react_bootstrap_1.Card.Header, null,
                    react_1.default.createElement("h6", { className: "mb-0" },
                        "Faktury (",
                        report.summary.totalInvoices,
                        ")")),
                react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "p-0" },
                    react_1.default.createElement(react_bootstrap_1.Table, { striped: true, hover: true, responsive: true, className: "mb-0" },
                        react_1.default.createElement("thead", null,
                            react_1.default.createElement("tr", null,
                                react_1.default.createElement("th", null, "Nr faktury"),
                                react_1.default.createElement("th", null, "Dostawca"),
                                react_1.default.createElement("th", null, "Data"),
                                react_1.default.createElement("th", { className: "text-end" }, "Netto"),
                                react_1.default.createElement("th", { className: "text-end" }, "VAT"),
                                react_1.default.createElement("th", { className: "text-end" }, "Brutto"),
                                react_1.default.createElement("th", null, "Kategoria"),
                                react_1.default.createElement("th", null, "Status"))),
                        react_1.default.createElement("tbody", null, report.invoices.map((invoice) => (react_1.default.createElement("tr", { key: invoice.id },
                            react_1.default.createElement("td", null,
                                react_1.default.createElement("a", { href: `#/cost-invoice/${invoice.id}` }, invoice.invoiceNumber)),
                            react_1.default.createElement("td", null,
                                react_1.default.createElement("div", null, invoice.supplierName),
                                react_1.default.createElement("div", { className: "text-muted small" },
                                    "NIP: ",
                                    invoice.supplierNip)),
                            react_1.default.createElement("td", null, invoice.issueDate),
                            react_1.default.createElement("td", { className: "text-end" }, Tools_1.default.formatNumber(toNumber(invoice.netAmount))),
                            react_1.default.createElement("td", { className: "text-end" }, Tools_1.default.formatNumber(toNumber(invoice.vatAmount))),
                            react_1.default.createElement("td", { className: "text-end" }, Tools_1.default.formatNumber(toNumber(invoice.grossAmount))),
                            react_1.default.createElement("td", null,
                                react_1.default.createElement(CostInvoicesBadges_1.CategoryBadge, { category: getInvoiceCategory(invoice) })),
                            react_1.default.createElement("td", null,
                                react_1.default.createElement(CostInvoicesBadges_1.CostInvoiceStatusBadge, { status: invoice.status }))))))))))) : (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "info" }, "Wybierz okres i kliknij \"Wygeneruj raport\" aby zobaczy\u0107 dane."))));
}
