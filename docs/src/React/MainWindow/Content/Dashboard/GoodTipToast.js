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
exports.GoodTipToast = GoodTipToast;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_dom_1 = require("react-dom");
const MainSetupReact_1 = __importDefault(require("../../../MainSetupReact"));
require("./GoodTipToast.css");
const tipCategoryLabels = {
    general: 'Ogólne',
    lettersAi: 'Rozpoznawanie pism AI',
    invoices: 'Faktury',
    costInvoices: 'Faktury kosztowe',
};
const tips = [
    // Ogólne porady
    { text: "Używaj krótkich nazw folderów i plików - zamieniaj niektóre słowa na skróty, wyrzucaj zbędne słowa.", category: 'general' },
    { text: "Aktualizuj statusy kamieni milowych i kontraktów na bieżąco.", category: 'general' },
    { text: "Aktualizuj daty zakończenia kamieni i kontraktów.", category: 'general' },
    // Porady o analizie AI pism
    { text: "Rozpoznawanie pism AI uzupełnia: numer pisma, daty, opis, kontrakt. Zawsze sprawdź żółte pola (średnia pewność)!", isNew: true, category: 'lettersAi' },
    { text: "Aby poprawnie zaimportować dane z pisma, załączaj czytelne PDF - AI nie rozpozna słabych kopii i zeskanowanych dokumentów.", isNew: true, category: 'lettersAi' },
    { text: "Pola zielone = wysoka pewność AI. Pola żółte = sprawdź. Pola szare = brakuje danych, wypełnij.", isNew: true, category: 'lettersAi' },
    // Faktury i KSeF
    { text: "Po ustawieniu statusu \"Wysłana\" możliwe będzie wysłanie faktury do KSeF. Po pomyślnym przesłaniu możesz pobrać UPO jako potwierdzenie przyjęcia.", isNew: true, category: 'invoices' },
    { text: "Kliknij \"Pobierz z KSeF\" aby pobrać nowe faktury kosztowe. Wybierz tryb przyrostowy (zostaną pobrane faktury, od ostatniej aktualizacji) lub weryfikacyjny (wybrany zakres dat), aby upewnić się, czy żadna faktura nie została pominięta.", isNew: true, category: 'costInvoices' },
    { text: "Każdej fakturze kosztowej możesz przypisać kategorię kosztową oraz określić procent odliczenia VAT.", isNew: true, category: 'costInvoices' },
    { text: "W sekcji \"Raport miesięczny\" sprawdzisz zestawienie faktur kosztowych za wybrany miesiąc. Raport możesz wyeksportować do CSV lub XML.", isNew: true, category: 'costInvoices' },
];
function GoodTipToast({ delay = 5000 }) {
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const [tip, setTip] = (0, react_1.useState)({ text: '' });
    const [isPaused, setIsPaused] = (0, react_1.useState)(false);
    const toastWrapperRef = (0, react_1.useRef)(null);
    const systemRoleName = MainSetupReact_1.default.currentUserOrNull?.systemRoleName;
    const canViewInvoices = !!systemRoleName && ["ADMIN", "ENVI_MANAGER", "ENVI_EMPLOYEE"].includes(systemRoleName);
    const canViewCostInvoices = !!systemRoleName && ["ADMIN", "ENVI_MANAGER"].includes(systemRoleName);
    const tipCategoryLabel = tip.category ? tipCategoryLabels[tip.category] : null;
    const displayDuration = tip.isNew ? delay * 2 : delay;
    const timerRef = (0, react_1.useRef)(null);
    const progressIntervalRef = (0, react_1.useRef)(null);
    const startTimeRef = (0, react_1.useRef)(0);
    const remainingTimeRef = (0, react_1.useRef)(displayDuration);
    (0, react_1.useEffect)(() => {
        const availableTips = tips.filter((currentTip) => {
            if (currentTip.category === 'invoices')
                return canViewInvoices;
            if (currentTip.category === 'costInvoices')
                return canViewCostInvoices;
            return true;
        });
        const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)] ?? tips[0];
        remainingTimeRef.current = randomTip.isNew ? delay * 2 : delay;
        setTip(randomTip);
        setTimeout(() => setIsVisible(true), 100);
    }, [canViewCostInvoices, canViewInvoices, delay]);
    (0, react_1.useEffect)(() => {
        if (!isVisible)
            return;
        if (isPaused) {
            if (timerRef.current)
                clearTimeout(timerRef.current);
            const elapsedTime = Date.now() - startTimeRef.current;
            remainingTimeRef.current -= elapsedTime;
        }
        else {
            startTimeRef.current = Date.now();
            if (timerRef.current)
                clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => setIsVisible(false), remainingTimeRef.current);
        }
        return () => {
            if (timerRef.current)
                clearTimeout(timerRef.current);
        };
    }, [displayDuration, isPaused, isVisible]);
    (0, react_1.useEffect)(() => {
        if (!isVisible || isPaused) {
            if (progressIntervalRef.current)
                clearInterval(progressIntervalRef.current);
            return;
        }
        const intervalTime = 50;
        progressIntervalRef.current = setInterval(() => {
            const elapsedTime = Date.now() - startTimeRef.current;
            const totalElapsedTime = (displayDuration - remainingTimeRef.current) + elapsedTime;
            const percentage = (totalElapsedTime / displayDuration) * 100;
            if (toastWrapperRef.current) {
                toastWrapperRef.current.style.setProperty('--progress-width', `${Math.min(percentage, 100)}%`);
            }
            if (totalElapsedTime >= displayDuration) {
                if (progressIntervalRef.current)
                    clearInterval(progressIntervalRef.current);
            }
        }, intervalTime);
        return () => {
            if (progressIntervalRef.current)
                clearInterval(progressIntervalRef.current);
        };
    }, [displayDuration, isPaused, isVisible]);
    if (typeof document === 'undefined')
        return null;
    return (0, react_dom_1.createPortal)(react_1.default.createElement(react_bootstrap_1.ToastContainer, { position: "bottom-end", className: "p-3", style: { zIndex: 1050, overflowX: 'hidden', position: 'fixed', right: 0, bottom: 0 } },
        react_1.default.createElement("div", { ref: toastWrapperRef, className: `good-tip-toast-wrapper ${isVisible ? 'show' : 'hide'}` },
            react_1.default.createElement(react_bootstrap_1.Toast, { onClose: () => setIsVisible(false), show: true, autohide: false, onMouseEnter: () => setIsPaused(true), onMouseLeave: () => setIsPaused(false) },
                react_1.default.createElement(react_bootstrap_1.Toast.Header, { closeButton: true },
                    react_1.default.createElement("strong", { className: "me-auto" }, "Dobra rada"),
                    tipCategoryLabel && (react_1.default.createElement(react_bootstrap_1.Badge, { bg: "secondary", text: "light", pill: true, className: "ms-2 text-uppercase" }, tipCategoryLabel)),
                    tip.isNew && (react_1.default.createElement(react_bootstrap_1.Badge, { bg: "info", text: "light", pill: true, className: "ms-2" }, "nowe"))),
                react_1.default.createElement(react_bootstrap_1.Toast.Body, { className: "good-tip-toast-body" }, tip.text)))), document.body);
}
