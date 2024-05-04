import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import MainSetup from "../../React/MainSetupReact";
import { OfferBondStatusSelector, OfferStatusSelector } from "../../View/Modals/CommonFormComponents/StatusSelectors";

export function OffersFilterBody() {
    const { register, watch, setValue } = useFormContext();

    return (
        <Row md={6} xs={12}>
            <Form.Group as={Col} md={4}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <Form.Group as={Col} md={2}>
                <Form.Label>Składanie od</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={MainSetup.OffersFilterInitState.SUBMISSION_FROM}
                    {...register("submissionDeadlineFrom")}
                />
            </Form.Group>
            <Form.Group as={Col} md={2}>
                <Form.Label>Składanie do</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={MainSetup.OffersFilterInitState.SUBMISSION_TO}
                    {...register("submissionDeadlineTo")}
                />
            </Form.Group>
            <Form.Group as={Col} md={2}>
                <OfferStatusSelector showValidationInfo={false} />
            </Form.Group>
            <Form.Group as={Col} md={2}>
                <OfferBondStatusSelector showValidationInfo={false} name="_offerBond.status" />
            </Form.Group>
        </Row>
    );
}
