import React from "react";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CostInvoiceStatuses, PaymentStatuses, PaymentStatus } from "./CostInvoicesController";
import { CostInvoiceCategory } from "../../../Typings/bussinesTypes";

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
