import React from 'react';
import { ContractSelectFormElement, InvoiceStatusSelectFormElement } from '../../View/Modals/CommonFormComponents';
import { Col, Form, Row } from 'react-bootstrap';
import { contractsRepository, projectsRepository } from './InvoicesSearch';
import { useFormContext } from '../../View/Modals/FormContext';
import ToolsDate from '../../React/ToolsDate';
import { FilterBodyProps } from '../../View/Resultsets/FilterableTable';
import MainSetup from '../../React/MainSetupReact';


export function InvoicesFilterBody({ }: FilterBodyProps) {
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
                <Form.Label>Wystawiono od</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={MainSetup.InvoicesFilterInitState.ISSUE_DATE_FROM}
                    {...register('issueDateFrom')}
                />

            </Form.Group>
            <Form.Group as={Col}>
                <Form.Label>Wystawiono do</Form.Label>
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