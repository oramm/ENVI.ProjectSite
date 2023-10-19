import React, { useEffect, useRef, useState } from 'react';
import MainSetup from '../../../React/MainSetupReact';
import { ContractTypeSelectFormElement, ErrorMessage, MyAsyncTypeahead, PersonSelectFormElement } from '../../../View/Modals/CommonFormComponents';
import { ContractModalBody, ProjectSelectorModalBody } from './ContractModalBody';
import { useFormContext } from '../../../View/Modals/FormContext';
import { Col, Form, Row } from 'react-bootstrap';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import { entitiesRepository } from '../ContractsController';

export function OurContractModalBody(props: ModalBodyProps) {
    const { initialData, isEditing } = props;
    const { register, trigger, setValue, watch, formState: { errors }, control } = useFormContext();
    const _type = watch('_type');

    useEffect(() => {
        setValue('_type', initialData?._type, { shouldValidate: true });
        setValue('ourId', initialData?.ourId || '', { shouldValidate: true });

        setValue('_admin', initialData?._admin, { shouldValidate: true });
        setValue('_manager', initialData?._manager, { shouldValidate: true });
    }, [initialData, setValue]);

    return (
        <>
            {
                (!isEditing) ?
                    <ContractTypeSelectFormElement
                        typesToInclude='our'
                    />
                    : null
            }
            <Form.Group controlId="ourId">
                <Form.Label>Oznaczenie ENVI</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Oznaczenie ENVI"
                    isInvalid={!!errors?.ourId}
                    isValid={!errors?.ourId}
                    disabled={_type === undefined}
                    {...register('ourId')}
                />
                {errors?.ourId && (
                    <Form.Text className="text-danger">
                        {errors.ourId.message as string}
                    </Form.Text>
                )}
            </Form.Group>
            <ContractModalBody
                {...props}
            />
            <Row>
                <Form.Group as={Col} controlId="_manager">
                    <PersonSelectFormElement
                        label='Koordynator'
                        name='_manager'
                        repository={MainSetup.personsEnviRepository}
                    />
                </Form.Group>
                <Form.Group as={Col} controlId="_admin">
                    <PersonSelectFormElement
                        label='Administrator'
                        name='_admin'
                        repository={MainSetup.personsEnviRepository}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Zamawiający</Form.Label>
                    <MyAsyncTypeahead
                        name='_employers'
                        labelKey='name'
                        repository={entitiesRepository}
                        multiple={true}
                    />
                    <ErrorMessage errors={errors} name='_employers' />
                </Form.Group>
            </Row>
        </>
    );
}