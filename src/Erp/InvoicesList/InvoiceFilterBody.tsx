import React from 'react';
import { ContractSelectFormElement, InvoiceStatusSelectFormElement } from '../../View/Modals/CommonFormComponents';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormContext } from '../../View/Modals/FormContext';
import MainSetup from '../../React/MainSetupReact';
import { contractsRepository } from './InvoicesController';

export function InvoicesFilterBody() {
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
                <Form.Label>Sprzedaż od</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={MainSetup.InvoicesFilterInitState.ISSUE_DATE_FROM}
                    {...register('issueDateFrom')}
                />

            </Form.Group>
            <Form.Group as={Col}>
                <Form.Label>Sprzedaż do</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={MainSetup.InvoicesFilterInitState.ISSUE_DATE_TO}
                    {...register('issueDateTo')}
                />
            </Form.Group>
            <Form.Group as={Col}>
                <Form.Label>Kontrakt</Form.Label>
                <ContractSelectFormElement
                    repository={contractsRepository}
                    name='_contract'
                    typesToInclude='our'
                    showValidationInfo={false}
                />
            </Form.Group>
            <Form.Group as={Col}>
                <InvoiceStatusSelectFormElement showValidationInfo={false} />
            </Form.Group>
        </Row>
    );
}