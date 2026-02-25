import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../../../View/Modals/FormContext";

export function MeetingNotesFilterBody() {
    const { register } = useFormContext();
    return (
        <Row xl={5} md={3} xs={1}>
            <Form.Group as={Col}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <Form.Group as={Col}>
                <Form.Label>Data spotkania od</Form.Label>
                <Form.Control type="date" {...register("meetingDateFrom")} />
            </Form.Group>
            <Form.Group as={Col}>
                <Form.Label>Data spotkania do</Form.Label>
                <Form.Control type="date" {...register("meetingDateTo")} />
            </Form.Group>
        </Row>
    );
}
