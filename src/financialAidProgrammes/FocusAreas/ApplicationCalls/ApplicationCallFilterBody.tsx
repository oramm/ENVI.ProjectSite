import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import {
    ApplicationCallStatusSelector,
    FinancialAidProgrammeSelector,
    FocusAreaSelector,
} from "../../../View/Modals/CommonFormComponents";
import { focusAreasRepository } from "../FocusAreasController";
import { financialAidProgrammesRepository } from "../../FinancialAidProgrammesController";

export function ApplicationCallsFilterBody() {
    const { register, watch } = useFormContext();
    const _financialAidProgramme = watch("_financialAidProgramme");
    return (
        <Row>
            <Form.Group as={Col} md={4}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="_financialAidProgramme">
                <Form.Label>Program wsparcia</Form.Label>
                <FinancialAidProgrammeSelector
                    repository={financialAidProgrammesRepository}
                    showValidationInfo={false}
                />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="_focusArea">
                <Form.Label>Obszar interwencji</Form.Label>
                <FocusAreaSelector
                    repository={focusAreasRepository}
                    _financialAidProgramme={_financialAidProgramme}
                    showValidationInfo={false}
                />
            </Form.Group>
            <Form.Group as={Col} md={2} controlId="status">
                <ApplicationCallStatusSelector showValidationInfo={false} />
            </Form.Group>
        </Row>
    );
}
