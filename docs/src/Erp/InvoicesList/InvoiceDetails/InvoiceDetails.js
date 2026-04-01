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
exports.default = InvoiceDetails;
exports.InvoiceProvider = InvoiceProvider;
exports.useInvoice = useInvoice;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
const ToolsDate_1 = __importDefault(require("../../../React/Tools/ToolsDate"));
const CommonComponents_1 = require("../../../View/Resultsets/CommonComponents");
const FilterableTable_1 = __importDefault(require("../../../View/Resultsets/FilterableTable/FilterableTable"));
const InvoicesController_1 = require("../InvoicesController");
const InvoiceItemModalButtons_1 = require("../Modals/InvoiceItemModalButtons");
const InvoiceModalButtons_1 = require("../Modals/InvoiceModalButtons");
const InvoiceValidationSchema_1 = require("../Modals/InvoiceValidationSchema");
const Tools_1 = __importDefault(require("../../../React/Tools/Tools"));
const KsefSection_1 = __importDefault(require("./KsefSection"));
const CorrectionModal_1 = __importDefault(require("../Modals/CorrectionModal"));
const GeneralModalButtons_1 = require("../../../View/Modals/GeneralModalButtons");
const THIRD_PARTY_ROLE_LABELS = {
    1: "Faktor",
    2: "Odbiorca",
    3: "Podmiot pierwotny",
    4: "Dodatkowy nabywca",
    5: "Wystawca faktury",
    6: "Dokonujący płatności",
    7: "JST wystawca",
    8: "JST odbiorca",
    9: "Członek GV wystawca",
    10: "Członek GV odbiorca",
};
function InvoiceDetails() {
    const [invoice, setInvoice] = (0, react_1.useState)(InvoicesController_1.invoicesRepository.currentItems[0]);
    const [invoiceItems, setInvoiceItems] = (0, react_1.useState)(undefined);
    const [errorMessage, setErrorMessage] = (0, react_1.useState)("");
    const [showCorrectionModal, setShowCorrectionModal] = (0, react_1.useState)(false);
    const [correctedInvoiceNumber, setCorrectedInvoiceNumber] = (0, react_1.useState)(null);
    const navigate = (0, react_router_dom_1.useNavigate)();
    const { id } = (0, react_router_dom_1.useParams)();
    (0, react_1.useEffect)(() => {
        if (!id)
            throw new Error("Nie znaleziono id w adresie url");
        const idNumber = Number(id);
        async function fetchData() {
            // Zawsze pobieraj świeże dane z serwera (żeby mieć aktualne _corrections)
            const fetchInvoice = InvoicesController_1.invoicesRepository.loadItemsFromServerPOST([{ id: idNumber }]);
            const fetchItems = InvoicesController_1.invoiceItemsRepository.loadItemsFromServerPOST([{ invoiceId: id }]);
            try {
                const [invoicesData, itemsData] = await Promise.all([fetchInvoice, fetchItems]);
                const invoiceData = invoicesData?.find((inv) => inv.id === idNumber);
                if (invoiceData) {
                    setInvoice(invoiceData);
                    InvoicesController_1.invoicesRepository.addToCurrentItems(invoiceData.id);
                    // Jeśli to korekta, pobierz numer faktury źródłowej
                    if (invoiceData.correctedInvoiceId && !invoiceData._correctedInvoice?.number) {
                        const correctedInvoices = await InvoicesController_1.invoicesRepository.loadItemsFromServerPOST([{ id: invoiceData.correctedInvoiceId }]);
                        const correctedInvoice = correctedInvoices?.[0];
                        if (correctedInvoice?.number) {
                            setCorrectedInvoiceNumber(correctedInvoice.number);
                        }
                    }
                    document.title = `Faktura ${invoiceData._contract.ourId} | ${invoiceData.number || ""}`;
                }
                setInvoiceItems(itemsData);
            }
            catch (error) {
                console.error("Error fetching data", error);
                if (error instanceof Error)
                    setErrorMessage(error.message);
            }
        }
        // Reset state przed załadowaniem nowej faktury
        setInvoice(undefined);
        setInvoiceItems(undefined);
        setCorrectedInvoiceNumber(null);
        setErrorMessage("");
        fetchData();
    }, [id]);
    // Callback po utworzeniu korekty
    const handleCorrectionCreated = (correctionInvoice) => {
        // Przekieruj do widoku korekty
        window.location.hash = `/invoice/${correctionInvoice.id}`;
    };
    function handleError(error) {
        setErrorMessage(error.message || "An error occurred while copying the invoice.");
    }
    // Callback po usunięciu faktury
    const handleDelete = () => {
        navigate("/invoices");
    };
    if (!invoice) {
        return (react_1.default.createElement("div", null,
            "\u0141aduj\u0119 dane... ",
            react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null),
            " "));
    }
    // Czy można utworzyć korektę - tylko dla faktur z numerem KSeF i nie będących korektami
    const canCreateCorrection = invoice.ksefNumber && !invoice.correctedInvoiceId;
    // Czy faktura ma numer KSeF (nie można usunąć bezpośrednio)
    const hasKsefNumber = !!invoice.ksefNumber;
    function renderActionsMenu() {
        if (errorMessage)
            return (react_1.default.createElement(react_bootstrap_1.Alert, { style: { whiteSpace: "pre-wrap" }, className: "mt-3", variant: "danger", onClose: () => setErrorMessage(""), dismissible: true }, errorMessage));
        return (react_1.default.createElement(react_1.default.Fragment, null,
            react_1.default.createElement(InvoiceModalButtons_1.ActionButton, null),
            " ",
            react_1.default.createElement(InvoiceModalButtons_1.CopyButton, { onError: handleError }),
            " ",
            react_1.default.createElement(InvoiceModalButtons_1.InvoiceEditModalButton, { modalProps: {
                    onEdit: setInvoice,
                    initialData: invoice,
                    makeValidationSchema: InvoiceValidationSchema_1.makeInvoiceValidationSchema,
                    repository: InvoicesController_1.invoicesRepository,
                    shouldRetrieveDataBeforeEdit: true,
                }, buttonProps: { buttonCaption: "Edytuj Fakturę" } }),
            !hasKsefNumber && (react_1.default.createElement(GeneralModalButtons_1.GeneralDeleteModalButton, { modalProps: {
                    onDelete: handleDelete,
                    initialData: invoice,
                    repository: InvoicesController_1.invoicesRepository,
                    modalTitle: "Usuwanie faktury",
                }, buttonProps: { layout: "horizontal" } }))));
    }
    return (react_1.default.createElement(InvoiceProvider, { invoice: invoice, setInvoice: setInvoice },
        react_1.default.createElement(react_bootstrap_1.Card, null,
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Container, null,
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Nr faktury:"),
                            react_1.default.createElement("h5", null, invoice.number)),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 3, lg: "3" },
                            react_1.default.createElement("div", null, "do Umowy:"),
                            react_1.default.createElement("h5", null, invoice._contract.ourId)),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 2 },
                            react_1.default.createElement(CommonComponents_1.InvoiceStatusBadge, { status: invoice.status }),
                            invoice.correctedInvoiceId && (react_1.default.createElement(react_bootstrap_1.Badge, { bg: "warning", text: "dark", className: "ms-2" }, "Korekta"))),
                        react_1.default.createElement(react_bootstrap_1.Col, { md: "auto" }, renderActionsMenu()),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 1, lg: "auto" }, invoice._documentOpenUrl && react_1.default.createElement(CommonComponents_1.GDDocFileIconLink, { folderUrl: invoice._documentOpenUrl }))),
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Data sprzeda\u017Cy:"),
                            invoice.issueDate ? (react_1.default.createElement("h5", null,
                                ToolsDate_1.default.dateYMDtoDMY(invoice.issueDate),
                                " ")) : ("Jeszcze nie wystawiono")),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Data wys\u0142ania:"),
                            invoice.sentDate ? (react_1.default.createElement("h5", null, ToolsDate_1.default.dateYMDtoDMY(invoice.sentDate))) : ("Jeszcze nie wysłano")),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Termin p\u0142atno\u015Bci:"),
                            invoice.paymentDeadline ? (react_1.default.createElement("h5", null, ToolsDate_1.default.dateYMDtoDMY(invoice.paymentDeadline))) : ("Jeszcze nie okreśony"))),
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Warto\u015B\u0107 Brutto:"),
                            react_1.default.createElement("h5", null, invoice._totalGrossValue && Tools_1.default.formatNumber(invoice._totalGrossValue))),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 4, md: 2 },
                            react_1.default.createElement("div", null, "Warto\u015B\u0107 netto:"),
                            react_1.default.createElement("h5", null, invoice._totalNetValue && Tools_1.default.formatNumber(invoice._totalNetValue))),
                        react_1.default.createElement(react_bootstrap_1.Col, { sm: 12, md: 8 },
                            react_1.default.createElement("div", null, "Nabywca"),
                            react_1.default.createElement("h5", null, invoice._entity.name),
                            react_1.default.createElement("h5", null, invoice._entity.address),
                            react_1.default.createElement("h5", null,
                                "NIP: ",
                                invoice._entity.taxNumber)),
                        invoice.includeThirdParty && invoice._thirdParties && invoice._thirdParties.length > 0 && (react_1.default.createElement(react_bootstrap_1.Col, { sm: 12, md: 8 },
                            react_1.default.createElement("div", null, "Podmioty 3 (KSeF)"),
                            react_1.default.createElement(react_bootstrap_1.Table, { size: "sm", striped: true, bordered: true },
                                react_1.default.createElement("thead", null,
                                    react_1.default.createElement("tr", null,
                                        react_1.default.createElement("th", null, "#"),
                                        react_1.default.createElement("th", null, "Rola"),
                                        react_1.default.createElement("th", null, "Nazwa"),
                                        react_1.default.createElement("th", null, "NIP"),
                                        react_1.default.createElement("th", null, "Adres"))),
                                react_1.default.createElement("tbody", null, invoice._thirdParties.map((thirdParty, index) => (react_1.default.createElement("tr", { key: `invoice-third-party-${index}` },
                                    react_1.default.createElement("td", null, index + 1),
                                    react_1.default.createElement("td", null, typeof thirdParty.role === "number"
                                        ? THIRD_PARTY_ROLE_LABELS[thirdParty.role] || `Rola ${thirdParty.role}`
                                        : "-"),
                                    react_1.default.createElement("td", null, thirdParty._entity?.name || "-"),
                                    react_1.default.createElement("td", null, thirdParty._entity?.taxNumber || "-"),
                                    react_1.default.createElement("td", null, thirdParty._entity?.address || "-"))))))))),
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, null, invoice.description && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "succes" },
                            " ",
                            react_1.default.createElement("p", null,
                                "Opis: ",
                                invoice.description),
                            " ")))),
                    invoice.correctedInvoiceId && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "info", className: "mt-3" },
                        react_1.default.createElement("strong", null, "\uD83D\uDCCB Faktura koryguj\u0105ca"),
                        react_1.default.createElement("br", null),
                        "Ta faktura koryguje faktur\u0119:",
                        " ",
                        react_1.default.createElement(react_router_dom_1.Link, { to: `/invoice/${invoice.correctedInvoiceId}` }, invoice._correctedInvoice?.number || correctedInvoiceNumber || `#${invoice.correctedInvoiceId}`),
                        invoice.correctionReason && (react_1.default.createElement(react_1.default.Fragment, null,
                            react_1.default.createElement("br", null),
                            react_1.default.createElement("strong", null, "Przyczyna:"),
                            " ",
                            invoice.correctionReason)))),
                    invoice._corrections && invoice._corrections.length > 0 && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "warning", className: "mt-3" },
                        react_1.default.createElement("strong", null, "\u26A0\uFE0F Ta faktura ma korekty:"),
                        react_1.default.createElement("ul", { className: "mb-0 mt-2" }, invoice._corrections.map((correction) => (react_1.default.createElement("li", { key: correction.id },
                            react_1.default.createElement(react_router_dom_1.Link, { to: `/invoice/${correction.id}` }, correction.number || `#${correction.id}`),
                            correction.correctionReason && ` - ${correction.correctionReason}`)))))),
                    canCreateCorrection && (react_1.default.createElement("div", { className: "mt-3" },
                        react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-warning", onClick: () => setShowCorrectionModal(true) }, "\u270F\uFE0F Utw\u00F3rz korekt\u0119")))),
                invoiceItems ? (react_1.default.createElement(FilterableTable_1.default, { id: "invoiceItems", title: "", initialObjects: invoiceItems, repository: InvoicesController_1.invoiceItemsRepository, AddNewButtonComponents: [InvoiceItemModalButtons_1.InvoiceItemAddNewModalButton], EditButtonComponent: InvoiceItemModalButtons_1.InvoiceItemEditModalButton, tableStructure: [
                        { header: "Opis", objectAttributeToShow: "description", colMd: 7 },
                        {
                            header: "Netto",
                            renderTdBody: (item) => (react_1.default.createElement("div", { className: "text-end" }, Tools_1.default.formatNumber(item._netValue))),
                            colMd: 2,
                        },
                        {
                            header: "Brutto",
                            renderTdBody: (item) => (react_1.default.createElement("div", { className: "text-end" }, Tools_1.default.formatNumber(item._grossValue))),
                            colMd: 2,
                        },
                    ] })) : (react_1.default.createElement(react_1.default.Fragment, null,
                    "\"\u0141adowanie pozycji faktury...\" ",
                    react_1.default.createElement(CommonComponents_1.SpinnerBootstrap, null))),
                react_1.default.createElement(KsefSection_1.default, { invoice: invoice, onInvoiceUpdate: setInvoice, correctedInvoiceNumber: correctedInvoiceNumber }),
                react_1.default.createElement("p", { className: "tekst-muted small" },
                    "Przygotowa\u0142(a): ",
                    `${invoice._owner.name} ${invoice._owner.surname}`,
                    react_1.default.createElement("br", null),
                    "Aktualizacja: ",
                    ToolsDate_1.default.dateToDDmmmYYYYHHMM(invoice._lastUpdated)))),
        react_1.default.createElement(CorrectionModal_1.default, { show: showCorrectionModal, onHide: () => setShowCorrectionModal(false), invoice: invoice, onCorrectionCreated: handleCorrectionCreated })));
}
// Utwórz kontekst
const InvoiceContext = (0, react_1.createContext)({
    invoice: {},
    setInvoice: () => { },
});
// Twórz dostawcę kontekstu, który przechowuje stan faktury
function InvoiceProvider({ invoice, setInvoice, children }) {
    if (!invoice)
        throw new Error("Invoice not found");
    return react_1.default.createElement(InvoiceContext.Provider, { value: { invoice, setInvoice } }, children);
}
// Tworzy własny hook, który będzie używany przez komponenty podrzędne do uzyskania dostępu do faktury
function useInvoice() {
    return (0, react_1.useContext)(InvoiceContext);
}
