import React from "react";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";
import { CostInvoiceStatuses } from "./CostInvoicesController";

/**
 * Badge statusu faktury kosztowej
 */
export function CostInvoiceStatusBadge({ status }: { status: string }) {
    let variant;
    let textMode: "light" | "dark" = "light";

    switch (status) {
        case CostInvoiceStatuses.NEW:
            variant = "secondary";
            break;
        case CostInvoiceStatuses.VERIFIED:
            variant = "info";
            break;
        case CostInvoiceStatuses.APPROVED:
            variant = "success";
            break;
        case CostInvoiceStatuses.REJECTED:
            variant = "danger";
            break;
        default:
            variant = "secondary";
    }

    return (
        <Badge bg={variant} text={textMode}>
            {status}
        </Badge>
    );
}

/**
 * Badge statusu płatności
 */
export function PaidStatusBadge({ isPaid }: { isPaid: boolean }) {
    if (isPaid) {
        return (
            <Badge bg="success" text="light">
                ✅ Zapłacona
            </Badge>
        );
    }
    return (
        <Badge bg="warning" text="dark">
            💳 Do zapłaty
        </Badge>
    );
}

/**
 * Badge czy faktura jest kosztem firmy
 */
export function CompanyCostBadge({ isCompanyCost }: { isCompanyCost: boolean }) {
    if (isCompanyCost) {
        return (
            <OverlayTrigger
                placement="top"
                overlay={<Tooltip id="cost-tooltip">Faktura uwzględniana w kosztach firmy</Tooltip>}
            >
                <Badge bg="primary" text="light">
                    📊 Koszt
                </Badge>
            </OverlayTrigger>
        );
    }
    return (
        <Badge bg="light" text="dark">
            ⊘ Nie koszt
        </Badge>
    );
}
