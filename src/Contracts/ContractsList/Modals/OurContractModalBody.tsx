import React, { useEffect, useRef, useState } from 'react';
import MainSetup from '../../../React/MainSetupReact';
import { ContractTypeSelectFormElement, FileInput, PersonSelectFormElement } from '../../../View/Resultsets/CommonComponents';
import { ContractModalBody, ProjectSelectorModalBody } from './ContractModalBody';
import { GeneralEditModalButton, ModalBodyProps, SpecificEditModalButtonProps, SpecificAddNewModalButtonProps, GeneralAddNewModalButton } from '../../../View/GeneralModal';
import { contractsRepository, projectsRepository } from '../ContractsSearch';
import { useFormContext } from '../../../View/FormContext';
import { Col, Form, Row } from 'react-bootstrap';
import { ourContractValidationSchema } from './ContractValidationSchema';

export function OurContractModalBody(props: ModalBodyProps) {
    const initialData = props.initialData;
    const { register, setValue, watch, formState, control } = useFormContext();
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
                (!props.isEditing) ?
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
                    isInvalid={!!formState.errors?.ourId}
                    isValid={!formState.errors?.ourId}
                    disabled={_type === undefined}
                    {...register('ourId')}
                />
                {formState.errors?.ourId && (
                    <Form.Text className="text-danger">
                        {formState.errors.ourId.message as string}
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
                        required={true}
                    />
                </Form.Group>
                <Form.Group as={Col} controlId="_admin">
                    <PersonSelectFormElement
                        label='Administrator'
                        name='_admin'
                        repository={MainSetup.personsEnviRepository}
                        required={true}
                    />
                </Form.Group>
            </Row>
            <FileInput
                fieldName="exampleFile"
                acceptedFileTypes="application/msword, application/vnd.ms-excel, application/pdf"
            />
        </>
    );
}

export function OurContractEditModalButton({
    modalProps: { onEdit, initialData, },
}: SpecificEditModalButtonProps) {
    return (
        <GeneralEditModalButton
            modalProps={{
                onEdit: onEdit,
                ModalBodyComponent: OurContractModalBody,
                modalTitle: "Edycja umowy",
                repository: contractsRepository,
                initialData: initialData,
                validationSchema: ourContractValidationSchema
            }}
            buttonProps={{
                buttonVariant: "outline-success",
            }}
        />
    );
}

export function OurContractAddNewModalButton({
    modalProps: { onAddNew },
}: SpecificAddNewModalButtonProps) {
    return (
        <GeneralAddNewModalButton
            modalProps={{
                onAddNew: onAddNew,
                ModalBodyComponent: ProjectSelectorModalBody,
                additionalModalBodyProps: { SpecificContractModalBody: OurContractModalBody },
                modalTitle: "Nowa umowa ENVI",
                repository: contractsRepository,
                validationSchema: ourContractValidationSchema
            }}
            buttonProps={{
                buttonCaption: "Rejestruj umowę ENVI",
                buttonVariant: "outline-success",
            }}
        />
    );
}