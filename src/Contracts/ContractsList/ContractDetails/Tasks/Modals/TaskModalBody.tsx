import React, { useEffect, useRef, useState } from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { Task } from '../../../../../../Typings/bussinesTypes';
import { ModalBodyProps } from '../../../../../View/Modals/ModalsTypes';
import { useFormContext } from '../../../../../View/Modals/FormContext';
import MainSetup from '../../../../../React/MainSetupReact';
import { ErrorMessage, PersonSelectFormElement, TaksStatusSelectFormElement } from '../../../../../View/Modals/CommonFormComponents';

export function TaskModalBody({ isEditing, initialData, contextData }: ModalBodyProps<Task>) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger } = useFormContext();
    const _case = initialData?._case || contextData;

    useEffect(() => {
        console.log('TaskModalBody useEffect', initialData);
        const resetData = {
            _case,
            name: initialData?.name,
            description: initialData?.description || '',
            deadline: initialData?.deadline || new Date().toISOString().slice(0, 10),
            daysToPay: initialData?.daysToPay,
            status: initialData?.status || MainSetup.TaskStatus.BACKLOG,
            _owner: initialData?._owner || MainSetup.getCurrentUserAsPerson(),
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);


    return (
        <>
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