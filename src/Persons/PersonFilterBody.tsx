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
            {/* 3 + 3 + 3 + 3 = 12: przy czterech kolumnach „Doświadczenie" mieści się w tej
                samej linii. Z podmiotem na 4 suma wynosiła 13 i ostatnie pole spadało do drugiej
                linii, a filtr zjadał wysokość okna (uwaga ownera 2026-09-04). */}
            <Form.Group as={Col} md={3}>
                <Form.Label>Podmiot</Form.Label>
                <EntitySelector
                    name="_entities"
                    multiple={true}
                    showValidationInfo={false}
                />
            </Form.Group>
            <Form.Group as={Col} md={3}>
                <SkillSelector />
            </Form.Group>
            <Form.Group as={Col} md={3}>
                <Form.Label>Doświadczenie</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Stanowisko, firma..."
                    {...register("experienceText")}
                />
            </Form.Group>
        </Row>
    );
}
