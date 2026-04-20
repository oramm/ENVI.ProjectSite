import React, { useEffect, useMemo, useState } from "react";
import { Card } from "react-bootstrap";
import { ContractMeetingNoteData } from "../../../../../Typings/bussinesTypes";
import { SpinnerBootstrap } from "../../../../View/Resultsets/CommonComponents";
import FilterableTable from "../../../../View/Resultsets/FilterableTable/FilterableTable";
import { useContractDetails } from "../ContractDetailsContext";
import { meetingNotesRepository } from "../../ContractsController";
import { MeetingNoteAddNewModalButton } from "./Modals/MeetingNoteModalButtons";
import { MeetingNoteEditModalButton } from "./Modals/MeetingNoteEditModalButton";
import { MeetingNotesFilterBody } from "./MeetingNotesFilterBody";

export default function MeetingNotes() {
    const { contract } = useContractDetails();
    const [notes, setNotes] = useState<ContractMeetingNoteData[] | undefined>(undefined);
    const fixedCriteria = useMemo(() => ({ contractId: contract?.id }), [contract?.id]);

    useEffect(() => {
        let isMounted = true;

        async function fetchNotes() {
            if (!contract?.id) return;
            try {
                await meetingNotesRepository.loadItemsFromServerPOST([{ contractId: contract.id }]);
                if (!isMounted) return;

                const notesWithActionLinks = meetingNotesRepository.items.map((note) => ({
                    ...note,
                    _documentOpenUrl: note._documentOpenUrl || note._documentEditUrl,
                }));

                meetingNotesRepository.items = notesWithActionLinks;
                setNotes([...notesWithActionLinks]);
            } catch (error) {
                if (!isMounted) return;
                console.error("MeetingNotes: unable to load notes", error);
                setNotes([]);
            }
        }

        fetchNotes();
        return () => {
            isMounted = false;
        };
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
                        fixedCriteria={fixedCriteria}
                        AddNewButtonComponents={[MeetingNoteAddNewModalButton]}
                        tableStructure={[
                            { header: "#", objectAttributeToShow: "sequenceNumber" },
                            { header: "Tytuł", objectAttributeToShow: "title" },
                            { header: "Data spotkania", objectAttributeToShow: "meetingDate" },
                            { header: "Data utworzenia", objectAttributeToShow: "createdAt" },
                        ]}
                        FilterBodyComponent={MeetingNotesFilterBody}
                        EditButtonComponent={MeetingNoteEditModalButton}
                        isDeletable={true}
                        showTableHeader={false}
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
