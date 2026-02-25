import React, { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { MeetingData } from '../../../../../Typings/bussinesTypes';
import { SpinnerBootstrap } from '../../../../View/Resultsets/CommonComponents';
import FilterableTable from '../../../../View/Resultsets/FilterableTable/FilterableTable';
import { useContractDetails } from '../ContractDetailsContext';
import { meetingsRepository } from '../../ContractsController';
import { MeetingAddNewModalButton, MeetingEditModalButton } from './Modals/MeetingModalButtons';
import MeetingAgendaPanel from './MeetingAgendaPanel';

export default function Meetings() {
    const { contract } = useContractDetails();
    const [meetings, setMeetings] = useState<MeetingData[] | undefined>(undefined);
    const [selectedMeeting, setSelectedMeeting] = useState<MeetingData | undefined>(undefined);

    useEffect(() => {
        let isMounted = true;

        async function fetchMeetings() {
            if (!contract?.id) return;
            try {
                await meetingsRepository.loadItemsFromServerPOST([{ contractId: contract.id }]);
                if (!isMounted) return;
                setMeetings([...meetingsRepository.items]);
            } catch (error) {
                if (!isMounted) return;
                console.error('Meetings: unable to load meetings', error);
                setMeetings([]);
            }
        }

        fetchMeetings();
        return () => { isMounted = false; };
    }, [contract?.id]);

    function handleRowClick(meeting: MeetingData) {
        setSelectedMeeting(
            selectedMeeting?.id === meeting.id ? undefined : meeting,
        );
    }

    if (!contract) {
        return <div>Ładuję dane... <SpinnerBootstrap /></div>;
    }

    return (
        <Card>
            <Card.Body>
                {meetings ? (
                    <>
                        <FilterableTable<MeetingData>
                            id="meetings"
                            title="Spotkania"
                            initialObjects={meetings}
                            repository={meetingsRepository}
                            AddNewButtonComponents={[MeetingAddNewModalButton]}
                            EditButtonComponent={MeetingEditModalButton}
                            isDeletable={true}
                            showTableHeader={false}
                            tableStructure={[
                                { header: 'Nazwa', objectAttributeToShow: 'name' },
                                { header: 'Data', objectAttributeToShow: 'date' },
                                { header: 'Lokalizacja', objectAttributeToShow: 'location' },
                            ]}
                            onRowClick={handleRowClick}
                            externalUpdate={meetings.length}
                        />
                        {selectedMeeting && (
                            <MeetingAgendaPanel meeting={selectedMeeting} />
                        )}
                    </>
                ) : (
                    <>
                        Ładowanie spotkań... <SpinnerBootstrap />
                    </>
                )}
            </Card.Body>
        </Card>
    );
}
