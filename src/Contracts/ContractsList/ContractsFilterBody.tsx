import React, { useEffect, useRef, useState } from 'react';
import { ContractStatus, ContractTypeSelectFormElement, MyAsyncTypeahead, ProjectSelector, ValueInPLNInput } from '../../View/Resultsets/CommonComponents';
import { Form } from 'react-bootstrap';
import { contractsRepository, projectsRepository } from './ContractsSearch';
import { useFormContext } from '../../View/FormContext';
import ToolsDate from '../../React/ToolsDate';
import { FilterBodyProps } from '../../View/Resultsets/FilterableTable';



export function ContractsFilterBody({ }: FilterBodyProps) {
    const { register } = useFormContext();

    return (
        <>
            <Form.Group>
                <Form.Label>Szukana fraza</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Wpisz tekst"
                    {...register('searchText')}
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Początek od</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={ToolsDate.addDays(new Date(), -365).toISOString().slice(0, 10)}
                    {...register('startDate')}
                />

            </Form.Group>
            <Form.Group>
                <Form.Label>Początek do</Form.Label>
                <Form.Control
                    type="date"
                    defaultValue={ToolsDate.addDays(new Date(), +600).toISOString().slice(0, 10)}
                    {...register('endDate')}
                />
            </Form.Group>
            <ProjectSelector
                repository={projectsRepository}
                required={false}
                showValidationInfo={false}
            />

            <ContractTypeSelectFormElement
                showValidationInfo={false}
            />
        </>
    );
}