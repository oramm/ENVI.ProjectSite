import React from 'react';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormContext } from '../../../../View/Modals/FormContext';
import { CaseSelectMenuElement, PersonSelectFormElement, TaksStatusSelectFormElement } from '../../../../View/Modals/CommonFormComponents';
import { useContract } from '../../ContractContext';
import ToolsDate from '../../../../React/ToolsDate';
import { casesRepository } from '../../ContractsController';
import MainSetup from '../../../../React/MainSetupReact';

export function TasksFilterBodyCommonFields() {
    const { register } = useFormContext();
    const { contract } = useContract();
    return (
        <Row xl={6} md={3} xs={1}>
            <Form.Group as={Col}>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Wpisz tekst"
                    {...register('searchText')}
                />
            </Form.Group>
            <Form.Group as={Col}>
                <Form.Label>Zakończenie od</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={ToolsDate.addDays(new Date(), -365).toISOString().slice(0, 10)}
                    {...register('deadlineFrom')}
                />

            </Form.Group>
            <Form.Group as={Col}>
                <Form.Label>Zakończenie do</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={ToolsDate.addDays(new Date(), +600).toISOString().slice(0, 10)}
                    {...register('deadlineTo')}
                />
            </Form.Group>
            <Form.Group as={Col}>
                <Form.Label>Sprawa</Form.Label>
                <CaseSelectMenuElement
                    repository={casesRepository}
                    showValidationInfo={false}
                    _contract={contract}
                />
            </Form.Group>
            <Form.Group as={Col}>
                <TaksStatusSelectFormElement
                    showValidationInfo={false}
                />
            </Form.Group >
            <Form.Group as={Col}>
                <PersonSelectFormElement
                    showValidationInfo={false}
                    repository={MainSetup.personsEnviRepository}
                    name='_owner'
                    label='Właściciel'
                />
            </Form.Group>
        </Row >
    );
}