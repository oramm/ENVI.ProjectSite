import React, { useEffect, useRef, useState } from 'react';
import { Alert, Col, Form, Row } from 'react-bootstrap';
import { Case } from '../../../../Typings/bussinesTypes';
import { ErrorMessage } from '../../../View/Modals/CommonFormComponents';
import { useFormContext } from '../../../View/Modals/FormContext';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';

export function CaseModalBody({ isEditing, initialData }: ModalBodyProps<Case>) {
    const { register, reset, setValue, watch, formState: { dirtyFields, errors, isValid }, trigger } = useFormContext();
    const _contract = watch('_contract');

    useEffect(() => {
        console.log('CaseModalBody useEffect', initialData);
        const resetData = {
            _milestone: initialData?._milestone,
            name: initialData?.name,
            description: initialData?.description || '',
        };
        reset(resetData);
        trigger();
    }, [initialData, reset]);


    return (
        <>
            {!initialData?._type.isUniquePerMilestone &&
                <Form.Group controlId="name">
                    <Form.Label>Nazwa sprawy</Form.Label>
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
            }
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
        </>
    );
}