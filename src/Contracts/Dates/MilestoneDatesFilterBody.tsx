import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import {
    ContractRangeSelector,
    ContractSelector,
    ContractTypeSelectFormElement,
    PersonSelector,
    ProjectSelector,
} from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { contractsRepository, personsRepository, projectsRepository } from "./MilestoneDatesController";
import { DateRangeInput } from "../../View/Modals/CommonFormComponents/GenericComponents";
import {
    ContractStatusSelector,
    MilestoneStatusSelector,
} from "../../View/Modals/CommonFormComponents/StatusSelectors";
import MainSetup from "../../React/MainSetupReact";
import { text } from "@fortawesome/fontawesome-svg-core";

export function MilestoneDatesFilterBody() {
    const { register, watch, setValue, reset, trigger } = useFormContext();
    const _project = watch("_project");

    useEffect(() => {
        const resetData = {
            searchText: "test",
            contractStatuses: [
                MainSetup.ContractStatuses.NOT_STARTED,
                MainSetup.ContractStatuses.IN_PROGRESS,
                MainSetup.ContractStatuses.FINISHED,
            ],
            milestoneStatuses: MainSetup.MilestoneDatesFilterInitState.STATUSES,
        };
        reset(resetData);
        trigger();
        console.log("resetData", resetData);
    }, []);

    useEffect(() => {
        setValue("_contract", undefined);
    }, [_project]);

    return (
        <>
            <Row>
                <Form.Group as={Col} md={6} xl={2}>
                    <Form.Label>Szukana fraza</Form.Label>
                    <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
                </Form.Group>
                <Form.Group as={Col} md={6} xl={2}>
                    <ProjectSelector repository={projectsRepository} showValidationInfo={false} />
                </Form.Group>
                <Form.Group as={Col} md={12} xl={5}>
                    <Form.Label>Kontrakt</Form.Label>
                    <ContractSelector
                        repository={contractsRepository}
                        name="_contract"
                        typesToInclude="all"
                        showValidationInfo={false}
                        _project={_project}
                    />
                </Form.Group>
                <Form.Group as={Col} xl={3}>
                    <ContractStatusSelector
                        showValidationInfo={false}
                        multiple={true}
                        name="contractStatuses"
                        label="Statusy kontratu"
                    />
                </Form.Group>
            </Row>

            <Row>
                <DateRangeInput
                    as={Col}
                    md={6}
                    lg={4}
                    label="Rozpoczęcie"
                    fromName="startDateFrom"
                    toName="startDateTo"
                    showValidationInfo={false}
                />
                <DateRangeInput
                    as={Col}
                    md={6}
                    lg={4}
                    label="Zakończenie"
                    fromName="endDateFrom"
                    toName="endDateTo"
                    showValidationInfo={false}
                />
                <Form.Group as={Col} sm={12} md={8} lg={4} xl={4} controlId="_person">
                    <Form.Label>Administrator kontraktu</Form.Label>
                    <PersonSelector name="_person" repository={personsRepository} showValidationInfo={false} />
                </Form.Group>
            </Row>
            <Row>
                <Form.Group as={Col} xl={4}>
                    <ContractTypeSelectFormElement name="_contractType" showValidationInfo={false} />
                </Form.Group>
                <Form.Group as={Col} xl={4}>
                    <ContractRangeSelector repository={MainSetup.contractRangesRepository} showValidationInfo={false} />
                </Form.Group>
                <Form.Group as={Col} xl={4}>
                    <MilestoneStatusSelector
                        showValidationInfo={false}
                        name="milestoneStatuses"
                        label="Statusy kamieni milowych"
                        multiple={true}
                    />
                </Form.Group>
            </Row>
        </>
    );
}
