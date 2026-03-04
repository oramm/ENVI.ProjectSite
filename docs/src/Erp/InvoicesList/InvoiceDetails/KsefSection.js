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
exports.default = KsefSection;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const ToolsDate_1 = __importDefault(require("../../../React/Tools/ToolsDate"));
const MainSetupReact_1 = __importDefault(require("../../../React/MainSetupReact"));
const react_router_dom_1 = require("react-router-dom");
function KsefSection({ invoice, onInvoiceUpdate, correctedInvoiceNumber }) {
    const [loading, setLoading] = (0, react_1.useState)(false);
    const [loadingMessage, setLoadingMessage] = (0, react_1.useState)("");
    const [alert, setAlert] = (0, react_1.useState)(null);
    const [statusDetails, setStatusDetails] = (0, react_1.useState)(null);
    const pollingRef = (0, react_1.useRef)(null);
    // Faktura jest korektą jeśli ma ustawione correctedInvoiceId
    const isCorrectionInvoice = !!invoice.correctedInvoiceId;
    // Sprawdź czy przycisk "Wyślij do KSeF" powinien być widoczny
    const canSendToKsef = (0, react_1.useCallback)(() => {
        // Nie pokazuj jeśli faktura już ma numer KSeF
        if (invoice.ksefNumber)
            return false;
        // Nie pokazuj jeśli faktura została już wysłana do KSeF
        if (invoice.ksefStatus)
            return false;
        // Nie pokazuj jeśli faktura ma już sessionId (była wysłana)
        if (invoice.ksefSessionId)
            return false;
        // Dla korekty - nie używaj tego przycisku (wysyłka korekty jest przez CorrectionModal)
        if (isCorrectionInvoice)
            return false;
        // Pokaż tylko gdy faktura jest ustawiona jako "Wysłana" (SENT)
        return invoice.status === MainSetupReact_1.default.InvoiceStatuses.SENT;
    }, [invoice.ksefNumber, invoice.ksefStatus, invoice.ksefSessionId, invoice.status, isCorrectionInvoice]);
    // Sprawdź czy można pobrać UPO - tylko gdy faktycznie ma numer KSeF
    const canDownloadUpo = !!invoice.ksefNumber && invoice.ksefNumber.trim().length > 0;
    // Funkcja do wysyłania faktury do KSeF
    const sendToKsef = async () => {
        setLoading(true);
        setLoadingMessage("Wysyłanie do KSeF...");
        setAlert(null);
        setStatusDetails(null);
        try {
            const sendResponse = await fetch(`${MainSetupReact_1.default.serverUrl}invoice/${invoice.id}/ksef/send`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
            });
            if (!sendResponse.ok) {
                const errorData = await sendResponse.json();
                if (sendResponse.status === 400 && errorData.details) {
                    const detailsList = errorData.details.join("\n• ");
                    throw new Error(`Błąd walidacji:\n• ${detailsList}`);
                }
                const errorMessage = errorData.error
                    || errorData.errorMessage
                    || errorData.message
                    || `Błąd serwera (${sendResponse.status})`;
                const details = errorData.details
                    ? `\n\nSzczegóły:\n• ${errorData.details.join("\n• ")}`
                    : "";
                throw new Error(errorMessage + details);
            }
            const sendResult = await sendResponse.json();
            const updatedInvoice = {
                ...invoice,
                ksefStatus: "PENDING",
                ksefSessionId: sendResult.referenceNumber,
            };
            onInvoiceUpdate(updatedInvoice);
            setAlert({
                type: "info",
                message: sendResult.message,
            });
            setLoadingMessage("Sprawdzanie statusu w KSeF...");
            startStatusPolling();
        }
        catch (error) {
            setLoading(false);
            setLoadingMessage("");
            setAlert({
                type: "danger",
                message: error instanceof Error ? error.message : "Błąd wysyłki do KSeF",
            });
        }
    };
    // Polling statusu KSeF
    const startStatusPolling = (0, react_1.useCallback)(() => {
        let attempts = 0;
        const maxAttempts = 10;
        const pollingInterval = 3000;
        const checkStatus = async () => {
            attempts++;
            try {
                const statusResponse = await fetch(`${MainSetupReact_1.default.serverUrl}invoice/${invoice.id}/ksef/status`, {
                    method: "GET",
                    credentials: "include",
                });
                if (!statusResponse.ok) {
                    const errorData = await statusResponse.json();
                    throw new Error(errorData.error || "Błąd sprawdzania statusu");
                }
                const statusResult = await statusResponse.json();
                setStatusDetails(statusResult);
                // Sukces - faktura przyjęta
                if (statusResult.ksefNumber || statusResult.status?.code === 200) {
                    stopPolling();
                    setLoading(false);
                    setLoadingMessage("");
                    const updatedInvoice = {
                        ...invoice,
                        ksefNumber: statusResult.ksefNumber,
                        ksefStatus: String(statusResult.status?.code || "200"),
                    };
                    onInvoiceUpdate(updatedInvoice);
                    setAlert({
                        type: "success",
                        message: `Faktura przyjęta w KSeF!\nNumer: ${statusResult.ksefNumber}`,
                    });
                    return;
                }
                // Duplikat
                if (statusResult.status?.code === 440) {
                    stopPolling();
                    setLoading(false);
                    setLoadingMessage("");
                    const originalNumber = statusResult.status.extensions?.originalKsefNumber;
                    setAlert({
                        type: "warning",
                        message: `Faktura już istnieje w KSeF${originalNumber ? `:\n${originalNumber}` : ""}`,
                    });
                    return;
                }
                // Kontynuuj polling jeśli status 100 (w przetwarzaniu)
                if (attempts < maxAttempts) {
                    pollingRef.current = setTimeout(checkStatus, pollingInterval);
                }
                else {
                    stopPolling();
                    setLoading(false);
                    setLoadingMessage("");
                    setAlert({
                        type: "info",
                        message: "Przetwarzanie trwa dłużej niż zwykle.\nSprawdź status później przyciskiem 'Odśwież status'.",
                    });
                }
            }
            catch (error) {
                stopPolling();
                setLoading(false);
                setLoadingMessage("");
                setAlert({
                    type: "danger",
                    message: error instanceof Error ? error.message : "Błąd sprawdzania statusu",
                });
            }
        };
        pollingRef.current = setTimeout(checkStatus, pollingInterval);
    }, [invoice, onInvoiceUpdate]);
    const stopPolling = () => {
        if (pollingRef.current) {
            clearTimeout(pollingRef.current);
            pollingRef.current = null;
        }
    };
    // Ręczne odświeżenie statusu
    const refreshStatus = async () => {
        setLoading(true);
        setLoadingMessage("Sprawdzanie statusu...");
        setAlert(null);
        try {
            const statusResponse = await fetch(`${MainSetupReact_1.default.serverUrl}invoice/${invoice.id}/ksef/status`, {
                method: "GET",
                credentials: "include",
            });
            if (!statusResponse.ok) {
                const errorData = await statusResponse.json();
                throw new Error(errorData.error || "Błąd sprawdzania statusu");
            }
            const statusResult = await statusResponse.json();
            setStatusDetails(statusResult);
            if (statusResult.ksefNumber) {
                const updatedInvoice = {
                    ...invoice,
                    ksefNumber: statusResult.ksefNumber,
                    ksefStatus: String(statusResult.status?.code || "200"),
                };
                onInvoiceUpdate(updatedInvoice);
                setAlert({
                    type: "success",
                    message: `Faktura przyjęta w KSeF!\nNumer: ${statusResult.ksefNumber}`,
                });
            }
            else if (statusResult.status?.code === 440) {
                const originalNumber = statusResult.status.extensions?.originalKsefNumber;
                setAlert({
                    type: "warning",
                    message: `Faktura już istnieje w KSeF${originalNumber ? `:\n${originalNumber}` : ""}`,
                });
            }
            else if (statusResult.status?.code === 100) {
                setAlert({
                    type: "info",
                    message: "Faktura w trakcie przetwarzania. Spróbuj ponownie za chwilę.",
                });
            }
            else {
                setAlert({
                    type: "info",
                    message: `Status: ${statusResult.status?.description || "Nieznany"}`,
                });
            }
        }
        catch (error) {
            setAlert({
                type: "danger",
                message: error instanceof Error ? error.message : "Błąd sprawdzania statusu",
            });
        }
        finally {
            setLoading(false);
            setLoadingMessage("");
        }
    };
    // Pobieranie UPO
    const downloadUpo = async () => {
        setAlert(null);
        try {
            const response = await fetch(`${MainSetupReact_1.default.serverUrl}invoice/${invoice.id}/ksef/upo`, {
                method: "GET",
                credentials: "include",
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error
                    || errorData.errorMessage
                    || errorData.message
                    || `Błąd pobierania UPO (${response.status})`;
                throw new Error(errorMessage);
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `UPO_faktura_${invoice.id}.xml`;
            link.target = "_blank";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            setAlert({
                type: "success",
                message: "UPO zostało pobrane",
            });
        }
        catch (error) {
            setAlert({
                type: "danger",
                message: error instanceof Error ? error.message : "Błąd pobierania UPO",
            });
        }
    };
    // Funkcja do renderowania statusu
    const renderStatus = () => {
        if (invoice.ksefNumber) {
            return react_1.default.createElement("span", { className: "text-success fw-bold" }, "\u2705 Przyj\u0119ta");
        }
        if (invoice.ksefStatus === "PENDING" || invoice.ksefStatus === "PENDING_CORRECTION") {
            return react_1.default.createElement("span", { className: "text-warning fw-bold" }, "\uD83D\uDFE1 Wys\u0142ana - oczekuje na potwierdzenie");
        }
        return react_1.default.createElement("span", { className: "text-muted" }, "\u26AA Nie wys\u0142ana");
    };
    // Formatowanie daty
    const formatDate = (dateString) => {
        if (!dateString)
            return "-";
        const date = new Date(dateString);
        return ToolsDate_1.default.dateToDDmmmYYYYHHMM(date.toISOString());
    };
    return (react_1.default.createElement(react_bootstrap_1.Container, { className: "mt-3 p-0" },
        react_1.default.createElement(react_bootstrap_1.Row, { className: "align-items-center mb-2" },
            react_1.default.createElement(react_bootstrap_1.Col, null,
                react_1.default.createElement("h6", { className: "mb-0" },
                    react_1.default.createElement("strong", null, "KSeF - Krajowy System e-Faktur")))),
        react_1.default.createElement(react_bootstrap_1.Row, { className: "bg-light p-3 rounded-3" },
            react_1.default.createElement(react_bootstrap_1.Col, null,
                alert && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: alert.type, onClose: () => setAlert(null), dismissible: true, style: { whiteSpace: "pre-wrap" } }, alert.message)),
                loading && (react_1.default.createElement("div", { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-2" }),
                    loadingMessage)),
                isCorrectionInvoice && (react_1.default.createElement(react_bootstrap_1.Alert, { variant: "info", className: "mb-3" },
                    react_1.default.createElement("strong", null, "\uD83D\uDCCB To jest faktura koryguj\u0105ca"),
                    react_1.default.createElement("br", null),
                    "Koryguje faktur\u0119:",
                    " ",
                    react_1.default.createElement(react_router_dom_1.Link, { to: `/invoice/${invoice.correctedInvoiceId}` }, invoice._correctedInvoice?.number || correctedInvoiceNumber || `#${invoice.correctedInvoiceId}`),
                    invoice.correctionReason && (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("br", null),
                        react_1.default.createElement("strong", null, "Przyczyna:"),
                        " ",
                        invoice.correctionReason)),
                    invoice.originalKsefNumber && (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement("br", null),
                        react_1.default.createElement("strong", null, "Nr KSeF faktury \u017Ar\u00F3d\u0142owej:"),
                        " ",
                        react_1.default.createElement("code", null, invoice.originalKsefNumber))))),
                react_1.default.createElement("div", { className: "mb-3" },
                    react_1.default.createElement(react_bootstrap_1.Row, null,
                        react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                            react_1.default.createElement("strong", null, "Status KSeF:")),
                        react_1.default.createElement(react_bootstrap_1.Col, { md: 9 }, renderStatus())),
                    invoice.ksefNumber && (react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-2" },
                        react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                            react_1.default.createElement("strong", null, "Numer KSeF:")),
                        react_1.default.createElement(react_bootstrap_1.Col, { md: 9 },
                            react_1.default.createElement("code", null, invoice.ksefNumber)))),
                    invoice.ksefSessionId && !invoice.ksefNumber && (react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-2" },
                        react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                            react_1.default.createElement("strong", null, "Nr referencyjny:")),
                        react_1.default.createElement(react_bootstrap_1.Col, { md: 9 },
                            react_1.default.createElement("code", { className: "small" }, invoice.ksefSessionId)))),
                    statusDetails?.acquisitionDate && (react_1.default.createElement(react_bootstrap_1.Row, { className: "mt-2" },
                        react_1.default.createElement(react_bootstrap_1.Col, { md: 3 },
                            react_1.default.createElement("strong", null, "Data przyj\u0119cia:")),
                        react_1.default.createElement(react_bootstrap_1.Col, { md: 9 }, formatDate(statusDetails.acquisitionDate))))),
                react_1.default.createElement("div", { className: "d-flex gap-2 flex-wrap" },
                    canSendToKsef() && (react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: sendToKsef, disabled: loading }, loading ? (react_1.default.createElement(react_1.default.Fragment, null,
                        react_1.default.createElement(react_bootstrap_1.Spinner, { animation: "border", size: "sm", className: "me-2" }),
                        "Wysy\u0142anie...")) : ("Wyślij do KSeF"))),
                    (invoice.ksefStatus || invoice.ksefSessionId) && (react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-secondary", onClick: refreshStatus, disabled: loading }, "Od\u015Bwie\u017C status")),
                    canDownloadUpo && (react_1.default.createElement(react_bootstrap_1.Button, { variant: "outline-success", onClick: downloadUpo, disabled: loading }, "\uD83D\uDCC4 Pobierz UPO")))))));
}
