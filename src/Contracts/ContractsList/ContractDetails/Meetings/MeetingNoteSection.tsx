import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { ContractMeetingNoteData } from '../../../../../Typings/bussinesTypes';
import { SpinnerBootstrap } from '../../../../View/Resultsets/CommonComponents';
import { meetingNotesRepository } from '../../ContractsController';
import { MeetingNoteEditModalButton } from '../MeetingNotes/Modals/MeetingNoteEditModalButton';

interface MeetingNoteSectionProps {
    meetingId: number;
    contractId: number;
}

export default function MeetingNoteSection({ meetingId, contractId }: MeetingNoteSectionProps) {
    const [note, setNote] = useState<ContractMeetingNoteData | null | undefined>(undefined);

    const loadNote = useCallback(async () => {
        try {
            const items = await meetingNotesRepository.loadItemsFromServerPOST([{ meetingId }]);
            const found = items.find((n: ContractMeetingNoteData) => n.meetingId === meetingId) ?? null;
            setNote(found);
        } catch (error) {
            console.error('MeetingNoteSection: unable to load note', error);
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
        <Alert variant="light" className="mt-3 mb-0 border">
            <div className="d-flex align-items-center justify-content-between">
                <div>
                    <strong>Notatka ze spotkania:</strong>{' '}
                    {note.title}
                    {documentUrl && (
                        <>
                            {' — '}
                            <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                                Otwórz dokument
                            </a>
                        </>
                    )}
                </div>
                <div className="d-flex gap-2">
                    <MeetingNoteEditModalButton
                        modalProps={{
                            onEdit: loadNote,
                            initialData: note,
                        }}
                        buttonProps={{}}
                    />
                    <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={async () => {
                            if (!window.confirm('Usunąć notatkę?')) return;
                            try {
                                await meetingNotesRepository.deleteItemNodeJS(note.id);
                                setNote(null);
                            } catch (error) {
                                console.error('MeetingNoteSection: delete failed', error);
                                alert('Nie udało się usunąć notatki');
                            }
                        }}
                    >
                        Usuń
                    </Button>
                </div>
            </div>
        </Alert>
    );
}
