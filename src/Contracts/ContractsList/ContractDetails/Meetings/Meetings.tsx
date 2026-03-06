import React, { useEffect, useState } from "react";
import { Card, Row, Col } from "react-bootstrap";
import { MeetingData } from "../../../../../Typings/bussinesTypes";
import { SpinnerBootstrap } from "../../../../View/Resultsets/CommonComponents";
import FilterableTable from "../../../../View/Resultsets/FilterableTable/FilterableTable";
import { useContractDetails } from "../ContractDetailsContext";
import { meetingsRepository } from "../../ContractsController";
import { MeetingAddNewModalButton, MeetingEditModalButton } from "./Modals/MeetingModalButtons";
import MeetingAgendaPanel from "./MeetingAgendaPanel";
import { MeetingsFilterBody } from "./MeetingsFilterBody";

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
                console.error("Meetings: unable to load meetings", error);
                setMeetings([]);
            }
        }

        fetchMeetings();
        return () => {
            isMounted = false;
        };
    }, [contract?.id]);

    function handleRowClick(meeting: MeetingData) {
        setSelectedMeeting(selectedMeeting?.id === meeting.id ? undefined : meeting);
    }

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
                {meetings ? (
                    <Row>
                        <Col md={4} className="border-end pe-2">
                            <FilterableTable<MeetingData>
                                id="meetings"
                                title="Spotkania"
                                initialObjects={meetings}
                                repository={meetingsRepository}
                                AddNewButtonComponents={[MeetingAddNewModalButton]}
                                EditButtonComponent={MeetingEditModalButton}
                                FilterBodyComponent={MeetingsFilterBody}
                                isDeletable={true}
                                showTableHeader={false}
                                tableStructure={[
                                    { header: "Nazwa", objectAttributeToShow: "name" },
                                    { header: "Data", objectAttributeToShow: "date" },
                                ]}
                                onRowClick={handleRowClick}
                                externalUpdate={meetings.length}
                            />
                        </Col>
                        <Col md={8} className="ps-2">
                            {selectedMeeting ? (
                                <MeetingAgendaPanel meeting={selectedMeeting} />
                            ) : (
                                <div className="d-flex w-100 h-100 min-vh-100 justify-content-center align-items-center text-muted p-4 text-center rounded">
                                    <h5 className="fw-normal">
                                        Wybierz spotkanie z listy po lewej, <br />
                                        aby zobaczyć szczegóły agendy i notatkę
                                    </h5>
                                </div>
                            )}
                        </Col>
                    </Row>
                ) : (
                    <>
                        Ładowanie spotkań... <SpinnerBootstrap />
                    </>
                )}
            </Card.Body>
        </Card>
    );
}
