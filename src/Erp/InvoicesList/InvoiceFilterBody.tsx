import React from "react";
import { ContractSelectFormElement } from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import MainSetup from "../../React/MainSetupReact";
import { contractsRepository } from "./InvoicesController";
import { InvoiceStatusSelector } from "../../View/Modals/CommonFormComponents/StatusSelectors";
import { DateRangeInput } from "../../View/Modals/CommonFormComponents/GenericComponents";

export function InvoicesFilterBody() {
    const { register } = useFormContext();

    return (
        <Row>
            <Form.Group as={Col} sm={12} md={5}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <DateRangeInput
                as={Col}
                sm={12}
                md={7}
                label="Data utworzenia"
                fromName="issueDateFrom"
                toName="issueDateTo"
                showValidationInfo={false}
                defaultFromValue={MainSetup.InvoicesFilterInitState.ISSUE_DATE_FROM}
                defaultToValue={MainSetup.InvoicesFilterInitState.ISSUE_DATE_TO}
            />
            <Form.Group as={Col} sm={12} md={8}>
                <Form.Label>Kontrakt</Form.Label>
                <ContractSelectFormElement
                    repository={contractsRepository}
                    name="_contract"
                    typesToInclude="our"
                    showValidationInfo={false}
                />
            </Form.Group>
            <Form.Group as={Col} sm={12} md={4}>
                <InvoiceStatusSelector multiple={true} showValidationInfo={false} />
            </Form.Group>
        </Row>
    );
}
