import React, { useEffect, useMemo, useState } from "react";
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
    const fixedCriteria = useMemo(() => ({ contractId: contract?.id }), [contract?.id]);

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
        <Card className="shadow-sm border-0">
            <Card.Body className="p-3 p-xl-4">
                {meetings ? (
                    <Row className="g-3 align-items-stretch">
                        <Col lg={4} className="d-flex">
                            <Card className="w-100 h-100 shadow-sm border bg-white">
                                <Card.Body className="p-0">
                                    <FilterableTable<MeetingData>
                                        id="meetings"
                                        title="Spotkania"
                                        initialObjects={meetings}
                                        repository={meetingsRepository}
                                        fixedCriteria={fixedCriteria}
                                        autoSearchOnReset={true}
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
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col lg={8} className="d-flex">
                            {selectedMeeting ? (
                                <div className="w-100">
                                    <MeetingAgendaPanel meeting={selectedMeeting} />
                                </div>
                            ) : (
                                <Card className="w-100 shadow-sm border bg-light-subtle">
                                    <Card.Body
                                        className="d-flex flex-column justify-content-center align-items-center text-center text-muted px-4"
                                        style={{ minHeight: "420px" }}
                                    >
                                        <div className="text-uppercase small fw-semibold letter-spacing-1 mb-2">
                                            Szczegóły spotkania
                                        </div>
                                        <h5 className="fw-normal mb-2">Wybierz spotkanie z listy po lewej</h5>
                                        <p className="mb-0">
                                            Po wybraniu zobaczysz agendę, statusy punktów i powiązaną notatkę.
                                        </p>
                                    </Card.Body>
                                </Card>
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
