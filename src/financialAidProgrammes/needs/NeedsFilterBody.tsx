import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import { ErrorMessage, FinancialAidProgrammeSelector, MyAsyncTypeahead } from "../../View/Modals/CommonFormComponents";
import { clientsRepository, financialAidProgrammesRepository } from "../FinancialAidProgrammesController";

export function NeedsFilterBody() {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    return (
        <Row>
            <Form.Group as={Col} md={4}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <Form.Group as={Col} md={8}>
                <Form.Label>Klient</Form.Label>
                <MyAsyncTypeahead
                    name="_client"
                    labelKey="name"
                    repository={clientsRepository}
                    showValidationInfo={false}
                />
                <ErrorMessage errors={errors} name={"_client"} />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="_programme">
                <Form.Label>Program wsparcia</Form.Label>
                <FinancialAidProgrammeSelector
                    repository={financialAidProgrammesRepository}
                    showValidationInfo={false}
                />
            </Form.Group>
        </Row>
    );
}
