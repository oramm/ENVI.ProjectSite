import React from "react";
import MainSetup from "../../../React/MainSetupReact";
import { StatusFilterMenuHeader } from "./StatusFilterMenuHeader";

/** Domyślny filtr statusów spraw w selektorze: aktywne (bez 'Zamknięta'). */
export const DEFAULT_CASE_STATUS_FILTER = [MainSetup.CaseStatus.FOR_LATER, MainSetup.CaseStatus.IN_PROGRESS];

/** Pasek filtra statusów spraw w menu selektora sprawy - patrz StatusFilterMenuHeader. */
export function CaseStatusFilterMenuHeader({
    selectedStatuses,
    onChange,
}: {
    selectedStatuses: string[];
    onChange: (statuses: string[]) => void;
}) {
    return (
        <StatusFilterMenuHeader
            allStatuses={Object.values(MainSetup.CaseStatus)}
            selectedStatuses={selectedStatuses}
            onChange={onChange}
        />
    );
}
