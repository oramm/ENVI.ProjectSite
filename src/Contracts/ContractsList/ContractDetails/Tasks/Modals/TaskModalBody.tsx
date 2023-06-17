import React, { useEffect, useRef, useState } from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { Task } from '../../../../../../Typings/bussinesTypes';
import { ModalBodyProps } from '../../../../../View/Modals/ModalsTypes';
import { useFormContext } from '../../../../../View/Modals/FormContext';
import { casesRepository, contractsRepository } from '../../../ContractsController';
import MainSetup from '../../../../../React/MainSetupReact';
import { CaseSelectMenuElement, ContractSelectFormElement, ErrorMessage, PersonSelectFormElement, TaksStatusSelectFormElement } from '../../../../../View/Modals/CommonFormComponents';

export function TaskModalBody({ isEditing, initialData }: ModalBodyProps<Task>) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger } = useFormContext();
    const _contract = watch('_contract');

    useEffect(() => {
        console.log('TaskModalBody useEffect', initialData);
        const resetData = {
            _contract: initialData?._contract,
            name: initialData?.name,
            description: initialData?.description || '',
            deadline: initialData?.deadline || new Date().toISOString().slice(0, 10),
            daysToPay: initialData?.daysToPay,
            status: initialData?.status || MainSetup.TaskStatuses.BACKLOG,
            _owner: initialData?._owner || MainSetup.getCurrentUserAsPerson(),
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);


    return (
        <>

            {!isEditing &&
                <>
                    <Form.Group controlId="_contract">
                        <Form.Label>Wybierz kontrakt</Form.Label>
                        <ContractSelectFormElement
                            name='_contract'
                            repository={contractsRepository}
                            typesToInclude='our'
                            readOnly={!isEditing}
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Dotyczy sprawy</Form.Label>
                        {_contract ?
                            <CaseSelectMenuElement
                                name='_cases'
                                repository={casesRepository}
                                _contract={_contract}
                                readonly={!_contract}
                            />
                            :
                            <Alert variant='warning'>Wybierz kontrakt, by przypisać do sprawy</Alert>
                        }
                    </Form.Group>
                </>
            }
            <Form.Group controlId="name">
                <Form.Label>Nazwa zadania</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Podaj nazwę"
                    isInvalid={!!errors?.name}
                    isValid={!errors?.name}
                    {...register('name')}
                />
                <ErrorMessage name='name' errors={errors} />
            </Form.Group>
            <Form.Group controlId="description">
                <Form.Label>Uwagi</Form.Label>
                <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Dodaj komentarz"
                    isValid={!errors?.description}
                    isInvalid={!!errors?.description}
                    {...register('description')}
                />
                <ErrorMessage name='description' errors={errors} />
            </Form.Group>
            <Form.Group controlId="deadline">
                <Form.Label>Termin</Form.Label>
                <Form.Control
                    type="date"
                    isValid={!errors.deadline}
                    isInvalid={!!errors.deadline}
                    {...register('deadline')}
                />
                <ErrorMessage name='deadline' errors={errors} />
            </Form.Group>
            <TaksStatusSelectFormElement />
            <Form.Group controlId="_owner">
                <PersonSelectFormElement
                    label='Właściciel'
                    name='_owner'
                    repository={MainSetup.personsEnviRepository}
                />
            </Form.Group>
        </>
    );
}