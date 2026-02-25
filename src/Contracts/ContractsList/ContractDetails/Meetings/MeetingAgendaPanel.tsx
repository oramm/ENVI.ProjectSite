import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card } from 'react-bootstrap';
import MainSetup from '../../../../React/MainSetupReact';
import { MeetingArrangementData, MeetingArrangementStatus, MeetingData } from '../../../../../Typings/bussinesTypes';
import { SpinnerBootstrap } from '../../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../../View/Resultsets/FilterableTable/FilterableTable';
import { meetingArrangementsRepository, meetingNotesRepository } from '../../ContractsController';
import { MeetingArrangementAddNewModalButton, MeetingArrangementEditModalButton } from './Modals/MeetingArrangementModalButtons';
import { useContractDetails } from '../ContractDetailsContext';
import MeetingNoteSection from './MeetingNoteSection';

const STATUS_LABELS: Record<MeetingArrangementStatus, string> = {
    PLANNED: 'Planowany',
    DISCUSSED: 'Omówiony',
    CLOSED: 'Zamknięty',
};

const STATUS_VARIANTS: Record<MeetingArrangementStatus, string> = {
    PLANNED: 'secondary',
    DISCUSSED: 'primary',
    CLOSED: 'success',
};

const NEXT_STATUS: Partial<Record<MeetingArrangementStatus, MeetingArrangementStatus>> = {
    PLANNED: 'DISCUSSED',
    DISCUSSED: 'CLOSED',
};

function StatusBadge({ status }: { status: MeetingArrangementStatus }) {
    return <Badge bg={STATUS_VARIANTS[status] || 'secondary'}>{STATUS_LABELS[status] || status}</Badge>;
}

interface MeetingAgendaPanelProps {
    meeting: MeetingData;
}

export default function MeetingAgendaPanel({ meeting }: MeetingAgendaPanelProps) {
    const { contract } = useContractDetails();
    const [arrangements, setArrangements] = useState<MeetingArrangementData[] | undefined>(undefined);
    const [isGenerating, setIsGenerating] = useState(false);

    const loadArrangements = useCallback(async () => {
        if (!meeting?.id) return;
        await meetingArrangementsRepository.loadItemsFromServerPOST([{ meetingId: meeting.id }]);
        setArrangements([...meetingArrangementsRepository.items]);
    }, [meeting?.id]);

    useEffect(() => {
        loadArrangements();
    }, [loadArrangements]);

    async function handleStatusChange(arrangement: MeetingArrangementData) {
        const nextStatus = NEXT_STATUS[arrangement.status];
        if (!nextStatus) return;

        try {
            const response = await fetch(
                `${MainSetup.serverUrl}meetingArrangement/${arrangement.id}/status`,
                {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ status: nextStatus }),
                },
            );
            if (!response.ok) throw new Error('Status change failed');
            await loadArrangements();
        } catch (error) {
            console.error('MeetingAgendaPanel: status change failed', error);
            alert('Nie udało się zmienić statusu');
        }
    }

    async function handleGenerateNote() {
        if (!contract?.id || !meeting?.id || !arrangements?.length) return;
        setIsGenerating(true);
        try {
            await meetingNotesRepository.addNewItem({
                contractId: contract.id,
                meetingId: meeting.id,
                title: meeting.name,
                meetingDate: meeting.date,
            });
        } catch (error) {
            console.error('MeetingAgendaPanel: note generation failed', error);
            alert('Nie udało się wygenerować notatki');
        } finally {
            setIsGenerating(false);
        }
    }

    // Wrapper for add button that injects meetingId as contextData
    const ArrangementAddButton = useMemo(() => {
        return function WrappedAddButton(props: any) {
            return <MeetingArrangementAddNewModalButton {...props} contextData={meeting.id} />;
        };
    }, [meeting.id]);

    if (arrangements === undefined) {
        return <div>Ładowanie agendy... <SpinnerBootstrap /></div>;
    }

    return (
        <Card className="mt-3">
            <Card.Header>
                <strong>Spotkanie: {meeting.name}</strong> ({meeting.date})
            </Card.Header>
            <Card.Body>
                <FilterableTable<MeetingArrangementData>
                    id="meetingArrangements"
                    title="Agenda spotkania"
                    initialObjects={arrangements}
                    repository={meetingArrangementsRepository}
                    AddNewButtonComponents={[ArrangementAddButton]}
                    EditButtonComponent={MeetingArrangementEditModalButton}
                    isDeletable={true}
                    showTableHeader={false}
                    tableStructure={[
                        {
                            header: 'Sprawa',
                            renderTdBody: (item: MeetingArrangementData) => (
                                <>
                                    {item._case?._type?.folderNumber && (
                                        <span className="text-muted me-1">{item._case._type.folderNumber}</span>
                                    )}
                                    {item._case?.name || item.name || '—'}
                                </>
                            ),
                        },
                        {
                            header: 'Opis',
                            objectAttributeToShow: 'description',
                        },
                        {
                            header: 'Status',
                            renderTdBody: (item: MeetingArrangementData) => (
                                <div className="d-flex align-items-center gap-2">
                                    <StatusBadge status={item.status} />
                                    {NEXT_STATUS[item.status] && (
                                        <Button
                                            size="sm"
                                            variant="outline-primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleStatusChange(item);
                                            }}
                                            title={`Zmień na: ${STATUS_LABELS[NEXT_STATUS[item.status]!]}`}
                                        >
                                            ▶
                                        </Button>
                                    )}
                                </div>
                            ),
                        },
                    ]}
                    externalUpdate={arrangements.length}
                />
                <div className="mt-3">
                    <Button
                        variant="outline-primary"
                        disabled={!arrangements.length || isGenerating}
                        onClick={handleGenerateNote}
                    >
                        {isGenerating ? (
                            <>Generowanie... <SpinnerBootstrap /></>
                        ) : (
                            'Generuj notatkę ze spotkania'
                        )}
                    </Button>
                </div>
                {contract?.id && meeting?.id && (
                    <MeetingNoteSection meetingId={meeting.id} contractId={contract.id} />
                )}
            </Card.Body>
        </Card>
    );
}
