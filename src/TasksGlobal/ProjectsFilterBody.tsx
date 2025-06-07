import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import MainSetup from "../React/MainSetupReact";
import { useFormContext } from "../View/Modals/FormContext";
import { RadioButtonGroup } from "../View/Modals/CommonFormComponents/GenericComponents";

export function ProjectsFilterBody() {
    const { register } = useFormContext();

    return (
        <>
            <Row>
                <Form.Group as={Col} sm="12">
                    <RadioButtonGroup
                        name="status"
                        options={[
                            { value: "ACTIVE", name: "Aktywny" },
                            { value: MainSetup.ProjectStatuses.FINISHED, name: MainSetup.ProjectStatuses.FINISHED },
                        ]}
                    />
                </Form.Group>{" "}
                <Form.Group as={Col} sm="12">
                    <Form.Label>Szukana fraza</Form.Label>
                    <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
                </Form.Group>
            </Row>
        </>
    );
}
