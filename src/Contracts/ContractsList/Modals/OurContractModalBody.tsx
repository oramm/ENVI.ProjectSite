import React, { useEffect, useRef, useState } from 'react';
import MainSetup from '../../../React/MainSetupReact';
import { CitySelectFormElement, ContractTypeSelectFormElement, ErrorMessage, MyAsyncTypeahead, PersonSelectFormElement } from '../../../View/Modals/CommonFormComponents';
import { ContractModalBody, ProjectSelectorModalBody } from './ContractModalBody';
import { useFormContext } from '../../../View/Modals/FormContext';
import { Col, Form, Row } from 'react-bootstrap';
import { ModalBodyProps } from '../../../View/Modals/ModalsTypes';
import { citiesRepository, entitiesRepository } from '../ContractsController';

export function OurContractModalBody(props: ModalBodyProps) {
    const { initialData, isEditing } = props;
    const { register, trigger, setValue, watch, formState: { errors }, control } = useFormContext();
    const _type = watch('_type');

    useEffect(() => {
        setValue('_type', initialData?._type, { shouldValidate: true });
        setValue('ourId', initialData?.ourId || '', { shouldValidate: true });
        setValue('_city', initialData?._city, { shouldValidate: true });
        setValue('_admin', initialData?._admin, { shouldValidate: true });
        setValue('_manager', initialData?._manager, { shouldValidate: true });
        setValue('_employers', initialData?._employers, { shouldValidate: true });
    }, [initialData, setValue]);

    console.log('OurContractModalBody _city:', initialData?._city?.name);

    return (<>
        <Row>
            <Form.Group as={Col} controlId="_city">
                <Form.Label>Miasto</Form.Label>
                <CitySelectFormElement
                    repository={citiesRepository}
                    showValidationInfo={true}
                    allowNew={true}
                />
            </Form.Group>
            {!isEditing &&
                <Form.Group as={Col} controlId="_type">
                    <ContractTypeSelectFormElement
                        typesToInclude='our'
                    />
                </Form.Group>
            }
        </Row>
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
            </Form.Group>
        </Row>
    </>
    );
}