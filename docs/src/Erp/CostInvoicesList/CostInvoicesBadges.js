"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyCostBadge = exports.PaidStatusBadge = exports.CostInvoiceStatusBadge = void 0;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const CostInvoicesController_1 = require("./CostInvoicesController");
/**
 * Badge statusu faktury kosztowej
 */
function CostInvoiceStatusBadge({ status }) {
    let variant;
    let textMode = "light";
    switch (status) {
        case CostInvoicesController_1.CostInvoiceStatuses.NEW:
            variant = "secondary";
            break;
        case CostInvoicesController_1.CostInvoiceStatuses.VERIFIED:
            variant = "info";
            break;
        case CostInvoicesController_1.CostInvoiceStatuses.APPROVED:
            variant = "success";
            break;
        case CostInvoicesController_1.CostInvoiceStatuses.REJECTED:
            variant = "danger";
            break;
        default:
            variant = "secondary";
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textMode }, status));
}
exports.CostInvoiceStatusBadge = CostInvoiceStatusBadge;
/**
 * Badge statusu płatności
 */
function PaidStatusBadge({ isPaid }) {
    if (isPaid) {
        return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: "success", text: "light" }, "\u2705 Zap\u0142acona"));
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: "warning", text: "dark" }, "\uD83D\uDCB3 Do zap\u0142aty"));
}
exports.PaidStatusBadge = PaidStatusBadge;
/**
 * Badge czy faktura jest kosztem firmy
 */
function CompanyCostBadge({ isCompanyCost }) {
    if (isCompanyCost) {
        return (react_1.default.createElement(react_bootstrap_1.OverlayTrigger, { placement: "top", overlay: react_1.default.createElement(react_bootstrap_1.Tooltip, { id: "cost-tooltip" }, "Faktura uwzgl\u0119dniana w kosztach firmy") },
            react_1.default.createElement(react_bootstrap_1.Badge, { bg: "primary", text: "light" }, "\uD83D\uDCCA Koszt")));
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: "light", text: "dark" }, "\u2298 Nie koszt"));
}
exports.CompanyCostBadge = CompanyCostBadge;
