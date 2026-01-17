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
exports.default = InvoicesSearch;
const react_1 = __importStar(require("react"));
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const InvoiceFilterBody_1 = require("./InvoiceFilterBody");
const InvoiceModalButtons_1 = require("./Modals/InvoiceModalButtons");
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const InvoicesController_1 = require("./InvoicesController");
const Tools_1 = __importDefault(require("../../React/Tools/Tools"));
function InvoicesSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function renderRow(invoice, isActive) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement("div", { className: "fw-bold" }, invoice._contract?.ourId),
            react_1.default.createElement("div", null,
                invoice._entity.name,
                " "),
            invoice.description && react_1.default.createElement("div", { className: "text-muted small" },
                " ",
                invoice.description),
            isActive && react_1.default.createElement("div", { className: "mt-2" })));
    }
    function renderInvoiceTotaValue(invoice) {
        return (react_1.default.createElement(react_1.default.Fragment, null, invoice._totalNetValue && react_1.default.createElement("div", { className: "text-end" }, Tools_1.default.formatNumber(invoice._totalNetValue))));
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: "invoices", title: title, FilterBodyComponent: InvoiceFilterBody_1.InvoicesFilterBody, tableStructure: [
            { header: "Numer", objectAttributeToShow: "number", colMd: 1 },
            { header: "Dane faktury", renderTdBody: renderRow, colMd: 4 },
            { header: "Sprzedaż", objectAttributeToShow: "issueDate", colMd: 1 },
            { header: "Wysłano", objectAttributeToShow: "sentDate", colMd: 1 },
            { header: "Netto, zł", renderTdBody: renderInvoiceTotaValue, colMd: 1 },
            { header: "Termin płatności", objectAttributeToShow: "paymentDeadline", colMd: 1 },
            {
                header: "Status",
                renderTdBody: (invoice) => react_1.default.createElement(CommonComponents_1.InvoiceStatusBadge, { status: invoice.status }),
                colMd: 1,
            },
            {
                header: "KSeF",
                renderTdBody: (invoice) => (react_1.default.createElement(CommonComponents_1.KsefStatusBadge, { ksefNumber: invoice.ksefNumber, ksefStatus: invoice.ksefStatus })),
                colMd: 1,
            },
        ], AddNewButtonComponents: [InvoiceModalButtons_1.InvoiceAddNewModalButton], EditButtonComponent: InvoiceModalButtons_1.InvoiceEditModalButton, isDeletable: true, isCopyable: true, repository: InvoicesController_1.invoicesRepository, selectedObjectRoute: "/invoice/" }));
}
