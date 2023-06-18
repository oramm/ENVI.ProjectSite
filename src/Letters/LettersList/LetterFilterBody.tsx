import React from 'react';
import { ContractTypeSelectFormElement, ProjectSelector, ValueInPLNInput } from '../../View/Modals/CommonFormComponents';
import { Col, Form, Row } from 'react-bootstrap';
import { projectsRepository } from './LettersSearch';
import { useFormContext } from '../../View/Modals/FormContext';
import MainSetup from '../../React/MainSetupReact';
import { FilterBodyProps } from '../../View/Resultsets/FilterableTable/FilterPanel';

export function LettersFilterBody({ }: FilterBodyProps) {
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
                <Form.Label>Utworzono od</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={MainSetup.LettersFilterInitState.CREATION_DATE_FROM}
                    {...register('creationDateFrom')}
                />

            </Form.Group>
            <Form.Group as={Col}>
                <Form.Label>Utworzono do</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={MainSetup.LettersFilterInitState.CREATION_DATE_TO}
                    {...register('creationDateTo')}
                />
            </Form.Group>
            <Form.Group as={Col}>
                <ProjectSelector
                    name='_project'
                    repository={projectsRepository}
                    showValidationInfo={false}
                />
            </Form.Group>
        </Row>
    );
}