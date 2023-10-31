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
exports.useInvoice = exports.InvoiceProvider = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
const ToolsDate_1 = __importDefault(require("../../../React/ToolsDate"));
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable/FilterableTable"));
const InvoicesController_1 = require("../InvoicesController");
const InvoiceItemModalButtons_1 = require("../Modals/InvoiceItemModalButtons");
const InvoiceModalButtons_1 = require("../Modals/InvoiceModalButtons");
const InvoiceValidationSchema_1 = require("../Modals/InvoiceValidationSchema");
function InvoiceDetails() {
    const [invoice, setInvoice] = (0, react_1.useState)(InvoicesController_1.invoicesRepository.currentItems[0]);
    const [invoiceItems, setInvoiceItems] = (0, react_1.useState)(undefined);
    const { id } = (0, react_router_dom_1.useParams)();
    (0, react_1.useEffect)(() => {
        if (!id)
            throw new Error('Nie znaleziono id w adresie url');
        const idNumber = Number(id);
        async function fetchData() {
            const fetchInvoice = InvoicesController_1.invoicesRepository.loadItemFromRouter(idNumber);
            const fetchItems = InvoicesController_1.invoiceItemsRepository.loadItemsFromServerPOST([{ invoiceId: id }]);
            try {
                const [invoiceData, itemsData] = await Promise.all([fetchInvoice, fetchItems]);
                if (invoiceData)
                    setInvoice(invoiceData);
                setInvoiceItems(itemsData);
            }
            catch (error) {
                console.error("Error fetching data", error);
                // Handle error as you see fit
            }
        }
        ;
        fetchData();
    }, []);
    if (!invoice) {
        return react_1.default.createElement("div", null,
            "\u0141aduj\u0119 dane... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null),
            " ");
    }
    return (react_1.default.createElement(InvoiceProvider, { invoice: invoice, setInvoice: setInvoice },
        react_1.default.createElement(react_bootstrap_1.Card, null,
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Container, null,
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Nr faktury:"),
                            react_1.default.createElement("h5", null, invoice.number)),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 3, lg: '3' },
                            react_1.default.createElement("div", null, "do Umowy:"),
                            react_1.default.createElement("h5", null, invoice._contract.ourId)),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 2 },
                            react_1.default.createElement(CommonComponents_1.InvoiceStatusBadge, { status: invoice.status })),
                        react_1.default.createElement(react_bootstrap_1.Col, { md: "auto" },
                            react_1.default.createElement(InvoiceModalButtons_1.ActionButton, null),
                            " ",
                            ' ',
                            " ",
                            react_1.default.createElement(InvoiceModalButtons_1.CopyButton, null),
                            ' ',
                            react_1.default.createElement(InvoiceModalButtons_1.InvoiceEditModalButton, { modalProps: {
                                    onEdit: setInvoice,
                                    initialData: invoice,
                                    makeValidationSchema: InvoiceValidationSchema_1.makeInvoiceValidationSchema
                                }, buttonProps: { buttonCaption: 'Edytuj Fakturę' } })),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 1, lg: 'auto' }, invoice._documentOpenUrl && (react_1.default.createElement(CommonComponents_1.GDDocFileIconLink, { folderUrl: invoice._documentOpenUrl })))),
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Data sprzeda\u017Cy:"),
                            invoice.issueDate
                                ? react_1.default.createElement("h5", null,
                                    ToolsDate_1.default.dateYMDtoDMY(invoice.issueDate),
                                    " ")
                                : 'Jeszcze nie wystawiono'),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Data wys\u0142ania:"),
                            invoice.sentDate
                                ? react_1.default.createElement("h5", null, ToolsDate_1.default.dateYMDtoDMY(invoice.sentDate))
                                : 'Jeszcze nie wysłano'),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Termin p\u0142atno\u015Bci:"),
                            invoice.paymentDeadline
                                ? react_1.default.createElement("h5", null, ToolsDate_1.default.dateYMDtoDMY(invoice.paymentDeadline))
                                : 'Jeszcze nie okreśony')),
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Warto\u015B\u0107 Brutto:"),
                            react_1.default.createElement("h5", null, invoice._grossValue)),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Warto\u015B\u0107 Netto:"),
                            react_1.default.createElement("h5", null, invoice._netValue)),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 12, md: 8 },
                            react_1.default.createElement("div", null, "Odbiorca"),
                            react_1.default.createElement("h5", null, invoice._entity.name),
                            react_1.default.createElement("h5", null, invoice._entity.address))),
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, null, invoice.description && react_1.default.createElement("p", null,
                            "Opis: ",
                            invoice.description)))),
                invoiceItems ?
                    react_1.default.createElement(FilterableTable_1.default, { id: 'invoiceItems', title: '', initialObjects: invoiceItems, repository: InvoicesController_1.invoiceItemsRepository, AddNewButtonComponents: [InvoiceItemModalButtons_1.InvoiceItemAddNewModalButton], EditButtonComponent: InvoiceItemModalButtons_1.InvoiceItemEditModalButton, tableStructure: [
                            { header: 'Opis', objectAttributeToShow: 'description' },
                            { header: 'Netto', objectAttributeToShow: '_netValue' },
                            { header: 'Brutto', objectAttributeToShow: '_grossValue' },
                        ] })
                    : react_1.default.createElement(react_1.default.Fragment, null,
                        "\"\u0141adowanie pozycji faktury...\" ",
                        react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null)),
                react_1.default.createElement("p", { className: 'tekst-muted small' },
                    "Przygotowa\u0142(a): ",
                    `${invoice._owner.name} ${invoice._owner.surname}`,
                    react_1.default.createElement("br", null),
                    "Aktualizacja: ",
                    ToolsDate_1.default.timestampToString(invoice._lastUpdated))))));
}
exports.default = InvoiceDetails;
// Utwórz kontekst
const InvoiceContext = (0, react_1.createContext)({
    invoice: {},
    setInvoice: () => { }
});
// Twórz dostawcę kontekstu, który przechowuje stan faktury
function InvoiceProvider({ invoice, setInvoice, children }) {
    if (!invoice)
        throw new Error("Invoice not found");
    return (react_1.default.createElement(InvoiceContext.Provider, { value: { invoice, setInvoice } }, children));
}
exports.InvoiceProvider = InvoiceProvider;
// Tworzy własny hook, który będzie używany przez komponenty podrzędne do uzyskania dostępu do faktury
function useInvoice() {
    return (0, react_1.useContext)(InvoiceContext);
}
exports.useInvoice = useInvoice;
