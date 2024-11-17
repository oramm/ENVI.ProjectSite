import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import MainSetup from "../../React/MainSetupReact";
import { OfferBondStatusSelector, OfferStatusSelector } from "../../View/Modals/CommonFormComponents/StatusSelectors";
import { DateRangeInput } from "../../View/Modals/CommonFormComponents/GenericComponents";

export function OffersFilterBody() {
    const { register } = useFormContext();

    return (
        <Row>
            <Form.Group as={Col} md={3}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <DateRangeInput
                as={Col}
                sm={12}
                md={6}
                lg={4}
                label="Termin składania"
                fromName="submissionDeadlineFrom"
                toName="submissionDeadlineTo"
                showValidationInfo={false}
                defaultFromValue={MainSetup.OffersFilterInitState.SUBMISSION_FROM}
                defaultToValue={MainSetup.OffersFilterInitState.SUBMISSION_TO}
            />
            <Form.Group as={Col} md={2}>
                <OfferStatusSelector multiple={true} showValidationInfo={false} label="Status oferty" />
            </Form.Group>
            <Form.Group as={Col} md={2}>
                <OfferBondStatusSelector
                    name="offerBondStatuses"
                    label="Status wadium"
                    showValidationInfo={false}
                    multiple={true}
                />
            </Form.Group>
        </Row>
    );
}
