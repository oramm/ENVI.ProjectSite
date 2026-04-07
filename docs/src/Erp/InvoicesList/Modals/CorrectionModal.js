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
exports.default = CorrectionModal;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const Tools_1 = __importDefault(require("../../../React/Tools/Tools"));
const InvoicesController_1 = require("../InvoicesController");
// Typy korekty KSeF
const KSEF_CORRECTION_TYPES = {
    1: "Skutek w dacie faktury pierwotnej (błąd rachunkowy)",
    2: "Skutek w dacie korekty (rabat, zwrot)",
    3: "Inna data",
};
function CorrectionModal({ show, onHide, invoice, onCorrectionCreated, }) {
    const [correctionType, setCorrectionType] = (0, react_1.useState)("zero");
    const [correctionReason, setCorrectionReason] = (0, react_1.useState)("");
    const [ksefCorrectionType, setKsefCorrectionType] = (0, react_1.useState)(2);
    const [customItems, setCustomItems] = (0, react_1.useState)([
        { description: "", quantity: "1", unitPrice: "0", vatTax: 23 },
    ]);
    const [attachment, setAttachment] = (0, react_1.useState)(null);
    const [originalItems, setOriginalItems] = (0, react_1.useState)([]);
    const [loadingItems, setLoadingItems] = (0, react_1.useState)(false);
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const [step, setStep] = (0, react_1.useState)("create");
    const [createdCorrection, setCreatedCorrection] = (0, react_1.useState)(null);
    const resetForm = () => {
        setCorrectionType("zero");
        setCorrectionReason("");
        setKsefCorrectionType(2);
        setCustomItems([{ description: "", quantity: 1, unitPrice: 0, vatTax: 23 }]);
        setOriginalItems([]);
        setError(null);
        setStep("create");
        setCreatedCorrection(null);
    };
    // Pobierz pozycje oryginalnej faktury przy otwarciu modala lub zmianie typu korekty
    (0, react_1.useEffect)(() => {
        if (show && correctionType === "custom" && originalItems.length === 0) {
            loadOriginalItems();
        }
    }, [show, correctionType]);
    const loadOriginalItems = async () => {
        setLoadingItems(true);
        try {
            const items = await InvoicesController_1.invoiceItemsRepository.loadItemsFromServerPOST([{ invoiceId: invoice.id }], undefined, { skipCache: true });
            setOriginalItems(items || []);
            // Wypełnij customItems danymi z oryginalnej faktury (z ujemnymi wartościami dla pełnej korekty)
            if (items && items.length > 0) {
                setCustomItems(items.map((item) => ({
                    description: item.description,
                    quantity: -item.quantity, // Ujemna ilość = anulowanie pozycji
                    unitPrice: item.unitPrice,
                    vatTax: item.vatTax,
                })));
            }
        }
        catch (err) {
            console.error("Błąd pobierania pozycji faktury:", err);
        }
        finally {
            setLoadingItems(false);
        }
    };
    const handleClose = () => {
        resetForm();
        onHide();
    };
    const addCustomItem = () => {
        setCustomItems([...customItems, { description: "", quantity: "1", unitPrice: "0", vatTax: 23 }]);
    };
    const removeCustomItem = (index) => {
        setCustomItems(customItems.filter((_, i) => i !== index));
    };
    const updateCustomItem = (index, field, value) => {
        const updated = [...customItems];
        if (field === "description") {
            updated[index][field] = value;
        }
        else {
            // keep raw string while user types (allows entering '-' or partial decimals)
            updated[index][field] = value;
        }
        setCustomItems(updated);
    };
    // Krok 1: Utwórz korektę w systemie
    const handleCreateCorrection = async () => {
        if (!correctionReason.trim()) {
            setError("Przyczyna korekty jest wymagana");
            return;
        }
        if (correctionType === "custom" && customItems.length === 0) {
            setError("Dodaj co najmniej jedną pozycję korekty");
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const currentPerson = MainSetupReact_1.default.getCurrentUserAsPerson();
            // Debug logging
            console.log("📋 CorrectionModal - Creating correction:", {
                correctionType,
                correctionTypeType: typeof correctionType,
                correctionReason,
                ownerId: currentPerson?.id,
            });
            const formData = new FormData();
            formData.append("correctionType", correctionType);
            formData.append("correctionReason", correctionReason.trim());
            if (currentPerson?.id)
                formData.append("ownerId", String(currentPerson.id));
            if (correctionType === "custom") {
                const filtered = customItems.filter((item) => item.description.trim());
                const converted = filtered.map((item) => {
                    const quantity = Number(item.quantity);
                    const unitPrice = Number(item.unitPrice);
                    const vatTax = Number(item.vatTax);
                    if (!isFinite(quantity) || !isFinite(unitPrice) || !isFinite(vatTax)) {
                        throw new Error("Nieprawidłowe wartości w pozycjach korekty");
                    }
                    return {
                        description: item.description.trim(),
                        quantity,
                        unitPrice,
                        vatTax,
                    };
                });
                formData.append("customItems", JSON.stringify(converted));
            }
            if (attachment) {
                formData.append("file", attachment);
            }
            const response = await fetch(`${MainSetupReact_1.default.serverUrl}invoice/${invoice.id}/correction`, {
                method: "POST",
                credentials: "include",
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || "Błąd tworzenia korekty");
            }
            const result = await response.json();
            console.log("Correction create response:", result);
            if (!result || !result.correctionInvoice || !result.correctionInvoice.id) {
                setError("Otrzymano niepełną odpowiedź z serwera: brak id utworzonej korekty");
                setLoading(false);
                return;
            }
            setCreatedCorrection(result.correctionInvoice);
            // Jeśli oryginalna faktura ma numer KSeF, przejdź do kroku wysyłki
            if (invoice.ksefNumber) {
                setStep("send");
            }
            else {
                // Faktura bez KSeF - zakończ
                onCorrectionCreated(result.correctionInvoice);
                handleClose();
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Błąd tworzenia korekty");
        }
        finally {
            setLoading(false);
        }
    };
    // Krok 2: Wyślij korektę do KSeF
    const handleSendToKsef = async () => {
        if (!createdCorrection || !invoice.ksefNumber)
            return;
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`${MainSetupReact_1.default.serverUrl}invoice/${createdCorrection.id}/ksef/correction`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    originalKsefNumber: invoice.ksefNumber,
                    correctionReason: correctionReason.trim(),
                    correctionType: ksefCorrectionType,
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.message || "Błąd wysyłki do KSeF");
            }
            const result = await response.json();
            // Zaktualizuj korektę z danymi KSeF
            const updatedCorrection = {
                ...createdCorrection,
                ksefStatus: "PENDING_CORRECTION",
                ksefSessionId: result.referenceNumber,
            };
            onCorrectionCreated(updatedCorrection);
            handleClose();
        }
        catch (err) {
            setError(err instanceof Error ? err.message : "Błąd wysyłki do KSeF");
        }
        finally {
            setLoading(false);
        }
    };
    // Pomiń wysyłkę do KSeF
    const handleSkipKsef = () => {
        if (createdCorrection) {
            onCorrectionCreated(createdCorrection);
        }
        handleClose();
    };
    return (react_1.default.createElement(react_bootstrap_1.Modal, { show: show, onHide: handleClose, size: "lg" },
        react_1.default.createElement(react_bootstrap_1.Modal.Header, { closeButton: true },
            react_1.default.createElement(react_bootstrap_1.Modal.Title, null, step === "create" ? "Utwórz fakturę korygującą" : "Wyślij korektę do KSeF")),
        react_1.default.createElement(react_bootstrap_1.Modal.Body, null,
            error && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "danger", onClose: () => setError(null), dismissible: true }, error)),
            step === "create" && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_bootstrap_1.Alert, { variant: "info" },
                    react_1.default.createElement("strong", null, "Faktura \u017Ar\u00F3d\u0142owa:"),
                    " ",
                    invoice.number || `#${invoice.id}`,
                    react_1.default.createElement("br", null),
                    react_1.default.createElement("strong", null, "Warto\u015B\u0107 netto:"),
                    " ",
                    invoice._totalNetValue ? Tools_1.default.formatNumber(invoice._totalNetValue) + " zł" : "-",
                    invoice.ksefNumber && (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("br", null),
                        react_1.default.createElement("strong", null, "Nr KSeF:"),
                        " ",
                        react_1.default.createElement("code", null, invoice.ksefNumber)))),
                react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null,
                        react_1.default.createElement("strong", null, "Typ korekty")),
                    react_1.default.createElement("div", null,
                        react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "radio", id: "correction-zero", name: "correctionType", value: "zero", label: "Wyzeruj ca\u0142\u0105 faktur\u0119 (anulowanie)", checked: correctionType === "zero", onChange: (e) => {
                                console.log("Radio zero changed:", e.target.value);
                                setCorrectionType("zero");
                            } }),
                        react_1.default.createElement(react_bootstrap_1.Form.Check, { type: "radio", id: "correction-custom", name: "correctionType", value: "custom", label: "Podaj w\u0142asne pozycje korekty", checked: correctionType === "custom", onChange: (e) => {
                                console.log("Radio custom changed:", e.target.value);
                                setCorrectionType("custom");
                            } }))),
                react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null,
                        react_1.default.createElement("strong", null, "Przyczyna korekty"),
                        " ",
                        react_1.default.createElement("span", { className: "text-danger" }, "*")),
                    react_1.default.createElement(react_bootstrap_1.Form.Control, { as: "textarea", rows: 2, value: correctionReason, onChange: (e) => setCorrectionReason(e.target.value), placeholder: "Np. B\u0142\u0105d w cenie, Zwrot towaru, Rabat...", required: true })),
                correctionType === "custom" && (react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null,
                        react_1.default.createElement("strong", null, "Pozycje korekty")),
                    loadingItems ? (react_1.default.createElement("div", { className: "text-center py-3" },
                        react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm" }),
                        " \u0141adowanie pozycji...")) : (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement(react_bootstrap_1.Alert, { variant: "secondary", className: "mb-3" },
                            react_1.default.createElement("strong", null, "\uD83D\uDCCB Jak dzia\u0142a korekta pozycji:"),
                            react_1.default.createElement("ul", { className: "mb-0 mt-2" },
                                react_1.default.createElement("li", null,
                                    react_1.default.createElement("strong", null, "Ujemna ilo\u015B\u0107"),
                                    " = anulowanie pozycji (ca\u0142kowite lub cz\u0119\u015Bciowe)"),
                                react_1.default.createElement("li", null,
                                    react_1.default.createElement("strong", null, "Dodatnia ilo\u015B\u0107"),
                                    " = dodanie nowej pozycji do faktury"),
                                react_1.default.createElement("li", null,
                                    react_1.default.createElement("strong", null, "Zmiana ceny"),
                                    " = pozostaw ilo\u015B\u0107 ujemn\u0105 i wpisz now\u0105 cen\u0119 jednostkow\u0105")),
                            react_1.default.createElement("hr", { className: "my-2" }),
                            react_1.default.createElement("small", null,
                                react_1.default.createElement("strong", null, "Przyk\u0142ad:"),
                                " Je\u015Bli oryginalna faktura mia\u0142a pozycj\u0119 \"Us\u0142uga\" x 2 szt. po 100 z\u0142, a chcesz zmieni\u0107 cen\u0119 na 80 z\u0142, wpisz dwie pozycje:",
                                react_1.default.createElement("br", null),
                                "1. \"Us\u0142uga\" ilo\u015B\u0107: ",
                                react_1.default.createElement("code", null, "-2"),
                                ", cena: ",
                                react_1.default.createElement("code", null, "100"),
                                " (anulowanie starej)",
                                react_1.default.createElement("br", null),
                                "2. \"Us\u0142uga\" ilo\u015B\u0107: ",
                                react_1.default.createElement("code", null, "2"),
                                ", cena: ",
                                react_1.default.createElement("code", null, "80"),
                                " (nowa warto\u015B\u0107)",
                                react_1.default.createElement("br", null),
                                react_1.default.createElement("br", null),
                                react_1.default.createElement("strong", null, "Uwaga dotycz\u0105ca cz\u0119\u015Bciowych zmian:"),
                                react_1.default.createElement("br", null),
                                "Je\u017Celi faktura ma kilka pozycji, a chcesz zmieni\u0107 tylko jedn\u0105 z nich, nie musisz dodawa\u0107 pozosta\u0142ych pozycji do korekty. Korekta powinna zawiera\u0107 jedynie r\u00F3\u017Cnice: anulowanie starej pozycji (ujemna ilo\u015B\u0107) i ewentualne dodanie nowej pozycji (dodatnia ilo\u015B\u0107) z now\u0105 cen\u0105. Pozosta\u0142e pozycje nie powinny si\u0119 znale\u017A\u0107 w korekcie.")),
                        originalItems.length > 0 && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "info", className: "mb-2" },
                            react_1.default.createElement("small", null,
                                react_1.default.createElement("strong", null, "\u2139\uFE0F Poni\u017Cej wczytano pozycje z oryginalnej faktury z ujemnymi ilo\u015Bciami."),
                                react_1.default.createElement("br", null),
                                "Zmodyfikuj je wed\u0142ug potrzeb lub dodaj nowe pozycje."))),
                        react_1.default.createElement(react_bootstrap_1.Table, { size: "sm", bordered: true },
                            react_1.default.createElement("thead", null,
                                react_1.default.createElement("tr", null,
                                    react_1.default.createElement("th", null, "Opis"),
                                    react_1.default.createElement("th", { style: { width: "80px" } }, "Ilo\u015B\u0107"),
                                    react_1.default.createElement("th", { style: { width: "120px" } }, "Cena netto"),
                                    react_1.default.createElement("th", { style: { width: "80px" } }, "VAT %"),
                                    react_1.default.createElement("th", { style: { width: "50px" } }))),
                            react_1.default.createElement("tbody", null, customItems.map((item, index) => (react_1.default.createElement("tr", { key: index },
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement(react_bootstrap_1.Form.Control, { size: "sm", type: "text", value: item.description, onChange: (e) => updateCustomItem(index, "description", e.target.value), placeholder: "Opis pozycji" })),
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement(react_bootstrap_1.Form.Control, { size: "sm", type: "number", value: item.quantity, onChange: (e) => updateCustomItem(index, "quantity", e.target.value) })),
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement(react_bootstrap_1.Form.Control, { size: "sm", type: "number", step: "0.01", value: item.unitPrice, onChange: (e) => updateCustomItem(index, "unitPrice", e.target.value) })),
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement(react_bootstrap_1.Form.Select, { size: "sm", value: item.vatTax, onChange: (e) => updateCustomItem(index, "vatTax", e.target.value) },
                                        react_1.default.createElement("option", { value: 23 }, "23%"),
                                        react_1.default.createElement("option", { value: 8 }, "8%"),
                                        react_1.default.createElement("option", { value: 5 }, "5%"),
                                        react_1.default.createElement("option", { value: 0 }, "0%"))),
                                react_1.default.createElement("td", null,
                                    react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-danger", size: "sm", onClick: () => removeCustomItem(index), disabled: customItems.length === 1 }, "\u00D7"))))))),
                        react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", size: "sm", onClick: addCustomItem }, "+ Dodaj pozycj\u0119"))))),
                react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null,
                        react_1.default.createElement("strong", null, "Za\u0142\u0105cznik PDF (opcjonalnie)")),
                    react_1.default.createElement(react_bootstrap_1.Form.Control, { type: "file", accept: "application/pdf", onChange: (e) => {
                            const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
                            setAttachment(f);
                        } }),
                    attachment && (react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" },
                        "Wybrany plik: ",
                        attachment.name))))),
            step === "send" && createdCorrection && (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_bootstrap_1.Alert, { variant: "success" },
                    "\u2705 Korekta zosta\u0142a utworzona: ",
                    react_1.default.createElement("strong", null, createdCorrection.number || `#${createdCorrection.id}`)),
                react_1.default.createElement("p", null, "Oryginalna faktura ma numer KSeF. Czy chcesz wys\u0142a\u0107 korekt\u0119 do KSeF?"),
                react_1.default.createElement(react_bootstrap_1.Form.Group, { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Form.Label, null,
                        react_1.default.createElement("strong", null, "Typ korekty KSeF")),
                    react_1.default.createElement(react_bootstrap_1.Form.Select, { value: ksefCorrectionType, onChange: (e) => setKsefCorrectionType(Number(e.target.value)) }, Object.entries(KSEF_CORRECTION_TYPES).map(([value, label]) => (react_1.default.createElement("option", { key: value, value: value }, label)))),
                    react_1.default.createElement(react_bootstrap_1.Form.Text, { className: "text-muted" }, "Najcz\u0119\u015Bciej wybierany: typ 2 (skutek w dacie korekty)")),
                react_1.default.createElement(react_bootstrap_1.Alert, { variant: "secondary" },
                    react_1.default.createElement("strong", null, "Nr KSeF faktury \u017Ar\u00F3d\u0142owej:"),
                    react_1.default.createElement("br", null),
                    react_1.default.createElement("code", null, invoice.ksefNumber))))),
        react_1.default.createElement(react_bootstrap_1.Modal.Footer, null,
            react_1.default.createElement(react_bootstrap_1.Button, { variant: "secondary", onClick: handleClose, disabled: loading }, "Anuluj"),
            step === "create" && (react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleCreateCorrection, disabled: loading }, loading ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-2" }),
                "Tworzenie...")) : ("Utwórz korektę"))),
            step === "send" && (react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleSendToKsef, disabled: loading }, loading ? (react_1.default.createElement(react_1.default.Fragment, null,
                react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-2" }),
                "Wysy\u0142anie...")) : ("Wyślij do KSeF"))))));
}
