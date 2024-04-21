import React from "react";
import {
    ContractTypeSelectFormElement,
    ProjectSelector,
} from "../../View/Modals/CommonFormComponents/BussinesObjectSelectors";
import { Col, Form, Row } from "react-bootstrap";
import { useFormContext } from "../../View/Modals/FormContext";
import ToolsDate from "../../React/ToolsDate";
import { projectsRepository } from "./ContractsController";
import { ContractStatusSelectFormElement } from "../../View/Modals/CommonFormComponents/StatusSelectors";

export function ContractsFilterBody() {
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
                <Form.Label>Koniec od</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={ToolsDate.addDays(new Date(), -60).toISOString().slice(0, 10)}
                    {...register("endDateFrom")}
                />
            </Form.Group>
            <Form.Group as={Col} xl={2}>
                <Form.Label>Koniec do</Form.Label>
                <Form.Control type="date" defaultValue={undefined} {...register("endDateTo")} />
            </Form.Group>
            <Form.Group as={Col} xl={2}>
                <ContractStatusSelectFormElement name="status" showValidationInfo={false} />
            </Form.Group>
        </Row>
    );
}
