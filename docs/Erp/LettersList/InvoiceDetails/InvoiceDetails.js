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
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable"));
const InvoicesSearch_1 = require("../InvoicesSearch");
function InvoiceDetails() {
    const invoice = InvoicesSearch_1.invoicesRepository.currentItems[0];
    const [invoiceItems, setInvoiceItems] = (0, react_1.useState)(undefined);
    (0, react_1.useEffect)(() => {
        const fetchInvoiceItems = async () => {
            const formData = new FormData();
            formData.append('invoiceId', invoice.id.toString());
            const items = await InvoicesSearch_1.invoiceItemsRepository.loadItemsfromServer(formData);
            setInvoiceItems(items);
        };
        fetchInvoiceItems();
    }, []);
    if (!invoice) {
        return react_1.default.createElement("div", null,
            "\u0141aduj\u0119 dane... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null),
            " ");
    }
    return (react_1.default.createElement(react_bootstrap_1.Card, null,
        react_1.default.createElement(react_bootstrap_1.Card.Header, null,
            react_1.default.createElement("div", { className: "d-flex justify-content-between" },
                react_1.default.createElement("div", null,
                    "Nr faktury: ",
                    react_1.default.createElement("h5", null, invoice.number),
                    " do Umowy: ",
                    react_1.default.createElement("h5", null, invoice._contract.ourId),
                    invoice.description &&
                        react_1.default.createElement("p", null,
                            "Opis: ",
                            invoice.description),
                    react_1.default.createElement("p", null,
                        "Data wystawienia: ",
                        invoice.issueDate ? ToolsDate_1.default.dateYMDtoDMY(invoice.issueDate) : 'Jeszcze nie wystawiono'),
                    react_1.default.createElement("p", null,
                        "Data wys\u0142ania: ",
                        invoice.sentDate ? ToolsDate_1.default.dateYMDtoDMY(invoice.sentDate) : 'Jeszcze nie wysłano'),
                    react_1.default.createElement("p", null,
                        "Termin p\u0142atno\u015Bci: ",
                        invoice.paymentDeadline ? ToolsDate_1.default.dateYMDtoDMY(invoice.paymentDeadline) : 'Jeszcze nie okreśony')))),
        react_1.default.createElement(react_bootstrap_1.Card.Body, null,
            react_1.default.createElement("h5", null, "Pozycje faktury:"),
            invoiceItems ?
                react_1.default.createElement(FilterableTable_1.default, { title: '', initialObjects: invoiceItems, repository: InvoicesSearch_1.invoiceItemsRepository, AddNewButtonComponents: undefined, 
                    //EditButtonComponents={}
                    tableStructure: [
                        { header: 'Opis', objectAttributeToShow: 'description' },
                        { header: 'Netto', objectAttributeToShow: '_netValue' },
                        { header: 'Brutto', objectAttributeToShow: '_grossValue' },
                    ] })
                : react_1.default.createElement(react_1.default.Fragment, null,
                    "\"\u0141adowanie pozycji faktury...\" ",
                    react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null))),
        react_1.default.createElement(react_bootstrap_1.Card.Footer, null,
            react_1.default.createElement("p", null,
                "Prygotowa\u0142(a): ",
                `${invoice._owner.name} ${invoice._owner.surname}`),
            react_1.default.createElement("p", null,
                "Aktualizacja: ",
                ToolsDate_1.default.timestampToString(invoice._lastUpdated)))));
}
exports.default = InvoiceDetails;
