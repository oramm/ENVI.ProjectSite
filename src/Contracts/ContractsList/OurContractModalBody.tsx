import React, { useEffect, useRef, useState } from 'react';
import MainSetup from '../../React/MainSetupReact';
import { ContractTypeSelectFormElement, FileInput, PersonSelectFormElement } from '../../View/Resultsets/CommonComponents';
import { ContractModalBody, ProjectSelectorModalBody } from './ContractModalBody';
import { GeneralEditModalButton, ModalBodyProps, SpecificEditModalButtonProps, SpecificAddNewModalButtonProps, GeneralAddNewModalButton } from '../../View/GeneralModal';
import { contractsRepository, projectsRepository } from './ContractsSearch';
import { useFormContext } from '../../View/FormContext';
import { Form } from 'react-bootstrap';

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


    const ourIdValidation = (value: string) => {
        const parts = value.split('.');
        const typePart = parts[1];
        if (parts.length !== 3)
            return 'Oznaczenie musi zawierać dwie kropki'
        if (typePart !== _type.name)
            return 'Po pierwszej kropce musi następować tekst równy wybranemu typowi kontraktu';
        return true;
    };

    return (
        <>
            {
                (!props.isEditing) ?
                    <ContractTypeSelectFormElement
                        typesToInclude='our'
                        required={true}
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
                    {...register('ourId', {
                        required: { value: true, message: 'Oznaczenie jest wymagane' },
                        minLength: { value: 9, message: 'Oznaczenie musi mieć przynajmniej 9 znaków z kropkami' },
                        maxLength: { value: 11, message: 'Oznacznie może mieć maksymalnie 11 znaków' },
                        validate: ourIdValidation
                    })
                    }
                    disabled={_type === undefined} />
                {formState.errors?.ourId && (
                    <Form.Text className="text-danger">
                        {formState.errors.ourId.message as string}
                    </Form.Text>
                )}
            </Form.Group>
            <ContractModalBody
                {...props}
            />
            <PersonSelectFormElement
                label='Koordynator'
                name='_manager'
                repository={MainSetup.personsEnviRepository}
                required={true}
            />
            <PersonSelectFormElement
                label='Administrator'
                name='_admin'
                repository={MainSetup.personsEnviRepository}
                required={true}
            />
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
            }}
            buttonProps={{
                buttonCaption: "Rejestruj umowę ENVI",
                buttonVariant: "outline-success",
            }}
        />
    );
}