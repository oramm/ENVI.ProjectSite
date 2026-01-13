import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useContract } from "../Contracts/ContractsList/ContractContext";
import MainSetup from "../React/MainSetupReact";
import { ContractSelector, PersonSelectorPreloaded } from "../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { ContractStatusSelector } from "../View/Modals/CommonFormComponents/StatusSelectors";

export function TasksGlobalFilterBody() {
    const { project } = useContract();
    return (
        <Row>
            <Form.Group as={Col} md={6} controlId="_contract">
                <Form.Label>Kontrakt</Form.Label>
                <ContractSelector showValidationInfo={false} _project={project} />
            </Form.Group>
            <Form.Group as={Col} md={3} controlId="_owner">
                <PersonSelectorPreloaded
                    showValidationInfo={false}
                    repository={MainSetup.personsEnviRepository}
                    name="_owner"
                    label="Właściciel"
                />
            </Form.Group>
            <Form.Group as={Col} md={3}>
                <ContractStatusSelector showValidationInfo={false} multiple={true} label="Statusy kontratu" />
            </Form.Group>
        </Row>
    );
}
