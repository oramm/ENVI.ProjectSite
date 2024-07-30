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
const react_1 = __importStar(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const CommonComponents_1 = require("../Resultsets/CommonComponents");
function ConfirmModal({ show, onClose, title, prompt, onConfirm }) {
    const [isWaiting, setIsWaiting] = (0, react_1.useState)(false);
    const [isError, setIsError] = (0, react_1.useState)(false);
    const [errorMessage, setErrorMessage] = (0, react_1.useState)("");
    async function handleConfirmAndClose() {
        setIsWaiting(true);
        try {
            setIsError(false);
            await onConfirm();
            onClose();
        }
        catch (e) {
            setIsError(true);
            if (e instanceof Error) {
                setErrorMessage(e.message);
            }
            console.log(e);
        }
        setIsWaiting(false);
    }
    return (react_1.default.createElement(react_bootstrap_1.Modal, { show: show, onHide: onClose },
        react_1.default.createElement(react_bootstrap_1.Modal.Header, { closeButton: true },
            react_1.default.createElement(react_bootstrap_1.Modal.Title, null, title)),
        react_1.default.createElement(react_bootstrap_1.Modal.Body, null, prompt),
        react_1.default.createElement(react_bootstrap_1.Modal.Footer, null,
            react_1.default.createElement(react_bootstrap_1.Button, { variant: "secondary", onClick: onClose }, "Anuluj"),
            react_1.default.createElement(react_bootstrap_1.Button, { variant: "primary", onClick: handleConfirmAndClose },
                "Ok",
                isWaiting && react_1.default.createElement(react_bootstrap_1.Spinner, { as: "span", animation: "grow", size: "sm", role: "status", "aria-hidden": "true" })),
            isError && react_1.default.createElement(CommonComponents_1.AlertComponent, { message: errorMessage, type: "danger" }))));
}
exports.default = ConfirmModal;
