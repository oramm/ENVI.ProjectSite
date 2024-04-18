import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import {
    ApplicationCallSelector,
    ErrorMessage,
    FinancialAidProgrammeSelector,
    FocusAreaSelector,
    MyAsyncTypeahead,
} from "../../View/Modals/CommonFormComponents";
import { clientsRepository, financialAidProgrammesRepository } from "../FinancialAidProgrammesController";
import { applicationCallsRepository } from "../FocusAreas/ApplicationCalls/ApplicationCallsController";
import { focusAreasRepository } from "../FocusAreas/FocusAreasController";

export function NeedsFilterBody() {
    const {
        register,
        formState: { errors },
        watch,
    } = useFormContext();

    const _focusAreas = watch("_focusArea");
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
            <Form.Group as={Col} md={6} controlId="_financialAidProgramme">
                <Form.Label>Program wsparcia</Form.Label>
                <FinancialAidProgrammeSelector
                    repository={financialAidProgrammesRepository}
                    showValidationInfo={false}
                />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="_focusArea">
                <Form.Label>Obszar działania</Form.Label>
                <FocusAreaSelector repository={focusAreasRepository} showValidationInfo={false} />
            </Form.Group>
            <Form.Group as={Col} md={6} controlId="_applicationCall">
                <Form.Label>Nabór</Form.Label>
                <ApplicationCallSelector
                    repository={applicationCallsRepository}
                    showValidationInfo={false}
                    _focusArea={_focusAreas}
                />
            </Form.Group>
        </Row>
    );
}
