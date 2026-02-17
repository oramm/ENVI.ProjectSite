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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodTipToast = void 0;
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const react_dom_1 = require("react-dom");
require("./GoodTipToast.css");
const tips = [
    "Używaj krótkich nazw folderów i plików - zamieniaj niektóre słowa na skróty, wyrzucaj zbędne słowa.",
    "Aktualizuj statusy kamieni milowych i kontraktów na bieżąco.",
    "Aktualizuj daty zakończenia kamieni i kontraktów.",
];
function GoodTipToast({ delay = 5000 }) {
    const [isVisible, setIsVisible] = (0, react_1.useState)(false);
    const [tip, setTip] = (0, react_1.useState)('');
    const [isPaused, setIsPaused] = (0, react_1.useState)(false);
    const toastWrapperRef = (0, react_1.useRef)(null);
    const timerRef = (0, react_1.useRef)(null);
    const progressIntervalRef = (0, react_1.useRef)(null);
    const startTimeRef = (0, react_1.useRef)(0);
    const remainingTimeRef = (0, react_1.useRef)(delay);
    (0, react_1.useEffect)(() => {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        setTip(randomTip);
        setTimeout(() => setIsVisible(true), 100);
    }, []);
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
    }, [isPaused, isVisible]);
    (0, react_1.useEffect)(() => {
        if (!isVisible || isPaused) {
            if (progressIntervalRef.current)
                clearInterval(progressIntervalRef.current);
            return;
        }
        const intervalTime = 50;
        progressIntervalRef.current = setInterval(() => {
            const elapsedTime = Date.now() - startTimeRef.current;
            const totalElapsedTime = (delay - remainingTimeRef.current) + elapsedTime;
            const percentage = (totalElapsedTime / delay) * 100;
            if (toastWrapperRef.current) {
                toastWrapperRef.current.style.setProperty('--progress-width', `${Math.min(percentage, 100)}%`);
            }
            if (totalElapsedTime >= delay) {
                if (progressIntervalRef.current)
                    clearInterval(progressIntervalRef.current);
            }
        }, intervalTime);
        return () => {
            if (progressIntervalRef.current)
                clearInterval(progressIntervalRef.current);
        };
    }, [isPaused, isVisible, delay]);
    if (typeof document === 'undefined')
        return null;
    return (0, react_dom_1.createPortal)(react_1.default.createElement(react_bootstrap_1.ToastContainer, { position: "bottom-end", className: "p-3", style: { zIndex: 1050, overflowX: 'hidden', position: 'fixed', right: 0, bottom: 0 } },
        react_1.default.createElement("div", { ref: toastWrapperRef, className: `good-tip-toast-wrapper ${isVisible ? 'show' : 'hide'}` },
            react_1.default.createElement(react_bootstrap_1.Toast, { onClose: () => setIsVisible(false), show: true, autohide: false, onMouseEnter: () => setIsPaused(true), onMouseLeave: () => setIsPaused(false) },
                react_1.default.createElement(react_bootstrap_1.Toast.Header, { closeButton: true },
                    react_1.default.createElement("strong", { className: "me-auto" }, "Dobra rada")),
                react_1.default.createElement(react_bootstrap_1.Toast.Body, { className: "good-tip-toast-body" }, tip)))), document.body);
}
exports.GoodTipToast = GoodTipToast;
