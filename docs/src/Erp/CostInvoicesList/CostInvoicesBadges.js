"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostInvoiceStatusBadge = CostInvoiceStatusBadge;
exports.CategoryBadge = CategoryBadge;
exports.VatDeductionBadge = VatDeductionBadge;
exports.BookingPercentageBadge = BookingPercentageBadge;
exports.PaymentStatusBadge = PaymentStatusBadge;
exports.PaymentMethodBadge = PaymentMethodBadge;
exports.InvoiceTypeBadge = InvoiceTypeBadge;
const react_1 = __importDefault(require("react"));
const react_bootstrap_1 = require("react-bootstrap");
const CostInvoicesController_1 = require("./CostInvoicesController");
/**
 * Badge statusu faktury kosztowej
 */
function CostInvoiceStatusBadge({ status }) {
    let variant;
    let label;
    switch (status) {
        case CostInvoicesController_1.CostInvoiceStatuses.NEW:
            variant = "secondary";
            label = "Nowa";
            break;
        case CostInvoicesController_1.CostInvoiceStatuses.EXCLUDED:
            variant = "warning";
            label = "Poza kosztami";
            break;
        case CostInvoicesController_1.CostInvoiceStatuses.BOOKED:
            variant = "success";
            label = "Zaksięgowana";
            break;
        default:
            variant = "secondary";
            label = status;
    }
    const textColor = variant === "warning" ? "dark" : "light";
    return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textColor }, label));
}
/**
 * Badge kategorii kosztu z kolorem
 */
function CategoryBadge({ category }) {
    if (!category) {
        return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: "light", text: "dark", className: "border" }, "Brak kategorii"));
    }
    return (react_1.default.createElement(react_bootstrap_1.Badge, { style: {
            backgroundColor: category.color,
            color: getContrastColor(category.color),
        } }, category.name));
}
/**
 * Badge procentu odliczenia VAT
 */
function VatDeductionBadge({ percentage }) {
    let variant;
    if (percentage === 100) {
        variant = "success";
    }
    else if (percentage === 0) {
        variant = "danger";
    }
    else {
        variant = "warning";
    }
    return (react_1.default.createElement(react_bootstrap_1.OverlayTrigger, { placement: "top", overlay: react_1.default.createElement(react_bootstrap_1.Tooltip, { id: "vat-tooltip" },
            "Odliczenie VAT: ",
            percentage,
            "%") },
        react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: percentage === 0 || percentage === 100 ? "light" : "dark" },
            "VAT ",
            percentage,
            "%")));
}
/**
 * Badge procentu księgowania
 */
function BookingPercentageBadge({ percentage }) {
    if (percentage === 100) {
        return null; // Nie pokazuj badge dla 100%
    }
    return (react_1.default.createElement(react_bootstrap_1.OverlayTrigger, { placement: "top", overlay: react_1.default.createElement(react_bootstrap_1.Tooltip, { id: "booking-tooltip" },
            "Ksi\u0119gowane: ",
            percentage,
            "%") },
        react_1.default.createElement(react_bootstrap_1.Badge, { bg: "info", text: "light" },
            percentage,
            "%")));
}
/**
 * Badge statusu płatności faktury kosztowej
 */
function PaymentStatusBadge({ status, paidAmount, grossAmount, }) {
    const resolved = status ?? CostInvoicesController_1.PaymentStatuses.UNPAID;
    let variant;
    let textVariant;
    let label;
    let icon;
    switch (resolved) {
        case CostInvoicesController_1.PaymentStatuses.PAID:
            variant = "success";
            textVariant = "light";
            label = "Zapłacona";
            icon = "✓";
            break;
        case CostInvoicesController_1.PaymentStatuses.PARTIALLY_PAID: {
            const pct = grossAmount && paidAmount
                ? Math.round((paidAmount / grossAmount) * 100)
                : null;
            variant = "warning";
            textVariant = "dark";
            label = pct !== null ? `Częściowo ${pct}%` : "Częściowo";
            icon = "◑";
            break;
        }
        default:
            variant = "secondary";
            textVariant = "light";
            label = "Niezapłacona";
            icon = "●";
    }
    return (react_1.default.createElement(react_bootstrap_1.OverlayTrigger, { placement: "top", overlay: react_1.default.createElement(react_bootstrap_1.Tooltip, { id: "payment-status-tooltip" },
            "Status p\u0142atno\u015Bci: ",
            label,
            resolved === CostInvoicesController_1.PaymentStatuses.PARTIALLY_PAID && paidAmount !== undefined && grossAmount
                ? ` (${paidAmount.toFixed(2)} / ${grossAmount.toFixed(2)})`
                : "") },
        react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: textVariant },
            icon,
            " ",
            label)));
}
/**
 * Badge formy płatności wyciągniętej z KSeF.
 */
function PaymentMethodBadge({ paymentMethod }) {
    if (!paymentMethod) {
        return (react_1.default.createElement(react_bootstrap_1.Badge, { bg: "light", text: "dark", className: "border" }, "Brak formy platnosci"));
    }
    const normalized = normalizePaymentMethod(paymentMethod);
    const { icon, label, variant } = getPaymentMethodMeta(normalized, paymentMethod);
    return (react_1.default.createElement(react_bootstrap_1.OverlayTrigger, { placement: "top", overlay: react_1.default.createElement(react_bootstrap_1.Tooltip, { id: "payment-method-tooltip" },
            "Forma platnosci z KSeF: ",
            paymentMethod) },
        react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: variant === "warning" ? "dark" : "light" },
            icon,
            " ",
            label)));
}
function normalizePaymentMethod(paymentMethod) {
    return paymentMethod
        .trim()
        .toLocaleLowerCase("pl-PL")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}
function getPaymentMethodMeta(normalized, rawValue) {
    if (normalized.includes("przelew")) {
        return { icon: "🏦", label: "Przelew", variant: "primary" };
    }
    if (normalized.includes("gotowka")) {
        return { icon: "💵", label: "Gotowka", variant: "success" };
    }
    if (normalized.includes("karta")) {
        return { icon: "💳", label: "Karta", variant: "info" };
    }
    if (normalized.includes("mobil")) {
        return { icon: "📱", label: "Mobilna", variant: "warning" };
    }
    if (normalized.includes("bon")) {
        return { icon: "🎟️", label: "Bon", variant: "secondary" };
    }
    if (normalized.includes("czek")) {
        return { icon: "🧾", label: "Czek", variant: "secondary" };
    }
    if (normalized.includes("kredyt")) {
        return { icon: "🏷️", label: "Kredyt", variant: "secondary" };
    }
    return {
        icon: "•",
        label: rawValue,
        variant: "secondary",
    };
}
/**
 * Oblicza kontrastowy kolor tekstu dla danego tła
 */
function getContrastColor(hexColor) {
    // Usuń # jeśli jest
    const hex = hexColor.replace("#", "");
    // Konwertuj do RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    // Oblicz luminancję
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? "#000000" : "#FFFFFF";
}
/**
 * Mapowanie kodów KSeF → etykieta i wariant koloru.
 */
const INVOICE_TYPE_META = {
    "VAT": { label: "VAT", variant: "primary" },
    "KOR": { label: "Korekta", variant: "warning" },
    "ZAL": { label: "Zaliczka", variant: "info" },
    "ROZ": { label: "Rozliczenie", variant: "info" },
    "UPR": { label: "Uproszczona", variant: "secondary" },
    "KOR_ZAL": { label: "Kor. zaliczki", variant: "warning" },
    "KOR_ROZ": { label: "Kor. rozliczenia", variant: "warning" },
};
/**
 * Badge rodzaju faktury (RodzajFaktury z KSeF FA(3))
 */
function InvoiceTypeBadge({ invoiceType }) {
    if (!invoiceType)
        return null;
    const key = invoiceType.trim().toUpperCase();
    const meta = INVOICE_TYPE_META[key];
    const variant = meta?.variant ?? "secondary";
    const label = meta?.label ?? invoiceType;
    return (react_1.default.createElement(react_bootstrap_1.OverlayTrigger, { placement: "top", overlay: react_1.default.createElement(react_bootstrap_1.Tooltip, { id: "invoice-type-tooltip" },
            "Rodzaj faktury z KSeF: ",
            invoiceType) },
        react_1.default.createElement(react_bootstrap_1.Badge, { bg: variant, text: variant === "warning" ? "dark" : "light" }, label)));
}
