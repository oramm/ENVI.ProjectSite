import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import { FocusAreaSelector } from "../../../View/Modals/CommonFormComponents";
import { focusAreasRepository } from "../FocusAreasController";

export function ApplicationCallsFilterBody() {
    const { register } = useFormContext();

    return (
        <Row>
            <Form.Group as={Col} md={4}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="focusAreaId">
                <Form.Label>Obszar interwencji</Form.Label>
                <FocusAreaSelector
                    repository={focusAreasRepository}
                    showValidationInfo={false}
                    {...register("focusAreaId")}
                />
            </Form.Group>
        </Row>
    );
}
