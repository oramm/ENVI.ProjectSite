import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";

export function CarsFilterBody() {
    const { register } = useFormContext();

    return (
        <Row xl={12} md={6} xs={12}>
            <Form.Group as={Col} md={4}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Marka, model lub nr rejestracyjny" {...register("searchText")} />
            </Form.Group>
        </Row>
    );
}
