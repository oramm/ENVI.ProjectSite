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
exports.default = InvoicePdfPreview;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_router_dom_1 = require("react-router-dom");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
function getCorrectionTypeLabel(correctionType) {
    if (correctionType === "1") {
        return "Korekta skutkująca w dacie ujęcia faktury pierwotnej";
    }
    if (correctionType === "2") {
        return "Korekta skutkująca w dacie wystawienia faktury korygującej";
    }
    if (correctionType === "3") {
        return "Korekta skutkująca w dacie innej, w tym gdy dla różnych pozycji faktury korygującej daty te są różne";
    }
    return "(nie ustawiono)";
}
function findFirstByLocalName(root, localName) {
    const all = root.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
        if (all[i].localName === localName) {
            return all[i];
        }
    }
    return null;
}
function findChildrenByLocalName(parent, localName) {
    const result = [];
    for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i];
        if (child.localName === localName) {
            result.push(child);
        }
    }
    return result;
}
function findAllByLocalName(root, localName) {
    const result = [];
    const all = root.getElementsByTagName("*");
    for (let i = 0; i < all.length; i++) {
        if (all[i].localName === localName) {
            result.push(all[i]);
        }
    }
    return result;
}
function mapKsefFlagToTakNie(value) {
    if (value === "1")
        return "TAK";
    if (value === "2")
        return "NIE";
    return "-";
}
const THIRD_PARTY_ROLE_LABELS = {
    "1": "Faktor - w przypadku gdy na fakturze występują dane faktora",
    "2": "Odbiorca - w przypadku gdy na fakturze występują dane jednostek wewnętrznych, oddziałów, wyodrębnionych w ramach nabywcy, które same nie stanowią nabywcy w rozumieniu ustawy",
    "3": "Podmiot pierwotny - w przypadku gdy na fakturze występują dane podmiotu będącego w stosunku do podatnika podmiotem przejętym lub przekształconym, który dokonywał dostawy lub świadczył usługę",
    "4": "Dodatkowy nabywca - w przypadku gdy na fakturze występują dane kolejnych (innych niż wymieniony w części Podmiot2) nabywców",
    "5": "Wystawca faktury - w przypadku gdy na fakturze występują dane podmiotu wystawiającego fakturę w imieniu podatnika",
    "6": "Dokonujący płatności - w przypadku gdy na fakturze występują dane podmiotu regulującego zobowiązanie w miejsce nabywcy",
    "7": "Jednostka samorządu terytorialnego - wystawca",
    "8": "Jednostka samorządu terytorialnego - odbiorca",
    "9": "Członek grupy VAT - wystawca",
    "10": "Członek grupy VAT - odbiorca",
    "11": "Pracownik",
};
function getThirdPartyRoleLabel(role) {
    if (!role)
        return "";
    return THIRD_PARTY_ROLE_LABELS[role] || `Rola ${role}`;
}
function getChildText(parent, localName) {
    if (!parent)
        return "";
    const child = findChildrenByLocalName(parent, localName)[0];
    return (child?.textContent || "").trim();
}
function parsePreviewXml(xml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, "application/xml");
    const parserError = doc.getElementsByTagName("parsererror")[0];
    if (parserError) {
        throw new Error("Nie udało się sparsować XML podglądu faktury");
    }
    const podmiot1 = findFirstByLocalName(doc, "Podmiot1");
    const podmiot2 = findFirstByLocalName(doc, "Podmiot2");
    const podmiot3List = findAllByLocalName(doc, "Podmiot3");
    const fa = findFirstByLocalName(doc, "Fa");
    const platnosc = findFirstByLocalName(doc, "Platnosc");
    const podmiot1Id = podmiot1 ? findFirstByLocalName(podmiot1, "DaneIdentyfikacyjne") : null;
    const podmiot1Adr = podmiot1 ? findFirstByLocalName(podmiot1, "Adres") : null;
    const podmiot2Id = podmiot2 ? findFirstByLocalName(podmiot2, "DaneIdentyfikacyjne") : null;
    const podmiot2Adr = podmiot2 ? findFirstByLocalName(podmiot2, "Adres") : null;
    const rachunekBankowy = platnosc ? findFirstByLocalName(platnosc, "RachunekBankowy") : null;
    const terminPlatnosci = platnosc ? findFirstByLocalName(platnosc, "TerminPlatnosci") : null;
    const items = [];
    if (fa) {
        const faLines = fa.getElementsByTagName("*");
        for (let i = 0; i < faLines.length; i++) {
            if (faLines[i].localName !== "FaWiersz")
                continue;
            const row = faLines[i];
            items.push({
                lineNo: getChildText(row, "NrWierszaFa"),
                name: getChildText(row, "P_7"),
                unit: getChildText(row, "P_8A"),
                quantity: getChildText(row, "P_8B"),
                unitPrice: getChildText(row, "P_9A"),
                netValue: getChildText(row, "P_11"),
                vatRate: getChildText(row, "P_12"),
            });
        }
    }
    const thirdParties = podmiot3List.map((podmiot3) => {
        const podmiot3Id = findFirstByLocalName(podmiot3, "DaneIdentyfikacyjne");
        const podmiot3Adr = findFirstByLocalName(podmiot3, "Adres");
        return {
            name: getChildText(podmiot3Id, "Nazwa"),
            nip: getChildText(podmiot3Id, "NIP"),
            internalId: getChildText(podmiot3Id, "IDWew"),
            line1: getChildText(podmiot3Adr, "AdresL1"),
            line2: getChildText(podmiot3Adr, "AdresL2"),
            role: getChildText(podmiot3, "Rola"),
        };
    });
    return {
        invoiceNumber: getChildText(fa, "P_2"),
        issueDate: getChildText(fa, "P_1"),
        saleDate: getChildText(fa, "P_6"),
        totalGross: getChildText(fa, "P_15"),
        invoiceType: getChildText(fa, "RodzajFaktury"),
        correctionType: getChildText(fa, "TypKorekty"),
        paymentDeadline: getChildText(terminPlatnosci, "Termin"),
        bankAccount: getChildText(rachunekBankowy, "NrRB"),
        bankName: getChildText(rachunekBankowy, "NazwaBanku"),
        seller: {
            name: getChildText(podmiot1Id, "Nazwa"),
            nip: getChildText(podmiot1Id, "NIP"),
            line1: getChildText(podmiot1Adr, "AdresL1"),
            line2: getChildText(podmiot1Adr, "AdresL2"),
            jst: "",
            gv: "",
        },
        buyer: {
            name: getChildText(podmiot2Id, "Nazwa"),
            nip: getChildText(podmiot2Id, "NIP"),
            line1: getChildText(podmiot2Adr, "AdresL1"),
            line2: getChildText(podmiot2Adr, "AdresL2"),
            jst: mapKsefFlagToTakNie(getChildText(podmiot2, "JST")),
            gv: mapKsefFlagToTakNie(getChildText(podmiot2, "GV")),
        },
        thirdParties,
        items,
    };
}
function InvoicePdfPreview() {
    const { id } = (0, react_router_dom_1.useParams)();
    const navigate = (0, react_router_dom_1.useNavigate)();
    const [xml, setXml] = (0, react_1.useState)("");
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)("");
    (0, react_1.useEffect)(() => {
        let cancelled = false;
        async function loadPreview() {
            if (!id) {
                setError("Brak id faktury w adresie.");
                setLoading(false);
                return;
            }
            setLoading(true);
            setError("");
            try {
                const response = await fetch(`${MainSetupReact_1.default.serverUrl}invoice/${id}/ksef/xml-preview`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!response.ok) {
                    const payload = await response.json().catch(() => ({}));
                    throw new Error(payload.error || payload.errorMessage || `Błąd serwera (${response.status})`);
                }
                const text = await response.text();
                if (!cancelled) {
                    setXml(text);
                }
            }
            catch (err) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Nie udało się pobrać podglądu faktury");
                }
            }
            finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }
        loadPreview();
        return () => {
            cancelled = true;
        };
    }, [id]);
    const parsedResult = (0, react_1.useMemo)(() => {
        if (!xml)
            return { data: null, parseError: "" };
        try {
            return { data: parsePreviewXml(xml), parseError: "" };
        }
        catch (err) {
            return {
                data: null,
                parseError: err instanceof Error ? err.message : "Błąd parsowania XML",
            };
        }
    }, [xml]);
    const parsed = parsedResult.data;
    const isCorrectionInvoice = parsed?.invoiceType?.startsWith("KOR") || false;
    if (loading) {
        return (react_1.default.createElement(react_bootstrap_1.Container, { className: "py-4" },
            react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-2" }),
            "Generowanie podgl\u0105du PDF..."));
    }
    if (error || parsedResult.parseError) {
        return (react_1.default.createElement(react_bootstrap_1.Container, { className: "py-4" },
            react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger" }, error || parsedResult.parseError),
            react_1.default.createElement(react_router_dom_1.Link, { to: `/invoice/${id}` }, "Wr\u00F3\u0107 do faktury")));
    }
    if (!parsed) {
        return (react_1.default.createElement(react_bootstrap_1.Container, { className: "py-4" },
            react_1.default.createElement(react_bootstrap_1.Alert, { variant: "warning" }, "Brak danych podgl\u0105du.")));
    }
    return (react_1.default.createElement(react_bootstrap_1.Container, { className: "py-3 invoice-preview-page" },
        react_1.default.createElement("style", null, `
                @media print {
                    @page {
                        size: A4;
                        margin: 10mm;
                    }
                    body > #root .navbar.sticky-top,
                    body > #root .navbar.mt-auto,
                    body > .good-tip-toast-wrapper,
                    body > .toast-container {
                        display: none !important;
                    }
                    .no-print { display: none !important; }
                    .invoice-preview-page > :not(.invoice-sheet) {
                        display: none !important;
                    }
                    body { background: #fff !important; }
                    .invoice-preview-page { padding: 0 !important; }
                    .invoice-sheet {
                        width: 190mm !important;
                        max-width: 190mm !important;
                        margin: 0 auto !important;
                        box-shadow: none !important;
                        border: 1px solid #666 !important;
                        break-inside: avoid;
                        page-break-inside: avoid;
                    }
                }
                .invoice-sheet {
                    max-width: 190mm;
                    margin: 0 auto;
                    border: 1px solid #d0d0d0;
                    box-shadow: 0 6px 18px rgba(0,0,0,0.08);
                }
                .invoice-ksef-title {
                    letter-spacing: 0.04em;
                    font-weight: 700;
                }
                .preview-badge {
                    display: inline-block;
                    padding: 0.2rem 0.5rem;
                    border: 1px solid #999;
                    border-radius: 999px;
                    font-size: 0.75rem;
                }
                .invoice-mono {
                    font-family: Consolas, "Courier New", monospace;
                }
            `),
        react_1.default.createElement("div", { className: "d-flex justify-content-between align-items-center mb-3 no-print" },
            react_1.default.createElement("div", null,
                react_1.default.createElement("h5", { className: "mb-1" }, "Podgl\u0105d faktury do PDF"),
                react_1.default.createElement("div", { className: "text-muted small" }, "Widok generowany z aktualnego XML")),
            react_1.default.createElement("div", { className: "d-flex gap-2" },
                react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", onClick: () => navigate(`/invoice/${id}`) }, "Wr\u00F3\u0107"),
                react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: () => window.print() }, "Drukuj / Zapisz PDF"))),
        react_1.default.createElement(react_bootstrap_1.Card, { className: "invoice-sheet" },
            react_1.default.createElement(react_bootstrap_1.Card.Body, null,
                react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement("div", { className: "invoice-ksef-title" }, "FAKTURA (podgl\u0105d)"),
                        react_1.default.createElement("div", { className: "text-muted small" }, "To nie jest dokument, tylko podgl\u0105d danych przed wys\u0142aniem do KSeF")),
                    react_1.default.createElement(react_bootstrap_1.Col, { className: "text-end" },
                        react_1.default.createElement("div", { className: "mb-2" },
                            react_1.default.createElement("span", { className: "preview-badge" }, parsed.invoiceType || "VAT")),
                        react_1.default.createElement("div", null,
                            react_1.default.createElement("strong", null, "Numer:"),
                            " ",
                            react_1.default.createElement("span", { className: "invoice-mono" }, parsed.invoiceNumber || "-")),
                        react_1.default.createElement("div", null,
                            react_1.default.createElement("strong", null, "Data wystawienia:"),
                            " ",
                            parsed.issueDate || "-"),
                        react_1.default.createElement("div", null,
                            react_1.default.createElement("strong", null, "Data sprzeda\u017Cy:"),
                            " ",
                            parsed.saleDate || "-"),
                        isCorrectionInvoice && parsed.correctionType && (react_1.default.createElement("div", null,
                            react_1.default.createElement("strong", null, "Typ korekty:"),
                            " ",
                            getCorrectionTypeLabel(parsed.correctionType))))),
                react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 6 },
                        react_1.default.createElement(react_bootstrap_1.Card, null,
                            react_1.default.createElement(react_bootstrap_1.Card.Header, { className: "py-2" },
                                react_1.default.createElement("strong", null, "Sprzedawca (Podmiot1)")),
                            react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "py-2" },
                                react_1.default.createElement("div", null,
                                    react_1.default.createElement("strong", null, parsed.seller.name || "-")),
                                react_1.default.createElement("div", null,
                                    "NIP: ",
                                    react_1.default.createElement("span", { className: "invoice-mono" }, parsed.seller.nip || "-")),
                                react_1.default.createElement("div", null, parsed.seller.line1 || "-"),
                                react_1.default.createElement("div", null, parsed.seller.line2 || "")))),
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 6 },
                        react_1.default.createElement(react_bootstrap_1.Card, null,
                            react_1.default.createElement(react_bootstrap_1.Card.Header, { className: "py-2" },
                                react_1.default.createElement("strong", null, "Nabywca (Podmiot2)")),
                            react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "py-2" },
                                react_1.default.createElement("div", null,
                                    react_1.default.createElement("strong", null, parsed.buyer.name || "-")),
                                react_1.default.createElement("div", null,
                                    "NIP: ",
                                    react_1.default.createElement("span", { className: "invoice-mono" }, parsed.buyer.nip || "-")),
                                react_1.default.createElement("div", null, parsed.buyer.line1 || "-"),
                                react_1.default.createElement("div", null, parsed.buyer.line2 || ""),
                                react_1.default.createElement("div", { className: "mt-2 small" },
                                    react_1.default.createElement("div", null,
                                        "Faktura dotyczy jednostki podrz\u0119dnej JST: ",
                                        parsed.buyer.jst),
                                    react_1.default.createElement("div", null,
                                        "Faktura dotyczy cz\u0142onka grupy GV: ",
                                        parsed.buyer.gv)))))),
                parsed.thirdParties.length > 0 && (react_1.default.createElement(react_bootstrap_1.Row, { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Col, null,
                        react_1.default.createElement(react_bootstrap_1.Card, null,
                            react_1.default.createElement(react_bootstrap_1.Card.Header, { className: "py-2" },
                                react_1.default.createElement("strong", null, "Podmioty trzecie (Podmiot3)")),
                            react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "py-2" }, parsed.thirdParties.map((thirdParty, index) => (react_1.default.createElement("div", { key: `third-party-${index}`, className: index > 0 ? "mt-3 pt-3 border-top" : "" },
                                react_1.default.createElement("div", null,
                                    react_1.default.createElement("strong", null,
                                        "Podmiot ",
                                        index + 1),
                                    thirdParty.role ? ` (Rola: ${getThirdPartyRoleLabel(thirdParty.role)})` : ""),
                                react_1.default.createElement("div", null,
                                    react_1.default.createElement("strong", null, thirdParty.name || "-")),
                                react_1.default.createElement("div", null, thirdParty.nip
                                    ? react_1.default.createElement(react_1.default.Fragment, null,
                                        "NIP: ",
                                        react_1.default.createElement("span", { className: "invoice-mono" }, thirdParty.nip))
                                    : react_1.default.createElement(react_1.default.Fragment, null,
                                        "ID wew.: ",
                                        react_1.default.createElement("span", { className: "invoice-mono" }, thirdParty.internalId || "-"))),
                                thirdParty.line1 && react_1.default.createElement("div", null, thirdParty.line1),
                                thirdParty.line2 && react_1.default.createElement("div", null, thirdParty.line2))))))))),
                react_1.default.createElement("div", { className: "mb-2" },
                    react_1.default.createElement("strong", null, "Pozycje faktury")),
                react_1.default.createElement(react_bootstrap_1.Table, { bordered: true, size: "sm", responsive: true },
                    react_1.default.createElement("thead", null,
                        react_1.default.createElement("tr", null,
                            react_1.default.createElement("th", null, "Lp."),
                            react_1.default.createElement("th", null, "Nazwa"),
                            react_1.default.createElement("th", null, "Il."),
                            react_1.default.createElement("th", null, "JM"),
                            react_1.default.createElement("th", null, "Cena netto"),
                            react_1.default.createElement("th", null, "Warto\u015B\u0107 netto"),
                            react_1.default.createElement("th", null, "VAT"))),
                    react_1.default.createElement("tbody", null, parsed.items.map((item, idx) => (react_1.default.createElement("tr", { key: `preview-item-${idx}` },
                        react_1.default.createElement("td", null, item.lineNo || idx + 1),
                        react_1.default.createElement("td", null, item.name),
                        react_1.default.createElement("td", { className: "text-end invoice-mono" }, item.quantity),
                        react_1.default.createElement("td", null, item.unit),
                        react_1.default.createElement("td", { className: "text-end invoice-mono" }, item.unitPrice),
                        react_1.default.createElement("td", { className: "text-end invoice-mono" }, item.netValue),
                        react_1.default.createElement("td", { className: "text-end invoice-mono" }, item.vatRate)))))),
                react_1.default.createElement(react_bootstrap_1.Row, null,
                    react_1.default.createElement(react_bootstrap_1.Col, { md: { span: 4, offset: 8 } },
                        react_1.default.createElement(react_bootstrap_1.Card, null,
                            react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "py-2" },
                                react_1.default.createElement("div", { className: "d-flex justify-content-between" },
                                    react_1.default.createElement("strong", null, "Razem brutto"),
                                    react_1.default.createElement("strong", { className: "invoice-mono" },
                                        parsed.totalGross || "0.00",
                                        " PLN")))))),
                react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-3" },
                    react_1.default.createElement(react_bootstrap_1.Col, { md: 12 },
                        react_1.default.createElement(react_bootstrap_1.Card, null,
                            react_1.default.createElement(react_bootstrap_1.Card.Header, { className: "py-2" },
                                react_1.default.createElement("strong", null, "P\u0142atno\u015B\u0107")),
                            react_1.default.createElement(react_bootstrap_1.Card.Body, { className: "py-2" },
                                react_1.default.createElement(react_bootstrap_1.Row, null,
                                    react_1.default.createElement(react_bootstrap_1.Col, { md: 4 },
                                        react_1.default.createElement("div", null,
                                            react_1.default.createElement("strong", null, "Termin p\u0142atno\u015Bci:")),
                                        react_1.default.createElement("div", null, parsed.paymentDeadline || react_1.default.createElement("span", { className: "text-muted" }, "(puste)"))),
                                    react_1.default.createElement(react_bootstrap_1.Col, { md: 4 },
                                        react_1.default.createElement("div", null,
                                            react_1.default.createElement("strong", null, "Numer konta:")),
                                        react_1.default.createElement("div", { className: "invoice-mono" }, parsed.bankAccount || react_1.default.createElement("span", { className: "text-muted" }, "(puste)"))),
                                    react_1.default.createElement(react_bootstrap_1.Col, { md: 4 },
                                        react_1.default.createElement("div", null,
                                            react_1.default.createElement("strong", null, "Bank:")),
                                        react_1.default.createElement("div", null, parsed.bankName || react_1.default.createElement("span", { className: "text-muted" }, "(puste)"))))))))))));
}
