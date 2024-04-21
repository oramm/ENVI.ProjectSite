import React from "react";
import { Col, Form, Row } from "react-bootstrap";
import ToolsDate from "../../../React/ToolsDate";
import {
    ProjectSelector,
    ContractTypeSelectFormElement,
} from "../../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { useFormContext } from "../../../View/Modals/FormContext";
import { projectsRepository } from "../ContractsController";
import { SecurityStatusSelectFormElement } from "../../../View/Modals/CommonFormComponents/StatusSelectors";

export function SecuritiesFilterBody() {
    const { register } = useFormContext();

    return (
        <Row xl={12} md={3} xs={1}>
            <Form.Group as={Col} xl={2}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control type="text" placeholder="Wpisz tekst" {...register("searchText")} />
            </Form.Group>
            <Form.Group as={Col} xl={5}>
                <ProjectSelector repository={projectsRepository} showValidationInfo={false} />
            </Form.Group>
            <Form.Group as={Col} xl={5}>
                <ContractTypeSelectFormElement name="_contractType" showValidationInfo={false} />
            </Form.Group>

            <Form.Group as={Col} xl={2}>
                <Form.Label>Początek od</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={ToolsDate.addDays(new Date(), -365).toISOString().slice(0, 10)}
                    {...register("startDateFrom")}
                />
            </Form.Group>
            <Form.Group as={Col} xl={2}>
                <Form.Label>Początek do</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={ToolsDate.addDays(new Date(), +600).toISOString().slice(0, 10)}
                    {...register("startDateTo")}
                />
            </Form.Group>
            <Form.Group as={Col} xl={2}>
                <Form.Label>70% wygasa od</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={ToolsDate.addDays(new Date(), -60).toISOString().slice(0, 10)}
                    {...register("firstPartExpiryDateFrom")}
                />
            </Form.Group>
            <Form.Group as={Col} xl={2}>
                <Form.Label>70% wygasa do</Form.Label>
                <Form.Control type="date" defaultValue={undefined} {...register("firstPartExpiryDateTo")} />
            </Form.Group>
            <Form.Group as={Col} xl={2}>
                <Form.Label>30% wygasa od</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={ToolsDate.addDays(new Date(), -60).toISOString().slice(0, 10)}
                    {...register("secondPartExpiryDateFrom")}
                />
            </Form.Group>
            <Form.Group as={Col} xl={2}>
                <Form.Label>30% wygasa do</Form.Label>
                <Form.Control type="date" defaultValue={undefined} {...register("secondPartExpiryDateTo")} />
            </Form.Group>
            <SecurityStatusSelectFormElement name="status" showValidationInfo={false} />
        </Row>
    );
}
