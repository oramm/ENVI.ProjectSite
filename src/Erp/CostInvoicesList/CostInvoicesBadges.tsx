import React from "react";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CostInvoiceStatuses, PaymentStatuses, PaymentStatus } from "./CostInvoicesController";
import { CostInvoiceCategory } from "../../../Typings/bussinesTypes";
import ToolsDate from "../../React/Tools/ToolsDate";

/**
 * Badge statusu faktury kosztowej
 */
export function CostInvoiceStatusBadge({ status }: { status: string }) {
    let variant: string;
    let label: string;

    switch (status) {
        case CostInvoiceStatuses.NEW:
            variant = "secondary";
            label = "Nowa";
            break;
        case CostInvoiceStatuses.EXCLUDED:
            variant = "warning";
            label = "Poza kosztami";
            break;
        case CostInvoiceStatuses.BOOKED:
            variant = "success";
            label = "Zaksięgowana";
            break;
        default:
            variant = "secondary";
            label = status;
    }

    const textColor = variant === "warning" ? "dark" : "light";

    return (
        <Badge bg={variant} text={textColor}>
            {label}
        </Badge>
    );
}

export type WhiteListStatus = "NOT_CHECKED" | "VERIFIED_OK" | "VERIFIED_MISMATCH" | "ERROR" | "NOT_APPLICABLE";

/**
 * NIP-K2 — badge statusu weryfikacji Białej Listy VAT (KAS wl-api) dla faktury
 * kosztowej. Mirrors the FidmanSyncBadge idiom (see
 * ../../View/Resultsets/CommonComponents.tsx): status → Badge + optional
 * tooltip with the check details (date + KAS request id).
 */
export function WhiteListStatusBadge({
    status,
    checkedAt,
    requestId,
}: {
    status?: WhiteListStatus | null;
    checkedAt?: string | null;
    requestId?: string | null;
}) {
    const resolved = status || "NOT_CHECKED";

    const byStatus: Record<WhiteListStatus, { bg: string; text: string; label: string }> = {
        NOT_CHECKED: { bg: "secondary", text: "light", label: "Biała lista: nie sprawdzono" },
        VERIFIED_OK: { bg: "success", text: "light", label: "✅ Biała lista: OK" },
        VERIFIED_MISMATCH: { bg: "danger", text: "light", label: "⚠️ Biała lista: NIEZGODNOŚĆ" },
        ERROR: { bg: "warning", text: "dark", label: "⚠️ Biała lista: błąd sprawdzenia" },
        NOT_APPLICABLE: { bg: "secondary", text: "light", label: "Biała lista: nie dotyczy" },
    };
    const { bg, text, label } = byStatus[resolved];

    const badge = (
        <Badge bg={bg} text={text}>
            {label}
        </Badge>
    );

    if (!checkedAt && !requestId) return badge;

    return (
        <OverlayTrigger
            placement="top"
            overlay={
                <Tooltip id="white-list-tooltip">
                    {checkedAt && <div>Sprawdzono: {ToolsDate.dateYMDtoDMY(checkedAt)}</div>}
                    {requestId && <div>Nr wpisu KAS: {requestId}</div>}
                </Tooltip>
            }
        >
            {badge}
        </OverlayTrigger>
    );
}

/**
 * Badge kategorii kosztu z kolorem
 */
export function CategoryBadge({ category }: { category?: CostInvoiceCategory | null }) {
    if (!category) {
        return (
            <Badge bg="light" text="dark" className="border">
                Brak kategorii
            </Badge>
        );
    }

    return (
        <Badge
            style={{
                backgroundColor: category.color,
                color: getContrastColor(category.color),
            }}
        >
            {category.name}
        </Badge>
    );
}

/**
 * Badge procentu odliczenia VAT
 */
export function VatDeductionBadge({ percentage }: { percentage: number }) {
    let variant: string;
    if (percentage === 100) {
        variant = "success";
    } else if (percentage === 0) {
        variant = "danger";
    } else {
        variant = "warning";
    }

    return (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="vat-tooltip">Odliczenie VAT: {percentage}%</Tooltip>}
        >
            <Badge bg={variant} text={percentage === 0 || percentage === 100 ? "light" : "dark"}>
                VAT {percentage}%
            </Badge>
        </OverlayTrigger>
    );
}

/**
 * Badge procentu księgowania
 */
export function BookingPercentageBadge({ percentage }: { percentage: number }) {
    if (percentage === 100) {
        return null; // Nie pokazuj badge dla 100%
    }

    return (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="booking-tooltip">Księgowane: {percentage}%</Tooltip>}
        >
            <Badge bg="info" text="light">
                {percentage}%
            </Badge>
        </OverlayTrigger>
    );
}

/**
 * Badge statusu płatności faktury kosztowej
 */
export function PaymentStatusBadge({
    status,
    paidAmount,
    grossAmount,
}: {
    status?: PaymentStatus | null;
    paidAmount?: number;
    grossAmount?: number;
}) {
    const resolved = status ?? PaymentStatuses.UNPAID;

    let variant: string;
    let textVariant: string;
    let label: string;
    let icon: string;

    switch (resolved) {
        case PaymentStatuses.PAID:
            variant = "success";
            textVariant = "light";
            label = "Zapłacona";
            icon = "✓";
            break;
        case PaymentStatuses.NOT_APPLICABLE:
            variant = "info";
            textVariant = "light";
            label = "Nie dotyczy";
            icon = "–";
            break;
        case PaymentStatuses.PARTIALLY_PAID: {
            const pct =
                grossAmount && paidAmount
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

    return (
        <OverlayTrigger
            placement="top"
            overlay={
                <Tooltip id="payment-status-tooltip">
                    Status płatności: {label}
                    {resolved === PaymentStatuses.PARTIALLY_PAID && paidAmount !== undefined && grossAmount
                        ? ` (${paidAmount.toFixed(2)} / ${grossAmount.toFixed(2)})`
                        : ""}
                </Tooltip>
            }
        >
            <Badge bg={variant} text={textVariant}>
                {icon} {label}
            </Badge>
        </OverlayTrigger>
    );
}

/**
 * Badge formy płatności wyciągniętej z KSeF.
 */
export function PaymentMethodBadge({ paymentMethod }: { paymentMethod?: string | null }) {
    if (!paymentMethod) {
        return (
            <Badge bg="light" text="dark" className="border">
                Brak formy platnosci
            </Badge>
        );
    }

    const normalized = normalizePaymentMethod(paymentMethod);
    const { icon, label, variant } = getPaymentMethodMeta(normalized, paymentMethod);

    return (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="payment-method-tooltip">Forma platnosci z KSeF: {paymentMethod}</Tooltip>}
        >
            <Badge bg={variant} text={variant === "warning" ? "dark" : "light"}>
                {icon} {label}
            </Badge>
        </OverlayTrigger>
    );
}

function normalizePaymentMethod(paymentMethod: string): string {
    return paymentMethod
        .trim()
        .toLocaleLowerCase("pl-PL")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

function getPaymentMethodMeta(normalized: string, rawValue: string): {
    icon: string;
    label: string;
    variant: "success" | "primary" | "info" | "warning" | "secondary";
} {
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
function getContrastColor(hexColor: string): string {
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
const INVOICE_TYPE_META: Record<string, { label: string; variant: "primary" | "secondary" | "warning" | "danger" | "info" }> = {
    "VAT":     { label: "VAT",              variant: "primary"   },
    "KOR":     { label: "Korekta",          variant: "warning"   },
    "ZAL":     { label: "Zaliczka",         variant: "info"      },
    "ROZ":     { label: "Rozliczenie",      variant: "info"      },
    "UPR":     { label: "Uproszczona",      variant: "secondary" },
    "KOR_ZAL": { label: "Kor. zaliczki",    variant: "warning"   },
    "KOR_ROZ": { label: "Kor. rozliczenia", variant: "warning"   },
};

/**
 * Badge rodzaju faktury (RodzajFaktury z KSeF FA(3))
 */
export function InvoiceTypeBadge({ invoiceType }: { invoiceType?: string | null }) {
    if (!invoiceType) return null;

    const key = invoiceType.trim().toUpperCase();
    const meta = INVOICE_TYPE_META[key];
    const variant = meta?.variant ?? "secondary";
    const label = meta?.label ?? invoiceType;

    return (
        <OverlayTrigger
            placement="top"
            overlay={<Tooltip id="invoice-type-tooltip">Rodzaj faktury z KSeF: {invoiceType}</Tooltip>}
        >
            <Badge bg={variant} text={variant === "warning" ? "dark" : "light"}>
                {label}
            </Badge>
        </OverlayTrigger>
    );
}
