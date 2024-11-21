import React, { useEffect } from "react";
import { Col, Form, Row } from "react-bootstrap";

import { DateRangeInput } from "../../../View/Modals/CommonFormComponents/GenericComponents";
import MainSetup from "../../../React/MainSetupReact";
import { useFormContext } from "../../../View/Modals/FormContext";

export function MailsFilterBody() {
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
                label="Data wpływu"
                fromName="incomingDateFrom"
                toName="incomingDateTo"
                showValidationInfo={false}
                defaultFromValue={MainSetup.OffersInvitationMailFilterInitState.INCOMING_DATE_FROM}
                defaultToValue={MainSetup.OffersInvitationMailFilterInitState.INCOMING_DATE_TO}
            />
        </Row>
    );
}
