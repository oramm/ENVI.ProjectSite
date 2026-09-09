import React from "react";
import { Badge, OverlayTrigger, Tooltip } from "react-bootstrap";

/**
 * GUS-4b — plakietka wyniku porównania podmiotu z rejestrem GUS.
 *
 * Trzecia plakietka tej samej rodziny co `FidmanSyncBadge`
 * (../View/Resultsets/CommonComponents.tsx) i `WhiteListStatusBadge`
 * (../Erp/CostInvoicesList/CostInvoicesBadges.tsx): mapa stan → `<Badge bg text>`
 * plus `OverlayTrigger` z datą sprawdzenia. Żadnego nowego wzorca i żadnych
 * własnych kolorów — wyłącznie warianty bootstrapa.
 *
 * Nazwy stanów zatwierdził właściciel 2026-09-09 przy makiecie („Plakietka GUS
 * w PS ENVI"); nie wolno ich zmieniać bez jego decyzji. Przedrostek „GUS: "
 * jest dołożony wobec makiety, bo na liście podmiotu plakietka stoi obok
 * plakietek Białej listy i FIDmana, a samo „różni się" nie mówi, czego dotyczy.
 *
 * DECYZJA WŁAŚCICIELA (2026-09-09), której nie wolno cofnąć bez jego zgody:
 * kolorem zapala się WYŁĄCZNIE `DIFF`. `DIFF_MINOR` („inny zapis") jest szary
 * i cichy — przy 146 rekordach na 479 kolorowa plakietka zamieniłaby się w szum.
 */
export type GusStatus = "NOT_CHECKED" | "OK" | "DIFF" | "DIFF_MINOR" | "NOT_FOUND" | "CLOSED" | "ERROR";

type BadgeLook = { bg: string; text: string; label: string; className?: string };

/**
 * Mapa stanu na wygląd. Warianty dobrane do intencji makiety, nie do jej hexów:
 * `warning` (bursztyn) = „zajmij się tym, ale to nie awaria"; `danger` = awaria
 * odpytania; `success` = zgodne; `secondary` = cicha lista; `dark` = wykreślony
 * z rejestru (mocne, ale nie alarmowe); `info` = nieznany w rejestrze; `light`
 * z obwódką = jeszcze nie pytaliśmy.
 */
const GUS_BADGE_LOOK: Record<GusStatus, BadgeLook> = {
    DIFF: { bg: "warning", text: "dark", label: "⚠️ GUS: różni się" },
    DIFF_MINOR: { bg: "secondary", text: "light", label: "GUS: inny zapis" },
    OK: { bg: "success", text: "light", label: "GUS: zgodny" },
    CLOSED: { bg: "dark", text: "light", label: "GUS: wykreślony z rejestru" },
    NOT_FOUND: { bg: "info", text: "dark", label: "GUS: nieznany w rejestrze" },
    ERROR: { bg: "danger", text: "light", label: "GUS: błąd" },
    NOT_CHECKED: { bg: "light", text: "dark", label: "GUS: nie sprawdzano", className: "border" },
};

/** Data sprawdzenia przychodzi z serwera jako ISO; pokazujemy sam dzień, po polsku. */
export function formatGusCheckedAt(checkedAt?: string | Date | null): string | null {
    if (!checkedAt) return null;
    const asDate = checkedAt instanceof Date ? checkedAt : new Date(checkedAt);
    if (Number.isNaN(asDate.getTime())) return null;
    const dd = String(asDate.getDate()).padStart(2, "0");
    const mm = String(asDate.getMonth() + 1).padStart(2, "0");
    return `${dd}-${mm}-${asDate.getFullYear()}`;
}

export function GusStatusBadge({
    status,
    checkedAt,
}: {
    status?: GusStatus | null;
    checkedAt?: string | Date | null;
}) {
    const resolved: GusStatus = status && GUS_BADGE_LOOK[status] ? status : "NOT_CHECKED";
    const { bg, text, label, className } = GUS_BADGE_LOOK[resolved];

    const badge = (
        <Badge bg={bg} text={text} className={className}>
            {label}
        </Badge>
    );

    const checked = formatGusCheckedAt(checkedAt);
    if (!checked) return badge;

    return (
        <OverlayTrigger placement="top" overlay={<Tooltip id="gus-status-tooltip">Sprawdzono w GUS: {checked}</Tooltip>}>
            {badge}
        </OverlayTrigger>
    );
}
