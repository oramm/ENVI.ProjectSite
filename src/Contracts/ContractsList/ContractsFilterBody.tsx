import React from "react";
import {
    ContractRangeSelector,
    ContractTypeSelectFormElement,
    ProjectSelector,
} from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import ToolsDate from "../../React/ToolsDate";
import { contractRangesRepository, projectsRepository } from "./ContractsController";
import { ContractStatusSelector } from "../../View/Modals/CommonFormComponents/StatusSelectors";
import { DateRangeInput } from "../../View/Modals/CommonFormComponents/GenericComponents";
import MainSetup from "../../React/MainSetupReact";

export function ContractsFilterBody() {
    const { register } = useFormContext();

    return (
        <Row xl={12} md={3} xs={1}>
            <Form.Group as={Col} xl={2}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <Form.Group as={Col} xl={5}>
                <ProjectSelector repository={projectsRepository} showValidationInfo={false} />
            </Form.Group>
            <Form.Group as={Col} xl={5}>
                <ContractTypeSelectFormElement name="_contractType" showValidationInfo={false} />
            </Form.Group>

            <DateRangeInput
                as={Col}
                sm={12}
                md={6}
                lg={4}
                label="Rozpoczęcie"
                fromName="startDateFrom"
                toName="startDateTo"
                showValidationInfo={false}
                defaultFromValue={MainSetup.ContractsFilterInitState.START_DATE_FROM}
                defaultToValue={MainSetup.ContractsFilterInitState.START_DATE_TO}
            />
            <DateRangeInput
                as={Col}
                sm={12}
                md={6}
                lg={4}
                label="Zakończenie"
                fromName="endDateFrom"
                toName="endDateTo"
                showValidationInfo={false}
                defaultFromValue={MainSetup.ContractsFilterInitState.END_DATE_FROM}
            />

            <Form.Group as={Col} xl={2}>
                <ContractStatusSelector name="status" showValidationInfo={false} />
            </Form.Group>
            <Form.Group as={Col} xl={2}>
                <ContractRangeSelector repository={contractRangesRepository} showValidationInfo={false} />
            </Form.Group>
        </Row>
    );
}
