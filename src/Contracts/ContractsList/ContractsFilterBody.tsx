import React from 'react';
import { ContractTypeSelectFormElement, ProjectSelector } from '../../View/Modals/CommonFormComponents';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormContext } from '../../View/Modals/FormContext';
import ToolsDate from '../../React/ToolsDate';
import { projectsRepository } from './ContractsController';

export function ContractsFilterBody() {
    const { register } = useFormContext();

    return (
        <Row xl={5} md={3} xs={1}>
            <Form.Group as={Col}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Wpisz tekst"
                    {...register('searchText')}
                />
            </Form.Group>
            <Form.Group as={Col}>
                <Form.Label>Początek od</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={ToolsDate.addDays(new Date(), -365).toISOString().slice(0, 10)}
                    {...register('startDateFrom')}
                />

            </Form.Group>
            <Form.Group as={Col}>
                <Form.Label>Początek do</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={ToolsDate.addDays(new Date(), +600).toISOString().slice(0, 10)}
                    {...register('startDateTo')}
                />
            </Form.Group>
            <Form.Group as={Col}>
                <ProjectSelector
                    repository={projectsRepository}
                    showValidationInfo={false}
                />
            </Form.Group>
            <Form.Group as={Col}>
                <ContractTypeSelectFormElement
                    name='_contractType'
                    showValidationInfo={false}
                />
            </Form.Group>
        </Row>
    );
}