import React, { useEffect } from 'react';
import { CaseSelectMenuElement, ContractSelectFormElement, ContractTypeSelectFormElement, ProjectSelector, ValueInPLNInput } from '../../View/Modals/CommonFormComponents';
import { Col, Form, Row } from 'react-bootstrap';
import { useFormContext } from '../../View/Modals/FormContext';
import MainSetup from '../../React/MainSetupReact';
import { FilterBodyProps } from '../../View/Resultsets/FilterableTable/FilterPanel';
import { casesRepository, contractsRepository, projectsRepository } from './LettersController';

export function LettersFilterBody({ }: FilterBodyProps) {
    const { register, watch, setValue } = useFormContext();
    const _project = watch('_project');
    const _contract = watch('_contract');
    const _case = watch('_case');

    useEffect(() => {
        setValue('_contract', undefined);
        setValue('_case', undefined);
    }, [_project]);

    useEffect(() => {
        setValue('_case', undefined);
    }, [_contract]);

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
            <Form.Group as={Col}>
                <Form.Label>Kontrakt</Form.Label>
                <ContractSelectFormElement
                    repository={contractsRepository}
                    name='_contract'
                    typesToInclude='all'
                    showValidationInfo={false}
                    _project={_project}
                />
            </Form.Group>
            {_contract && <Form.Group as={Col}>
                <Form.Label>Sprawa</Form.Label>
                <CaseSelectMenuElement
                    name='_case'
                    repository={casesRepository}
                    showValidationInfo={false}
                    _contract={_contract}
                    multiple={false}
                />
            </Form.Group>}
        </Row>
    );
}