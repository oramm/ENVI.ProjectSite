import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";
import MainSetup from "../../../React/MainSetupReact";
import { useFormContext } from "../../../View/Modals/FormContext";
import { OfferInvitationMailStatusSelector } from "../../../View/Modals/CommonFormComponents/StatusSelectors";

export function MailInvitationsFilterBody() {
    const { register, reset, trigger } = useFormContext();
    useEffect(() => {
        const resetData = {
            searchText: "ofert",
            statuses: [MainSetup.OfferInvitationMailStatus.NEW, MainSetup.OfferInvitationMailStatus.TO_OFFER],
        };
        reset(resetData);
        trigger();
    }, []);

    return (
        <Row>
            <Form.Group as={Col} md={3}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <OfferInvitationMailStatusSelector as={Col} label="Status" showValidationInfo={false} multiple={true} />
        </Row>
    );
}
