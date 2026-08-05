import React, { createContext, useContext, useState } from "react";
import { PersonData, ProjectData } from "../../../Typings/bussinesTypes";
import { CaseListIconButton } from "../../View/Resultsets/CommonComponents";
import { RowActionMenuItemProps } from "../../View/Resultsets/FilterableTable/FilterableTableTypes";
import { CaseListSheetModal } from "./CaseListSheetModal";

/**
 * Osoby do filtra w oknie „Spis spraw" projektu — właściciele zadań z drzewa
 * załadowanego dla otwartego projektu.
 *
 * Idą kontekstem, a nie propsem, bo RowActionMenu podaje komponentowi akcji tylko wiersz.
 * Kontekst zamiast fabryki komponentu: fabryka dawała nowy typ komponentu przy każdej
 * zmianie danych, React odmontowywał przycisk i otwarty modal znikał.
 */
export type ProjectTaskOwners = { projectId?: number; owners: PersonData[] };

export const ProjectTaskOwnersContext = createContext<ProjectTaskOwners>({ owners: [] });

/**
 * Akcja projektu: „Spis spraw" dla WSZYSTKICH kontraktów projektu w jednym arkuszu.
 * Arkusz ląduje w podfolderze „Spisy spraw" w folderze projektu (spisy pojedynczych
 * kontraktów zostają w folderach kontraktów).
 */
export function ProjectCaseListSheetButton({ dataObject, layout }: RowActionMenuItemProps) {
    const project = dataObject as ProjectData;
    const loaded = useContext(ProjectTaskOwnersContext);
    const [show, setShow] = useState(false);

    if (!project.gdFolderId || !project.ourId) return null;

    const isLoadedProject = project.id === loaded.projectId;
    const taskOwners = isLoadedProject ? loaded.owners : [];

    return (
        // Klik w ikonę nie może dojść do wiersza — zaznaczenie projektu przeładowuje
        // drzewo kontraktów i zamknęłoby dopiero co otwarte okno. Dwuklik zatrzymujemy
        // z tego samego powodu: wiersz odpaliłby na nim nawigację do szczegółów.
        <span onClick={(e) => e.stopPropagation()} onDoubleClick={(e) => e.stopPropagation()}>
            <CaseListIconButton layout={layout} onClick={() => setShow(true)} />
            <CaseListSheetModal
                show={show}
                onHide={() => setShow(false)}
                scope={{
                    action: "projectCaseListSheet",
                    target: { projectOurId: project.ourId },
                    subtitle:
                        "Arkusz Google ze wszystkimi kontraktami projektu - drzewo kontrakt → kamienie → sprawy → zadania. Trafi do podfolderu „Spisy spraw\" w folderze projektu.",
                    allPersonsLabel: "Wszystkich osób (cały projekt)",
                    noOwnersNote: isLoadedProject
                        ? "W tym projekcie nie ma zadań przypisanych do konkretnych osób."
                        : "Lista osób jest dostępna dla projektu otwartego w drzewie zadań - kliknij projekt, żeby wybrać konkretne osoby.",
                    noSelfTasksNote:
                        "Nie masz zadań w tym projekcie - spis pokaże tylko zadania nieprzypisane.",
                    taskOwners,
                }}
            />
        </span>
    );
}
