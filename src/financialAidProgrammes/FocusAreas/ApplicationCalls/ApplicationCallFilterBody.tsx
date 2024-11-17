import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../View/Modals/FormContext";
import {
    FinancialAidProgrammeSelector,
    FocusAreaSelector,
    FocusAreaSelectorPrefilled,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { focusAreasRepository } from "../FocusAreasController";
import { financialAidProgrammesRepository } from "../../FinancialAidProgrammesController";
import { ApplicationCallStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";

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
                <FocusAreaSelectorPrefilled
                    repository={focusAreasRepository}
                    _financialAidProgramme={_financialAidProgramme}
                    showValidationInfo={false}
                />
            </Form.Group>
            <Form.Group as={Col} md={2} controlId="status">
                <ApplicationCallStatusSelector multiple={true} showValidationInfo={false} />
            </Form.Group>
        </Row>
    );
}
