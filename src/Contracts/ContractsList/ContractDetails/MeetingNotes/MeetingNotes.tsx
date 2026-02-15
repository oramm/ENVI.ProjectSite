import React, { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { ContractMeetingNoteData } from "../../../../../Typings/bussinesTypes";
import { SpinnerBootstrap } from "../../../../View/Resultsets/CommonComponents";
import FilterableTable from "../../../../View/Resultsets/FilterableTable/FilterableTable";
import { useContractDetails } from "../ContractDetailsContext";
import { meetingNotesRepository } from "../../ContractsController";
import { MeetingNoteAddNewModalButton } from "./Modals/MeetingNoteModalButtons";

export default function MeetingNotes() {
    const { contract } = useContractDetails();
    const [notes, setNotes] = useState<ContractMeetingNoteData[] | undefined>(undefined);
    useEffect(() => {
        async function fetchNotes() {
            if (!contract?.id) return;
            await meetingNotesRepository.loadItemsFromServerPOST([{ contractId: contract.id }]);
            setNotes([...meetingNotesRepository.items]);
        }
        fetchNotes();
    }, [contract?.id]);

    if (!contract) {
        return (
            <div>
                Ładuję dane... <SpinnerBootstrap />
            </div>
        );
    }

    return (
        <Card>
            <Card.Body>
                {notes ? (
                    <FilterableTable<ContractMeetingNoteData>
                        id="meetingNotes"
                        title="Notatki ze spotkań"
                        initialObjects={notes}
                        repository={meetingNotesRepository}
                        AddNewButtonComponents={[MeetingNoteAddNewModalButton]}
                        tableStructure={[
                            { header: "#", objectAttributeToShow: "sequenceNumber" },
                            { header: "Tytuł", objectAttributeToShow: "title" },
                            { header: "Data spotkania", objectAttributeToShow: "meetingDate" },
                            {
                                header: "Link do dokumentu",
                                renderTdBody: (note: ContractMeetingNoteData) =>
                                    note.gdDocumentUrl ? (
                                        <a href={note.gdDocumentUrl} target="_blank" rel="noopener noreferrer">
                                            Otwórz dokument
                                        </a>
                                    ) : (
                                        <></>
                                    ),
                            },
                            { header: "Data utworzenia", objectAttributeToShow: "createdAt" },
                        ]}
                        isDeletable={false}
                    />
                ) : (
                    <>
                        Ładowanie notatek... <SpinnerBootstrap />
                    </>
                )}
            </Card.Body>
        </Card>
    );
}
