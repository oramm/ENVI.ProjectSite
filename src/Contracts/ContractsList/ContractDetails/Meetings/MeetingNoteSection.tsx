import React, { useCallback, useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import { ContractMeetingNoteData } from "../../../../../Typings/bussinesTypes";
import {
    GDDocFileIconLink,
    SpinnerBootstrap,
    MenuExpandIconButton,
} from "../../../../View/Resultsets/CommonComponents";
import { meetingNotesRepository } from "../../ContractsController";
import { MeetingNoteEditModalButton } from "../MeetingNotes/Modals/MeetingNoteEditModalButton";
import { GeneralDeleteModalButton } from "../../../../View/Modals/GeneralModalButtons";

interface MeetingNoteSectionProps {
    meetingId: number;
    contractId: number;
}

export default function MeetingNoteSection({ meetingId, contractId }: MeetingNoteSectionProps) {
    const [note, setNote] = useState<ContractMeetingNoteData | null | undefined>(undefined);
    const [isMenuExpanded, setIsMenuExpanded] = useState(false);

    function toggleMenu() {
        setIsMenuExpanded((prev) => !prev);
    }

    const loadNote = useCallback(async () => {
        try {
            const items = await meetingNotesRepository.loadItemsFromServerPOST([{ meetingId }]);
            const found = items.find((n: ContractMeetingNoteData) => n.meetingId === meetingId) ?? null;
            setNote(found);
        } catch (error) {
            console.error("MeetingNoteSection: unable to load note", error);
            setNote(null);
        }
    }, [meetingId]);

    useEffect(() => {
        loadNote();
    }, [loadNote]);

    if (note === undefined) {
        return (
            <div className="mt-3">
                <SpinnerBootstrap />
            </div>
        );
    }

    if (!note) {
        return (
            <div className="mt-2 text-muted">
                <small>Brak notatki</small>
            </div>
        );
    }

    const documentUrl = note._documentOpenUrl || note._documentEditUrl;

    return (
        <Card className="mt-3 mb-0 shadow-sm border-light position-relative">
            <Card.Body className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                <div className="d-flex align-items-center gap-3">
                    {documentUrl && (
                        <div className="bg-light p-2 rounded d-flex align-items-center justify-content-center">
                            <GDDocFileIconLink folderUrl={documentUrl} layout="vertical" />
                        </div>
                    )}
                    <div>
                        <div className="fw-bold fs-5 text-dark">{note.title || "Notatka ze spotkania"}</div>
                        {note.meetingDate && <div className="text-muted small">Data: {note.meetingDate}</div>}
                        {!note.meetingDate && <div className="text-muted small">Dokument powiązany ze spotkaniem</div>}
                    </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center p-1 rounded transition-all">
                        <MenuExpandIconButton layout="horizontal" onClick={toggleMenu} />
                        {isMenuExpanded && (
                            <>
                                <div className="border-start mx-1" style={{ height: "20px" }}></div>
                                <MeetingNoteEditModalButton
                                    modalProps={{
                                        onEdit: loadNote,
                                        initialData: note,
                                    }}
                                    buttonProps={{
                                        layout: "horizontal",
                                    }}
                                />
                                <GeneralDeleteModalButton<ContractMeetingNoteData>
                                    modalProps={{
                                        onDelete: () => setNote(null),
                                        modalTitle: "Usuwanie notatki ze spotkania",
                                        initialData: note,
                                        repository: meetingNotesRepository,
                                    }}
                                    buttonProps={{
                                        layout: "horizontal",
                                    }}
                                />
                            </>
                        )}
                    </div>
                </div>
            </Card.Body>
        </Card>
    );
}
