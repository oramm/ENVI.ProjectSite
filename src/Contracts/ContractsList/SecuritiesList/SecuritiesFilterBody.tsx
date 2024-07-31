import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import ToolsDate from "../../../React/ToolsDate";
import {
    ProjectSelector,
    ContractTypeSelectFormElement,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { useFormContext } from "../../../View/Modals/FormContext";
import { projectsRepository } from "../ContractsController";
import { SecurityStatusSelectFormElement } from "../../../View/Modals/CommonFormComponents/StatusSelectors";
import { DateRangeInput } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import MainSetup from "../../../React/MainSetupReact";

export function SecuritiesFilterBody() {
    const { register } = useFormContext();

    return (
        <Row>
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
                defaultFromValue={MainSetup.SecuritiesFilterInitState.START_DATE_FROM}
                defaultToValue={MainSetup.SecuritiesFilterInitState.START_DATE_TO}
            />
            <DateRangeInput
                as={Col}
                sm={12}
                md={6}
                lg={4}
                label="70% wygasa"
                fromName="firstPartExpiryDateFrom"
                toName="firstPartExpiryDateTo"
                showValidationInfo={false}
                defaultFromValue={MainSetup.SecuritiesFilterInitState.FIRST_PART_EXPIRY_DATE_FROM}
            />
            <DateRangeInput
                as={Col}
                sm={12}
                md={6}
                lg={4}
                label="30% wygasa"
                fromName="secondPartExpiryDateFrom"
                toName="secondPartExpiryDateTo"
                showValidationInfo={false}
                defaultFromValue={MainSetup.SecuritiesFilterInitState.SECOND_PART_EXPIRY_DATE_FROM}
            />

            <SecurityStatusSelectFormElement name="status" showValidationInfo={false} />
        </Row>
    );
}
