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
const FilterableTable_1 = __importDefault(require("../../View/Resultsets/FilterableTable/FilterableTable"));
const InvoiceFilterBody_1 = require("./InvoiceFilterBody");
const InvoiceModalButtons_1 = require("./Modals/InvoiceModalButtons");
const CommonComponents_1 = require("../../View/Resultsets/CommonComponents");
const InvoicesController_1 = require("./InvoicesController");
const Tools_1 = __importDefault(require("../../React/Tools"));
function InvoicesSearch({ title }) {
    (0, react_1.useEffect)(() => {
        document.title = title;
    }, [title]);
    function makeEntityLabel(invoice) {
        return (react_1.default.createElement(react_1.default.Fragment, null,
            invoice._entity.name,
            " ",
            ' ',
            " ",
            react_1.default.createElement(CommonComponents_1.InvoiceStatusBadge, { status: invoice.status })));
    }
    function renderInvoiceTotaValue(invoice) {
        return react_1.default.createElement(react_1.default.Fragment, null, invoice._totalNetValue && react_1.default.createElement("div", { className: "text-end" }, Tools_1.default.formatNumber(invoice._totalNetValue)));
    }
    return (react_1.default.createElement(FilterableTable_1.default, { id: 'invoices', title: title, FilterBodyComponent: InvoiceFilterBody_1.InvoicesFilterBody, tableStructure: [
            { header: 'Umowa', renderTdBody: (invoice) => react_1.default.createElement(react_1.default.Fragment, null, invoice._contract.ourId) },
            { header: 'Numer', objectAttributeToShow: 'number' },
            { header: 'Sprzedaż', objectAttributeToShow: 'issueDate' },
            { header: 'Wysłano', objectAttributeToShow: 'sentDate' },
            { header: 'Odbiorca', renderTdBody: makeEntityLabel },
            { header: 'Netto, zł', renderTdBody: renderInvoiceTotaValue },
            { header: 'Termin płatności', objectAttributeToShow: 'paymentDeadline' },
        ], AddNewButtonComponents: [InvoiceModalButtons_1.InvoiceAddNewModalButton], EditButtonComponent: InvoiceModalButtons_1.InvoiceEditModalButton, isDeletable: true, repository: InvoicesController_1.invoicesRepository, selectedObjectRoute: '/invoice/' }));
}
exports.default = InvoicesSearch;
