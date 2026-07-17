import React from "react";
import { Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter } from "@fortawesome/free-solid-svg-icons";
import MainSetup from "../../../React/MainSetupReact";

/** Domyślny filtr statusów spraw w selektorze: aktywne (bez 'Zamknięta'). */
export const DEFAULT_CASE_STATUS_FILTER = [MainSetup.CaseStatus.FOR_LATER, MainSetup.CaseStatus.IN_PROGRESS];

/**
 * Pasek filtra statusów spraw renderowany JAKO NAGŁÓWEK w menu selektora sprawy
 * (react-bootstrap-typeahead `renderMenu`). Widoczny od razu po otwarciu selektora —
 * nie wymaga klikania osobnego przycisku. Statusy działają jak przełączniki (multi-select):
 * kliknięcie pigułki dodaje/usuwa status z filtra.
 *
 * `onMouseDown` preventDefault na kontenerze utrzymuje focus w polu (menu nie zamyka się
 * przy kliknięciu), a `stopPropagation` na kliknięciu pigułki zapobiega wyborowi opcji.
 */
export function CaseStatusFilterMenuHeader({
    selectedStatuses,
    onChange,
}: {
    selectedStatuses: string[];
    onChange: (statuses: string[]) => void;
}) {
    const allStatuses = Object.values(MainSetup.CaseStatus);

    function toggleStatus(status: string) {
        onChange(
            selectedStatuses.includes(status)
                ? selectedStatuses.filter((s) => s !== status)
                : [...selectedStatuses, status],
        );
    }

    return (
        <div
            className="px-3 py-2 border-bottom position-sticky top-0 d-flex align-items-center gap-2 flex-wrap"
            style={{ zIndex: 5, backgroundColor: "var(--bs-tertiary-bg, #f8f9fa)" }}
            onMouseDown={(e) => e.preventDefault()}
        >
            <FontAwesomeIcon icon={faFilter} className="text-muted" size="sm" />
            <span className="small text-muted me-1">Statusy:</span>
            {allStatuses.map((status) => {
                const active = selectedStatuses.includes(status);
                return (
                    <Badge
                        key={status}
                        bg={active ? "primary" : "light"}
                        text={active ? "light" : "dark"}
                        className="border"
                        role="button"
                        title={active ? "Kliknij, aby ukryć" : "Kliknij, aby pokazać"}
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleStatus(status);
                        }}
                    >
                        {active ? "✓ " : ""}
                        {status}
                    </Badge>
                );
            })}
        </div>
    );
}
