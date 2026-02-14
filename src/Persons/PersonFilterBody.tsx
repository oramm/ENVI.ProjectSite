import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../View/Modals/FormContext";
import { entitiesRepository } from "./PersonsController";
import { ErrorMessage, MyAsyncTypeahead } from "../View/Modals/CommonFormComponents/GenericComponents";
import { EntitySelector, SkillSelector } from "../View/Modals/CommonFormComponents/BussinesObjectSelectors";

export function PersonsFilterBody() {
    const {
        register,
        formState: { errors },
    } = useFormContext();

    return (
        <Row xl={12} md={6} xs={12}>
            <Form.Group as={Col} md={3}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <Form.Group as={Col} md={4}>
                <Form.Label>Podmiot</Form.Label>
                <EntitySelector
                    name="_entities"
                    multiple={true}
                    showValidationInfo={false}
                />
            </Form.Group>
            <Form.Group as={Col} md={5}>
                <SkillSelector />
            </Form.Group>
        </Row>
    );
}
