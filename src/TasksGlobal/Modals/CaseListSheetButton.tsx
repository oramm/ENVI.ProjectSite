import React, { useState } from "react";
import { PersonData } from "../../../Typings/bussinesTypes";
import { CaseListIconButton } from "../../View/Resultsets/CommonComponents";
import { RowActionMenuItemProps } from "../../View/Resultsets/FilterableTable/FilterableTableTypes";
import { CaseListSheetModal } from "./CaseListSheetModal";

/**
 * Akcja kontraktu: generowanie „Spisu spraw" — arkusza Google z drzewem
 * kamienie → sprawy → podsprawy → zadania (nazwy, statusy, uwagi).
 *
 * Arkusz trafia do podfolderu „Spisy spraw" w folderze GD kontraktu, a nazwa pliku
 * koduje konfigurację: to samo ustawienie nadpisuje swój arkusz, inne tworzy nowy obok.
 */
export function CaseListSheetButton({ dataObject, layout }: RowActionMenuItemProps) {
    // Właściciele zadań w tym kontrakcie — wyliczani przy budowie drzewa (buildTree),
    // dzięki czemu lista nie zawiera osób, dla których spis byłby pusty.
    const taskOwners = ((dataObject as { _taskOwners?: PersonData[] })._taskOwners ?? []) as PersonData[];
    const gdFolderId = (dataObject as { gdFolderId?: string }).gdFolderId;

    const [show, setShow] = useState(false);

    if (!gdFolderId) return null;

    return (
        <>
            <CaseListIconButton layout={layout} onClick={() => setShow(true)} />
            <CaseListSheetModal
                show={show}
                onHide={() => setShow(false)}
                scope={{
                    action: "contractCaseListSheet",
                    target: { contractId: dataObject.id },
                    subtitle:
                        "Arkusz Google z drzewem kamieni, spraw i zadań - trafi do podfolderu „Spisy spraw\" w folderze kontraktu.",
                    allPersonsLabel: "Wszystkich osób (cały kontrakt)",
                    noOwnersNote: "W tym kontrakcie nie ma zadań przypisanych do konkretnych osób.",
                    noSelfTasksNote:
                        "Nie masz zadań w tym kontrakcie - spis pokaże tylko zadania nieprzypisane.",
                    taskOwners,
                }}
            />
        </>
    );
}
